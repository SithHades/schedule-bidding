import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { api } from "@/lib/api"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          
          if (user && user.id) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              contractPercentage: user.contractPercentage
            }
          }
          
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.contractPercentage = user.contractPercentage
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ""
        session.user.role = (token.role as string) || ""
        session.user.contractPercentage = (token.contractPercentage as number) || 0
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST } 