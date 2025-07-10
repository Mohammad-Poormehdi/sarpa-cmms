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
  const refreshToken = request.cookies.get('refresh_token')?.value
  
  // If the user is accessing a protected path
  if (isProtectedPath(path)) {
    // If no access token, check if refresh token exists
    if (!accessToken) {
      // If no refresh token either, redirect to login
      if (!refreshToken) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      
      // If refresh token exists but no access token, redirect to login
      // The client should handle the refresh process
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Verify the access token
    try {
      const payload = await verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET || 'access-token-secret')
      
      // If token is invalid, redirect to login
      if (!payload) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      // If token verification fails, redirect to login
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // If user has a valid token and is trying to access auth pages
  if (accessToken && isAuthPath(path)) {
    try {
      const payload = await verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET || 'access-token-secret')
      
      if (payload) {
        // Redirect authenticated users to dashboard
        const redirectUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      // Token is invalid, allow access to auth pages
    }
  }
  
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 