import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

// Get a single user by ID in a company
export async function GET(
  request: Request,
  { params }: { params: { companyId: string; userId: string } }
) {
  try {
    const { companyId, userId } = params
    
    // Find user in the specific company
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        companyId
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'کاربر مورد نظر در این شرکت یافت نشد' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات کاربر' },
      { status: 500 }
    )
  }
}

// Update a user by ID in a company
export async function PATCH(
  request: Request,
  { params }: { params: { companyId: string; userId: string } }
) {
  try {
    const { companyId, userId } = params
    const body = await request.json()
    const { name, email, password } = body
    
    // Verify user exists in this company
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: userId,
        companyId
      }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'کاربر مورد نظر در این شرکت یافت نشد' },
        { status: 404 }
      )
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (name) updateData.name = name
    if (email && email !== existingUser.email) {
      // Check if email is already taken by another user
      const emailExists = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: userId }
        }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'این ایمیل قبلا ثبت شده است' },
          { status: 409 }
        )
      }
      
      updateData.email = email
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      message: 'اطلاعات کاربر با موفقیت بروزرسانی شد',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی اطلاعات کاربر' },
      { status: 500 }
    )
  }
}

// Delete a user by ID in a company
export async function DELETE(
  request: Request,
  { params }: { params: { companyId: string; userId: string } }
) {
  try {
    const { companyId, userId } = params
    
    // Verify user exists in this company
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: userId,
        companyId
      }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'کاربر مورد نظر در این شرکت یافت نشد' },
        { status: 404 }
      )
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    })
    
    return NextResponse.json({
      message: 'کاربر با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'خطا در حذف کاربر' },
      { status: 500 }
    )
  }
} 