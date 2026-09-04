import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          // Use internal Docker network URL when running in container
          const apiUrl = process.env.NEXTAUTH_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:4000";
          console.log('Auth attempting to connect to:', apiUrl);
          const res = await fetch(apiUrl + "/auth/login", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          console.log('Auth response status:', res.status);
          if (!res.ok) {
            console.error('Auth failed:', await res.text());
            return null;
          }
          const data = await res.json();
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            token: data.access_token,
          } as any;
        } catch (e) {
          console.error("Auth error:", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = (user as any).token;
        token.role = (user as any).role;
        (token as any).userId = (user as any).id;
      }
      return token;
    },
    async session({ session, token }: any) {
      (session as any).accessToken = (token as any).accessToken;
      (session as any).role = (token as any).role;
      (session as any).userId = (token as any).userId;
      return session;
    },
  },
  pages: { signIn: "/signin" },
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
