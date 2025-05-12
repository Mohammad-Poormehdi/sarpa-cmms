import { NextResponse } from 'next/server'
import { createTokens, setTokenCookies } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    // Find the user with company information
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این مشخصات یافت نشد' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'رمز عبور اشتباه است' },
        { status: 401 }
      )
    }

    // Create token payload (don't include sensitive information)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      companyName: user.company.name
    }

    // Generate tokens
    const { accessToken, refreshToken } = await createTokens(tokenPayload)
    
    // Set cookies
    await setTokenCookies(accessToken, refreshToken)

    // Return success response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      message: 'ورود موفقیت آمیز بود',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'خطا در ورود به سیستم' },
      { status: 500 }
    )
  }
} 