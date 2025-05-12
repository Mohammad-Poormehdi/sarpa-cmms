import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { createTokens, setTokenCookies } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, companyName } = body
    
    // Validate input
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'نام، ایمیل، رمز عبور و نام شرکت الزامی است' },
        { status: 400 }
      )
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'این ایمیل قبلا ثبت شده است' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new company
    const company = await prisma.company.create({
      data: {
        name: companyName,
      },
    })

    // Create user with company association
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId: company.id
      }
    })

    // Create token payload
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: company.id,
      companyName: company.name
    }

    // Generate tokens
    const { accessToken, refreshToken } = await createTokens(tokenPayload)
    
    // Set cookies
    await setTokenCookies(accessToken, refreshToken)

    // Return success response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      message: 'ثبت نام با موفقیت انجام شد',
      user: userWithoutPassword,
      company
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'خطا در ثبت نام' },
      { status: 500 }
    )
  }
} 