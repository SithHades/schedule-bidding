import "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    contractPercentage: number
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      contractPercentage: number
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    contractPercentage: number
  }
} 