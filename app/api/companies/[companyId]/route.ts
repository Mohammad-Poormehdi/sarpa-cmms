import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get a single company by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
          }
        },
        _count: {
          select: {
            assets: true,
            preventiveMaintenances: true,
            workOrders: true
          }
        }
      }
    })
    
    if (!company) {
      return NextResponse.json(
        { error: 'شرکت مورد نظر یافت نشد' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ company })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات شرکت' },
      { status: 500 }
    )
  }
}

// Update a company by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const body = await request.json()
    const { name } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'نام شرکت الزامی است' },
        { status: 400 }
      )
    }
    
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { name }
    })
    
    return NextResponse.json({
      message: 'اطلاعات شرکت با موفقیت بروزرسانی شد',
      company
    })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی اطلاعات شرکت' },
      { status: 500 }
    )
  }
}

// Delete a company by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    
    await prisma.company.delete({
      where: { id: companyId }
    })
    
    return NextResponse.json({
      message: 'شرکت با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'خطا در حذف شرکت' },
      { status: 500 }
    )
  }
} 