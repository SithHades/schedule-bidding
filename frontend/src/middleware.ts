import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

    // If user is on auth page and already authenticated, redirect based on role
    if (isAuthPage && isAuth) {
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // If user is not authenticated and not on auth page, redirect to sign in
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Check admin access
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => {
        // This runs on every request with the middleware
        return true // We handle authorization in the middleware function above
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*"
  ]
} 