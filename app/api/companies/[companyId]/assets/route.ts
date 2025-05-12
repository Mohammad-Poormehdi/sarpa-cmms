import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all assets for a company
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })
    
    if (!company) {
      return NextResponse.json(
        { error: 'شرکت مورد نظر یافت نشد' },
        { status: 404 }
      )
    }
    
    // Fetch assets for this company
    const assets = await prisma.asset.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            maintenances: true,
            workOrders: true
          }
        }
      }
    })
    
    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Error fetching company assets:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت تجهیزات شرکت' },
      { status: 500 }
    )
  }
}

// Create a new asset for a company
export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const body = await request.json()
    const { 
      name, 
      description, 
      image,
      model,
      serialNumber,
      barcode,
      purchasePrice,
      purchaseDate,
      residualValue,
      usefulLife,
      usefulLifeUnit,
      placedInServiceDate,
      warrantyExpirationDate,
      additionalInformation,
      manufacturerId,
      workerId,
      additionalWorkers 
    } = body
    
    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'نام تجهیز الزامی است' },
        { status: 400 }
      )
    }
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })
    
    if (!company) {
      return NextResponse.json(
        { error: 'شرکت مورد نظر یافت نشد' },
        { status: 404 }
      )
    }
    
    // Create asset
    const asset = await prisma.asset.create({
      data: {
        name,
        description,
        image,
        model,
        serialNumber,
        barcode,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        residualValue: residualValue ? Number(residualValue) : undefined,
        usefulLife: usefulLife ? Number(usefulLife) : undefined,
        usefulLifeUnit,
        placedInServiceDate: placedInServiceDate ? new Date(placedInServiceDate) : undefined,
        warrantyExpirationDate: warrantyExpirationDate ? new Date(warrantyExpirationDate) : undefined,
        additionalInformation,
        company: {
          connect: { id: companyId }
        },
        // Connect manufacturer if provided
        manufacturer: manufacturerId ? {
          connect: { id: manufacturerId }
        } : undefined,
        // Connect primary worker if provided
        worker: workerId ? {
          connect: { id: workerId }
        } : undefined,
        // Connect additional workers if provided
        additionalWorkers: additionalWorkers?.length ? {
          connect: additionalWorkers.map((id: string) => ({ id }))
        } : undefined
      }
    })
    
    return NextResponse.json({
      message: 'تجهیز با موفقیت ایجاد شد',
      asset
    })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد تجهیز' },
      { status: 500 }
    )
  }
} 