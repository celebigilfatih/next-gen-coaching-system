#!/bin/bash

# NGCS Season Planner - Quick Start Script
# Bu script sistemin hızlıca başlatılması için gerekli komutları içerir

echo "🚀 NGCS Sezon Planlayıcı - Hızlı Başlatma"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "apps/backend" ] || [ ! -d "apps/frontend" ]; then
    print_error "Bu script'i proje kök dizininde çalıştırmalısınız!"
    exit 1
fi

echo "📋 Kurulum Adımları:"
echo ""

# Step 1: Database Migration
print_step "Adım 1: Veritabanı migration'ı çalıştırılıyor..."
cd apps/backend
npm run prisma:migrate -- --name add_season_planner
if [ $? -eq 0 ]; then
    print_step "Migration başarılı!"
else
    print_warning "Migration atlandı veya hata oluştu"
fi

# Step 2: Generate Prisma Client
print_step "Adım 2: Prisma client oluşturuluyor..."
npm run prisma:generate
if [ $? -eq 0 ]; then
    print_step "Prisma client başarıyla oluşturuldu!"
else
    print_error "Prisma client oluşturulamadı!"
    exit 1
fi

# Step 3: Seed Data
print_step "Adım 3: Demo veri oluşturuluyor..."
npm run prisma:seed:season
if [ $? -eq 0 ]; then
    print_step "Seed data başarıyla oluşturuldu!"
else
    print_warning "Seed data oluşturulamadı (zaten mevcut olabilir)"
fi

cd ../..

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "🎯 Sistemi Başlatmak İçin:"
echo "   Backend:  cd apps/backend && npm run start:dev"
echo "   Frontend: cd apps/frontend && npm run dev"
echo ""
echo "🌐 URL'ler:"
echo "   Backend:  http://localhost:4000"
echo "   Frontend: http://localhost:3001"
echo ""
echo "👤 Giriş Bilgileri:"
echo "   Email: coach@demo.com"
echo "   Şifre: demo123"
echo ""
echo "📊 Sayfalar:"
echo "   Sezon Planlayıcı: http://localhost:3001/season-planner"
echo "   A Takım:          http://localhost:3001/a-team"
echo ""
print_warning "NOT: Her iki sunucuyu da ayrı terminal pencerelerinde çalıştırın!"
