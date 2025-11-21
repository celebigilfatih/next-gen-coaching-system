const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');
const bcrypt = require('./apps/backend/node_modules/bcrypt');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ngcs'
    }
  }
});

async function ensureAdminUser() {
  try {
    console.log('🔍 Checking for admin user...\n');

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ngcs.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      console.log('\n🔑 Login credentials:');
      console.log('   Email: admin@ngcs.com');
      console.log('   Password: admin123');
      console.log('\n🌐 Login URL: http://localhost:3500/signin');
    } else {
      console.log('⚠️  Admin user not found. Creating...\n');

      // Create admin user
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@ngcs.com',
          name: 'Admin User',
          passwordHash: passwordHash,
          role: 'ADMIN'
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
      console.log('\n🔑 Login credentials:');
      console.log('   Email: admin@ngcs.com');
      console.log('   Password: admin123');
      console.log('\n🌐 Login URL: http://localhost:3500/signin');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ensureAdminUser();
