import { NextResponse } from 'next/server'
import { refreshAccessToken, isAuthenticatedWithRefresh } from '@/lib/auth'

export async function POST() {
  try {
    // Attempt to refresh the token
    const refreshed = await refreshAccessToken()
    
    if (!refreshed) {
      return NextResponse.json(
        { error: 'توکن منقضی شده است' },
        { status: 401 }
      )
    }
    
    // Get the refreshed user data
    const user = await isAuthenticatedWithRefresh()
    
    if (!user) {
      return NextResponse.json(
        { error: 'خطا در تایید هویت' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      message: 'توکن با موفقیت تمدید شد',
      user
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'خطا در تمدید توکن' },
      { status: 500 }
    )
  }
} 