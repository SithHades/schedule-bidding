import "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    contractPercentage: number
    accessToken: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      contractPercentage: number
      accessToken: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    contractPercentage: number
    accessToken: string
  }
} 