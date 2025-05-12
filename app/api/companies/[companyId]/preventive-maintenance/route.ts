import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { PrismaClient, ScheduleType, TimeUnit, WorkOrderPriority, WorkOrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Define types for request data
interface PreventiveMaintenanceRequestData {
  title: string;
  description?: string;
  scheduleType: ScheduleType;
  frequency: number;
  timeUnit: TimeUnit;
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  assetId?: string;
  createWOsDaysBeforeDue?: number;
  createWorkOrderNow: boolean;
  workOrderTitle?: string;
  workOrderDescription?: string;
  workOrderPriority?: WorkOrderPriority;
  assignedToId?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  
  console.log(`🚀 [PM Retrieval] Starting GET request for company: ${companyId}`);
  try {
    // Authenticate the user
    console.log(`🔐 [PM Retrieval] Authenticating user...`);
    const session = await isAuthenticated();
    if (!session) {
      console.log(`❌ [PM Retrieval] Authentication failed: No valid session`);
      return NextResponse.json(
        { message: "احراز هویت با خطا مواجه شد" },
        { status: 401 }
      );
    }
    console.log(`✅ [PM Retrieval] User authenticated successfully: ${session.id} (${session.email})`);

    // Ensure the user belongs to the company they're trying to access
    console.log(`🏢 [PM Retrieval] Checking company access: User company ${session.companyId} vs Requested company ${companyId}`);
    if (session.companyId !== companyId) {
      console.log(`🚫 [PM Retrieval] Access denied: User does not belong to requested company`);
      return NextResponse.json(
        { message: "شما به این شرکت دسترسی ندارید" },
        { status: 403 }
      );
    }
    console.log(`✅ [PM Retrieval] Company access verified for company: ${companyId}`);

    // Retrieve all preventive maintenance records for the company
    console.log(`🔍 [PM Retrieval] Fetching all preventive maintenance records...`);
    const preventiveMaintenanceRecords = await prisma.preventiveMaintenance.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    console.log(`✅ [PM Retrieval] Successfully retrieved ${preventiveMaintenanceRecords.length} records`);
    
    return NextResponse.json(
      { 
        message: "برنامه های نگهداری پیشگیرانه با موفقیت دریافت شدند",
        data: preventiveMaintenanceRecords 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`❌ [PM Retrieval] Error retrieving preventive maintenance records:`, error);
    return NextResponse.json(
      { message: "خطا در دریافت برنامه های نگهداری پیشگیرانه" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  
  console.log(`🚀 [PM Creation] Starting POST request for company: ${companyId}`);
  try {
    // Authenticate the user
    console.log(`🔐 [PM Creation] Authenticating user...`);
    const session = await isAuthenticated();
    if (!session) {
      console.log(`❌ [PM Creation] Authentication failed: No valid session`);
      return NextResponse.json(
        { message: "احراز هویت با خطا مواجه شد" },
        { status: 401 }
      );
    }
    console.log(`✅ [PM Creation] User authenticated successfully: ${session.id} (${session.email})`);

    // Ensure the user belongs to the company they're trying to modify
    console.log(`🏢 [PM Creation] Checking company access: User company ${session.companyId} vs Requested company ${companyId}`);
    if (session.companyId !== companyId) {
      console.log(`🚫 [PM Creation] Access denied: User does not belong to requested company`);
      return NextResponse.json(
        { message: "شما به این شرکت دسترسی ندارید" },
        { status: 403 }
      );
    }
    console.log(`✅ [PM Creation] Company access verified for company: ${companyId}`);

    // Parse the request body
    console.log(`📝 [PM Creation] Parsing request body...`);
    const data = await request.json() as PreventiveMaintenanceRequestData;
    console.log(`📄 [PM Creation] Request data received:`, {
      title: data.title,
      scheduleType: data.scheduleType,
      frequency: data.frequency,
      timeUnit: data.timeUnit,
      startDate: data.startDate,
      nextDueDate: data.nextDueDate,
      assetId: data.assetId || undefined,
      createWorkOrderNow: !!data.createWorkOrderNow
    });

    // Validate the data before creating the PM record
    console.log(`🔍 [PM Creation] Validating PM data...`);
    const validationErrors = [];

    // Required field validation
    if (!data.title?.trim()) validationErrors.push("عنوان نمیتواند خالی باشد");
    if (!data.scheduleType) validationErrors.push("نوع زمان‌بندی باید مشخص شود");
    if (!data.frequency || isNaN(Number(data.frequency)) || Number(data.frequency) <= 0) {
      validationErrors.push("فرکانس باید عدد مثبت باشد");
    }
    if (!data.timeUnit) validationErrors.push("واحد زمانی باید مشخص شود");
    if (!data.startDate) validationErrors.push("تاریخ شروع نمیتواند خالی باشد");
    if (!data.nextDueDate) validationErrors.push("تاریخ سررسید بعدی نمیتواند خالی باشد");
    
    // Additional validations
    if (data.createWOsDaysBeforeDue && (isNaN(Number(data.createWOsDaysBeforeDue)) || Number(data.createWOsDaysBeforeDue) < 0)) {
      validationErrors.push("تعداد روزهای قبل از ایجاد دستور کار باید عدد مثبت یا صفر باشد");
    }
    
    // Date validations
    const startDate = new Date(data.startDate);
    const nextDueDate = new Date(data.nextDueDate);
    const endDate = data.endDate ? new Date(data.endDate) : null;
    
    if (isNaN(startDate.getTime())) validationErrors.push("فرمت تاریخ شروع صحیح نیست");
    if (isNaN(nextDueDate.getTime())) validationErrors.push("فرمت تاریخ سررسید بعدی صحیح نیست");
    
    if (nextDueDate < startDate) {
      validationErrors.push("تاریخ سررسید بعدی نمیتواند قبل از تاریخ شروع باشد");
    }
    
    if (endDate && !isNaN(endDate.getTime())) {
      if (endDate < startDate) {
        validationErrors.push("تاریخ پایان نمیتواند قبل از تاریخ شروع باشد");
      }
      if (endDate < nextDueDate) {
        validationErrors.push("تاریخ پایان نمیتواند قبل از تاریخ سررسید بعدی باشد");
      }
    }
    
    // Work order validations if createWorkOrderNow is true
    if (data.createWorkOrderNow) {
      if (!data.workOrderTitle?.trim()) validationErrors.push("عنوان دستور کار نمیتواند خالی باشد");
      if (!data.workOrderPriority) validationErrors.push("اولویت دستور کار باید مشخص شود");
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      console.log(`❌ [PM Creation] Validation failed:`, validationErrors);
      return NextResponse.json(
        { 
          message: "اطلاعات وارد شده صحیح نمی‌باشد",
          errors: validationErrors 
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ [PM Creation] Data validation successful`);

    // Create the preventive maintenance record
    console.log(`🗃️ [PM Creation] Creating preventive maintenance record...`);
    const preventiveMaintenance = await prisma.preventiveMaintenance.create({
      data: {
        title: data.title,
        description: data.description,
        scheduleType: data.scheduleType,
        frequency: data.frequency,
        timeUnit: data.timeUnit,
        createWOsDaysBeforeDue: data.createWOsDaysBeforeDue,
        startDate: data.startDate,
        endDate: data.endDate,
        nextDueDate: data.nextDueDate,
        status: "pending",
        createdById: session.id,
        companyId: companyId,
        assetId: data.assetId || undefined,
      },
    });
    console.log(`✅ [PM Creation] Preventive maintenance created successfully with ID: ${preventiveMaintenance.id}`);

    // If createWorkOrderNow is true, create a work order
    if (data.createWorkOrderNow && data.workOrderTitle) {
      console.log(`📋 [PM Creation] Creating associated work order...`);
      console.log(`🔍 [PM Creation] Work order details:`, {
        title: data.workOrderTitle,
        priority: data.workOrderPriority,
        dueDate: data.nextDueDate,
        assignedToId: data.assignedToId || undefined
      });
      
      const workOrder = await prisma.workOrder.create({
        data: {
          title: data.workOrderTitle,
          description: data.workOrderDescription,
          priority: (data.workOrderPriority || "medium") as WorkOrderPriority,
          status: WorkOrderStatus.pending,
          dueDate: data.nextDueDate,
          preventiveMaintenanceId: preventiveMaintenance.id,
          assignedToId: data.assignedToId || undefined,
          assetId: data.assetId || undefined,
          companyId: companyId,
        },
      });
      console.log(`✅ [PM Creation] Work order created successfully with ID: ${workOrder.id}`);
    } else {
      console.log(`ℹ️ [PM Creation] No immediate work order requested for this PM`);
    }

    console.log(`🎉 [PM Creation] Process completed successfully, returning response`);
    return NextResponse.json(
      { 
        message: "برنامه نگهداری پیشگیرانه با موفقیت ایجاد شد",
        data: preventiveMaintenance 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`❌ [PM Creation] Error creating preventive maintenance:`, error);
    return NextResponse.json(
      { message: "خطا در ایجاد برنامه نگهداری پیشگیرانه" },
      { status: 500 }
    );
  }
} 