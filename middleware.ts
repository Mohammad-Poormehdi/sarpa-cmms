import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// Paths that require authentication
const protectedPaths = ['/account', '/dashboard']

// Paths that should be accessible only to non-authenticated users
const authPaths = ['/login', '/register']

// Check if the request path matches any of the protected paths
const isProtectedPath = (path: string) => {
  return protectedPaths.some((protectedPath) => path.startsWith(protectedPath))
}

// Check if the request path matches any auth paths (login, register, etc.)
const isAuthPath = (path: string) => {
  return authPaths.some((authPath) => path === authPath)
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Get the token from cookies
  const accessToken = request.cookies.get('access_token')?.value
  
  // If the user is accessing a protected path but doesn't have a token
  if (isProtectedPath(path) && !accessToken) {
    // Redirect to login page
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user has a token
  if (accessToken) {
    try {
      // Verify the token
      const payload = await verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET || 'access-token-secret')
      
      // If the token is valid and user is trying to access login/register pages
      if (payload && isAuthPath(path)) {
        // Redirect authenticated users away from login/register pages
        const redirectUrl = new URL('/account', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      // If token verification fails for protected routes, redirect to login
      if (isProtectedPath(path)) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }
  
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/account', '/dashboard', '/login', '/register'],
} 