import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const companyId = "cmae96vlh000crps8ze1pj1lg";

    // First, verify the company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Create Manufacturers
    const manufacturers = await Promise.all([
      prisma.manufacturer.create({
        data: {
          name: "Siemens Industrial",
          description: "تولیدکننده تجهیزات صنعتی و سیستم‌های کنترل",
          companyId
        }
      }),
      prisma.manufacturer.create({
        data: {
          name: "Grundfos",
          description: "تولیدکننده پمپ‌های صنعتی و سیستم‌های پمپاژ",
          companyId
        }
      }),
      prisma.manufacturer.create({
        data: {
          name: "Honeywell Process Solutions",
          description: "تولیدکننده سیستم‌های کنترل فرآیند و ابزار دقیق",
          companyId
        }
      }),
      prisma.manufacturer.create({
        data: {
          name: "Alfa Laval",
          description: "تولیدکننده مبدل‌های حرارتی و تجهیزات جداسازی",
          companyId
        }
      })
    ]);

    // Create Users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: "علی احمدی",
          email: "a.ahmadi@petrocompany.com",
          password: "hashed_password_1",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "محمد رضایی",
          email: "m.rezaei@petrocompany.com",
          password: "hashed_password_2",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "فاطمه کریمی",
          email: "f.karimi@petrocompany.com",
          password: "hashed_password_3",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "حسن محمودی",
          email: "h.mahmoudi@petrocompany.com",
          password: "hashed_password_4",
          companyId
        }
      })
    ]);

    // Create Assets
    const assets = await Promise.all([
      prisma.asset.create({
        data: {
          name: "پمپ خوراک واحد تقطیر P-101",
          description: "پمپ اصلی تزریق خوراک به ستون تقطیر",
          model: "GRUNDFOS CR 32-4",
          serialNumber: "GF2024001",
          barcode: "PMP-101-2024",
          purchasePrice: 85000000,
          purchaseDate: new Date("2023-03-15"),
          residualValue: 8500000,
          usefulLife: 15,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-04-01"),
          warrantyExpirationDate: new Date("2025-04-01"),
          additionalInformation: "پمپ با موتور 45 کیلووات، دبی نامی 150 متر مکعب بر ساعت",
          companyId,
          manufacturerId: manufacturers[1].id,
          workerId: users[0].id
        }
      }),
      prisma.asset.create({
        data: {
          name: "کمپرسور هوای فشرده AC-201",
          description: "کمپرسور اصلی تامین هوای فشرده واحد",
          model: "SIEMENS TURBO-AIR 2000",
          serialNumber: "SA2024002",
          barcode: "CMP-201-2024",
          purchasePrice: 450000000,
          purchaseDate: new Date("2023-01-20"),
          residualValue: 45000000,
          usefulLife: 20,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-02-15"),
          warrantyExpirationDate: new Date("2026-02-15"),
          additionalInformation: "کمپرسور با ظرفیت 1000 متر مکعب بر ساعت، فشار 8 بار",
          companyId,
          manufacturerId: manufacturers[0].id,
          workerId: users[1].id
        }
      }),
      prisma.asset.create({
        data: {
          name: "مبدل حرارتی E-301",
          description: "مبدل حرارتی پیش‌گرمکن خوراک",
          model: "ALFA LAVAL M15-BFG",
          serialNumber: "AL2024003",
          barcode: "HEX-301-2024",
          purchasePrice: 125000000,
          purchaseDate: new Date("2023-05-10"),
          residualValue: 12500000,
          usefulLife: 12,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-06-01"),
          warrantyExpirationDate: new Date("2025-06-01"),
          additionalInformation: "مبدل با سطح انتقال حرارت 150 متر مربع",
          companyId,
          manufacturerId: manufacturers[3].id,
          workerId: users[2].id
        }
      }),
      prisma.asset.create({
        data: {
          name: "سیستم کنترل DCS-401",
          description: "سیستم کنترل توزیع شده واحد",
          model: "HONEYWELL EXPERION PKS",
          serialNumber: "HW2024004",
          barcode: "DCS-401-2024",
          purchasePrice: 680000000,
          purchaseDate: new Date("2023-02-01"),
          residualValue: 68000000,
          usefulLife: 10,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-03-01"),
          warrantyExpirationDate: new Date("2028-03-01"),
          additionalInformation: "سیستم شامل 50 حلقه کنترل و 200 نقطه I/O",
          companyId,
          manufacturerId: manufacturers[2].id,
          workerId: users[3].id
        }
      }),
      prisma.asset.create({
        data: {
          name: "ستون تقطیر T-501",
          description: "ستون اصلی تقطیر محصولات نفتی",
          model: "CUSTOM DISTILLATION COLUMN",
          serialNumber: "DC2024005",
          barcode: "COL-501-2024",
          purchasePrice: 1200000000,
          purchaseDate: new Date("2022-08-15"),
          residualValue: 120000000,
          usefulLife: 25,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-01-01"),
          warrantyExpirationDate: new Date("2025-01-01"),
          additionalInformation: "ستون 40 متری با 30 طبقه نظری",
          companyId,
          workerId: users[0].id
        }
      })
    ]);

    // Create Parts
    const parts = await Promise.all([
      prisma.part.create({
        data: {
          name: "پروانه پمپ",
          partNumber: "IMP-CR32-001",
          description: "پروانه استیل ضد زنگ برای پمپ گراندفوس",
          minimumQuantity: 2,
          isCritical: true,
          additionalInformation: "ماده: استینلس استیل 316L",
          companyId,
          assets: {
            connect: [{ id: assets[0].id }]
          }
        }
      }),
      prisma.part.create({
        data: {
          name: "فیلتر هوا کمپرسور",
          partNumber: "AF-TURBO-2000",
          description: "فیلتر هوای ورودی کمپرسور زیمنس",
          minimumQuantity: 4,
          isCritical: true,
          additionalInformation: "تعویض هر 3 ماه یکبار",
          companyId,
          assets: {
            connect: [{ id: assets[1].id }]
          }
        }
      }),
      prisma.part.create({
        data: {
          name: "گسکت مبدل حرارتی",
          partNumber: "GSK-M15-BFG",
          description: "گسکت NBR مخصوص مبدل حرارتی آلفالاوال",
          minimumQuantity: 10,
          isCritical: true,
          additionalInformation: "مقاوم در برابر دمای 120 درجه سانتیگراد",
          companyId,
          assets: {
            connect: [{ id: assets[2].id }]
          }
        }
      }),
      prisma.part.create({
        data: {
          name: "کارت I/O",
          partNumber: "IO-CARD-PKS",
          description: "کارت ورودی/خروجی دیجیتال هانی‌ول",
          minimumQuantity: 3,
          isCritical: true,
          additionalInformation: "16 کانال دیجیتال",
          companyId,
          assets: {
            connect: [{ id: assets[3].id }]
          }
        }
      }),
      prisma.part.create({
        data: {
          name: "شیر کنترل",
          partNumber: "CV-316L-6INCH",
          description: "شیر کنترل پنوماتیک 6 اینچ",
          minimumQuantity: 1,
          isCritical: true,
          additionalInformation: "فشار کاری تا 16 بار",
          companyId
        }
      })
    ]);

    // Create Preventive Maintenances
    const preventiveMaintenances = await Promise.all([
      prisma.preventiveMaintenance.create({
        data: {
          title: "بازرسی و نگهداری پمپ P-101",
          description: "بررسی وضعیت بلبرینگ‌ها، تعویض روغن، بررسی آب‌بندی",
          scheduleType: "regularInterval",
          frequency: 3,
          timeUnit: "month",
          createWOsDaysBeforeDue: 7,
          workOrderTitle: "نگهداری دوره‌ای پمپ P-101",
          workOrderDescription: "انجام نگهداری سه‌ماهه پمپ خوراک",
          workOrderPriority: "high",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2024-04-01"),
          createdById: users[0].id,
          assignedToId: users[1].id,
          assetId: assets[0].id,
          companyId
        }
      }),
      prisma.preventiveMaintenance.create({
        data: {
          title: "بازرسی کمپرسور AC-201",
          description: "تعویض فیلتر هوا، بررسی فشار روغن، بازرسی سیستم خنک‌کننده",
          scheduleType: "regularInterval",
          frequency: 2,
          timeUnit: "month",
          createWOsDaysBeforeDue: 5,
          workOrderTitle: "نگهداری دوره‌ای کمپرسور AC-201",
          workOrderDescription: "انجام نگهداری دوماهه کمپرسور",
          workOrderPriority: "high",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2024-03-01"),
          createdById: users[1].id,
          assignedToId: users[2].id,
          assetId: assets[1].id,
          companyId
        }
      }),
      prisma.preventiveMaintenance.create({
        data: {
          title: "بازرسی مبدل حرارتی E-301",
          description: "بازرسی گسکت‌ها، تمیزکاری صفحات، بررسی نشتی",
          scheduleType: "regularInterval",
          frequency: 6,
          timeUnit: "month",
          createWOsDaysBeforeDue: 10,
          workOrderTitle: "نگهداری شش‌ماهه مبدل E-301",
          workOrderDescription: "انجام نگهداری و تمیزکاری مبدل حرارتی",
          workOrderPriority: "medium",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2024-07-01"),
          createdById: users[2].id,
          assignedToId: users[3].id,
          assetId: assets[2].id,
          companyId
        }
      }),
      prisma.preventiveMaintenance.create({
        data: {
          title: "کالیبراسیون سیستم DCS-401",
          description: "کالیبراسیون ترانسمیترها، بررسی سیگنال‌ها، آپدیت نرم‌افزار",
          scheduleType: "regularInterval",
          frequency: 12,
          timeUnit: "month",
          createWOsDaysBeforeDue: 14,
          workOrderTitle: "کالیبراسیون سالانه DCS",
          workOrderDescription: "کالیبراسیون و بررسی سیستم کنترل",
          workOrderPriority: "high",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2025-01-01"),
          createdById: users[3].id,
          assignedToId: users[0].id,
          assetId: assets[3].id,
          companyId
        }
      }),
      prisma.preventiveMaintenance.create({
        data: {
          title: "بازرسی ستون تقطیر T-501",
          description: "بازرسی غیرمخرب، بررسی عایق‌کاری، تست فشار",
          scheduleType: "regularInterval",
          frequency: 2,
          timeUnit: "year",
          createWOsDaysBeforeDue: 30,
          workOrderTitle: "بازرسی دو‌ساله ستون T-501",
          workOrderDescription: "بازرسی جامع ستون تقطیر",
          workOrderPriority: "high",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2026-01-01"),
          createdById: users[0].id,
          assignedToId: users[1].id,
          assetId: assets[4].id,
          companyId
        }
      })
    ]);

    // Create some Work Orders
    const workOrders = await Promise.all([
      prisma.workOrder.create({
        data: {
          title: "نگهداری فوری پمپ P-101",
          description: "تعویض بلبرینگ پمپ به دلیل ارتعاش غیرطبیعی",
          status: "pending",
          priority: "high",
          dueDate: new Date("2024-02-15"),
          preventiveMaintenanceId: preventiveMaintenances[0].id,
          assignedToId: users[1].id,
          assetId: assets[0].id,
          companyId
        }
      }),
      prisma.workOrder.create({
        data: {
          title: "تعویض فیلتر کمپرسور AC-201",
          description: "تعویض فیلتر هوای ورودی کمپرسور",
          status: "inProgress",
          priority: "medium",
          dueDate: new Date("2024-02-20"),
          preventiveMaintenanceId: preventiveMaintenances[1].id,
          assignedToId: users[2].id,
          assetId: assets[1].id,
          companyId
        }
      }),
      prisma.workOrder.create({
        data: {
          title: "بازرسی گسکت مبدل E-301",
          description: "بررسی وضعیت گسکت‌ها و تعویض در صورت نیاز",
          status: "completed",
          priority: "low",
          dueDate: new Date("2024-01-30"),
          preventiveMaintenanceId: preventiveMaintenances[2].id,
          assignedToId: users[3].id,
          assetId: assets[2].id,
          companyId
        }
      })
    ]);

    return NextResponse.json({
      message: "داده‌های شرکت پتروشیمی با موفقیت ایجاد شد",
      data: {
        manufacturers: manufacturers.length,
        users: users.length,
        assets: assets.length,
        parts: parts.length,
        preventiveMaintenances: preventiveMaintenances.length,
        workOrders: workOrders.length
      }
    });

  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد داده‌ها" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
