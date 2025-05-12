import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTokens, verifyToken } from "@/lib/jwt"

// Get all companies
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })
    
    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت شرکت‌ها' },
      { status: 500 }
    )
  }
}

// Create a new company
export async function POST(req: NextRequest) {
  try {
    // Get and verify token
    const { accessToken } = await getTokens()
    
    if (!accessToken) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET || "access-token-secret"
    )
    
    if (!payload || !payload.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Parse request body
    const { name, userId } = await req.json()
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'نام شرکت الزامی است' },
        { status: 400 }
      )
    }
    
    // Check if user is authorized (using the token's user ID)
    if (payload.id !== userId) {
      return NextResponse.json(
        { message: "Unauthorized - User ID mismatch" },
        { status: 403 }
      )
    }
    
    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        users: {
          create: {
            userId,
            role: "admin", // First user is admin
          },
        },
      },
    })
    
    return NextResponse.json({
      message: 'شرکت با موفقیت ایجاد شد',
      company
    })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد شرکت' },
      { status: 500 }
    )
  }
} 