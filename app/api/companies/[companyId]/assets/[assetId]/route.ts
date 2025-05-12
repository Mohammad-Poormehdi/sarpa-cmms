import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get a single asset
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string; assetId: string }> }
) {
  try {
    const { companyId, assetId } = await params
    
    // Fetch the asset with its relations
    const asset = await prisma.asset.findUnique({
      where: { 
        id: assetId,
        companyId
      },
      include: {
        manufacturer: true,
        worker: true,
        additionalWorkers: true
      }
    })
    
    if (!asset) {
      return NextResponse.json(
        { error: 'تجهیز مورد نظر یافت نشد' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ asset })
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات تجهیز' },
      { status: 500 }
    )
  }
}

// Update an asset
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ companyId: string; assetId: string }> }
) {
  try {
    const { companyId, assetId } = await params
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
    
    // Verify asset exists and belongs to the company
    const existingAsset = await prisma.asset.findUnique({
      where: { 
        id: assetId,
        companyId
      },
      include: {
        additionalWorkers: {
          select: { id: true }
        }
      }
    })
    
    if (!existingAsset) {
      return NextResponse.json(
        { error: 'تجهیز مورد نظر یافت نشد' },
        { status: 404 }
      )
    }
    
    // Get existing additional workers IDs
    const existingAdditionalWorkerIds = existingAsset.additionalWorkers.map(worker => worker.id)
    
    // Find workers to disconnect and connect
    const workersToDisconnect = existingAdditionalWorkerIds.filter(
      id => !additionalWorkers?.includes(id)
    )
    const workersToConnect = additionalWorkers?.filter(
      id => !existingAdditionalWorkerIds.includes(id)
    ) || []
    
    // Update asset
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name,
        description,
        image,
        model,
        serialNumber,
        barcode,
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        residualValue: residualValue ? Number(residualValue) : null,
        usefulLife: usefulLife ? Number(usefulLife) : null,
        usefulLifeUnit,
        placedInServiceDate: placedInServiceDate ? new Date(placedInServiceDate) : null,
        warrantyExpirationDate: warrantyExpirationDate ? new Date(warrantyExpirationDate) : null,
        additionalInformation,
        // Update manufacturer if provided
        manufacturer: manufacturerId ? {
          connect: { id: manufacturerId }
        } : { disconnect: true },
        // Update primary worker if provided
        worker: workerId ? {
          connect: { id: workerId }
        } : { disconnect: true },
        // Update additional workers
        additionalWorkers: {
          disconnect: workersToDisconnect.map(id => ({ id })),
          connect: workersToConnect.map(id => ({ id }))
        }
      }
    })
    
    return NextResponse.json({
      message: 'تجهیز با موفقیت به‌روزرسانی شد',
      asset
    })
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی تجهیز' },
      { status: 500 }
    )
  }
}

// Delete an asset
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ companyId: string; assetId: string }> }
) {
  try {
    const { companyId, assetId } = await params
    
    // Verify asset exists and belongs to the company
    const asset = await prisma.asset.findUnique({
      where: { 
        id: assetId,
        companyId
      }
    })
    
    if (!asset) {
      return NextResponse.json(
        { error: 'تجهیز مورد نظر یافت نشد' },
        { status: 404 }
      )
    }
    
    // Delete the asset
    await prisma.asset.delete({
      where: { id: assetId }
    })
    
    return NextResponse.json({
      message: 'تجهیز با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: 'خطا در حذف تجهیز' },
      { status: 500 }
    )
  }
} 