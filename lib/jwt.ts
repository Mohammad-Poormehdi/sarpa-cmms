import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret'

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = '15m' // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d' // 7 days

// Create JWT tokens
export async function createTokens(payload: any) {
  // Create access token
  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(new TextEncoder().encode(ACCESS_TOKEN_SECRET))

  // Create refresh token
  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(new TextEncoder().encode(REFRESH_TOKEN_SECRET))

  return { accessToken, refreshToken }
}

// Verify JWT token
export async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(
      token, 
      new TextEncoder().encode(secret)
    )
    return payload
  } catch (error) {
    return null
  }
}

// Save tokens in cookies
export async function setTokenCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  
  // Set access token cookie
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60, // 15 minutes in seconds
    path: '/',
    sameSite: 'lax',
  })
  
  // Set refresh token cookie with longer expiration
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
    sameSite: 'lax',
  })
}

// Get tokens from cookies
export async function getTokens() {
  const cookieStore = await cookies()
  
  const accessToken = cookieStore.get('access_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value
  
  return { accessToken, refreshToken }
}

// Clear tokens from cookies (for logout)
export async function clearTokenCookies() {
  const cookieStore = await cookies()
  
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
} 