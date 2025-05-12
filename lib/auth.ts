import { createTokens, getTokens, setTokenCookies, verifyToken } from './jwt'

// Constants
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret'

/**
 * Refreshes the access token using the refresh token
 * Returns true if successful, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    // Get tokens from cookies
    const { refreshToken } = await getTokens()
    
    // If no refresh token, can't refresh
    if (!refreshToken) {
      return false
    }
    
    // Verify refresh token
    const payload = await verifyToken(refreshToken, REFRESH_TOKEN_SECRET)
    
    // If token is invalid, can't refresh
    if (!payload) {
      return false
    }
    
    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      await createTokens(payload)
    
    // Set new tokens in cookies
    await setTokenCookies(newAccessToken, newRefreshToken)
    
    return true
  } catch (error) {
    console.error('Error refreshing token:', error)
    return false
  }
}

/**
 * Checks if the user is authenticated
 * Returns the user payload if authenticated, null otherwise
 */
export async function isAuthenticated() {
  try {
    // Get tokens from cookies
    const { accessToken } = await getTokens()
    
    // If no access token, not authenticated
    if (!accessToken) {
      // Try to refresh the token
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        return null
      }
      
      // Get new access token after refresh
      const { accessToken: newAccessToken } = await getTokens()
      if (!newAccessToken) {
        return null
      }
      
      // Verify new access token
      return await verifyToken(newAccessToken, ACCESS_TOKEN_SECRET)
    }
    
    // Verify access token
    const payload = await verifyToken(accessToken, ACCESS_TOKEN_SECRET)
    
    // If token is invalid, try to refresh
    if (!payload) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        return null
      }
      
      // Get new access token after refresh
      const { accessToken: newAccessToken } = await getTokens()
      if (!newAccessToken) {
        return null
      }
      
      // Verify new access token
      return await verifyToken(newAccessToken, ACCESS_TOKEN_SECRET)
    }
    
    return payload as any
  } catch (error) {
    console.error('Error checking authentication:', error)
    return null
  }
} 