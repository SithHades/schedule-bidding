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
          const response = await api("/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          
          // Backend returns: { message, user, token }
          if (response && response.user && response.user.id && response.token) {
            return {
              id: response.user.id.toString(),
              email: response.user.email,
              name: response.user.name,
              role: response.user.role,
              contractPercentage: response.user.contractPercent,
              accessToken: response.token  // This is the JWT from backend
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
        token.accessToken = user.accessToken  // Store the JWT from backend
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ""
        session.user.role = (token.role as string) || ""
        session.user.contractPercentage = (token.contractPercentage as number) || 0
        session.user.accessToken = (token.accessToken as string) || ""  // Include JWT in session
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
