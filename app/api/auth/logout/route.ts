import { NextResponse } from 'next/server'
import { clearTokenCookies } from '@/lib/jwt'

export async function POST() {
  try {
    // Clear the JWT cookies
    await clearTokenCookies()
    
    return NextResponse.json({
      message: 'خروج موفقیت آمیز بود'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'خطا در خروج از سیستم' },
      { status: 500 }
    )
  }
} 