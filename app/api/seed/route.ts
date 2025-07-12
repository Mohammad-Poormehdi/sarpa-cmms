import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const companyId = "cmcyta77e0000rpjo7k0gf82i";

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

    // Generate unique timestamp for this seed run
    const timestamp = Date.now();

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
      }),
      prisma.manufacturer.create({
        data: {
          name: "Emerson",
          description: "تولیدکننده تجهیزات اتوماسیون و ابزار دقیق",
          companyId
        }
      }),
      prisma.manufacturer.create({
        data: {
          name: "ABB",
          description: "تولیدکننده تجهیزات برق و اتوماسیون صنعتی",
          companyId
        }
      }),
      prisma.manufacturer.create({
        data: {
          name: "Schneider Electric",
          description: "تولیدکننده تجهیزات مدیریت انرژی و اتوماسیون",
          companyId
        }
      })
    ]);

    // Create Users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: "علی احمدی",
          email: `a.ahmadi_${timestamp}@petrocompany.com`,
          password: "hashed_password_1",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "محمد رضایی",
          email: `m.rezaei_${timestamp}@petrocompany.com`,
          password: "hashed_password_2",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "فاطمه کریمی",
          email: `f.karimi_${timestamp}@petrocompany.com`,
          password: "hashed_password_3",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "حسن محمودی",
          email: `h.mahmoudi_${timestamp}@petrocompany.com`,
          password: "hashed_password_4",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "سارا زمانی",
          email: `s.zamani_${timestamp}@petrocompany.com`,
          password: "hashed_password_5",
          companyId
        }
      }),
      prisma.user.create({
        data: {
          name: "رضا قاسمی",
          email: `r.ghasemi_${timestamp}@petrocompany.com`,
          password: "hashed_password_6",
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
      }),
      prisma.asset.create({
        data: {
          name: "کوره حرارتی F-601",
          description: "کوره اصلی فرآیند کراکینگ حرارتی",
          model: "EMERSON FIRED HEATER H-10",
          serialNumber: "EM2024006",
          barcode: "FUR-601-2024",
          purchasePrice: 1800000000,
          purchaseDate: new Date("2022-11-01"),
          residualValue: 180000000,
          usefulLife: 30,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-02-01"),
          warrantyExpirationDate: new Date("2025-02-01"),
          additionalInformation: "ظرفیت حرارتی 50 میلیون BTU/hr",
          companyId,
          manufacturerId: manufacturers[4].id, // Emerson
          workerId: users[4].id // سارا زمانی
        }
      }),
      prisma.asset.create({
        data: {
          name: "راکتور پلیمریزاسیون R-701",
          description: "راکتور اصلی تولید پلی‌اتیلن",
          model: "ABB STIRRED TANK REACTOR R-500",
          serialNumber: "AB2024007",
          barcode: "RCT-701-2024",
          purchasePrice: 2000000000,
          purchaseDate: new Date("2022-10-10"),
          residualValue: 200000000,
          usefulLife: 20,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-03-20"),
          warrantyExpirationDate: new Date("2026-03-20"),
          additionalInformation: "حجم 100 متر مکعب، فشار کاری 25 بار",
          companyId,
          manufacturerId: manufacturers[5].id, // ABB
          workerId: users[5].id // رضا قاسمی
        }
      }),
      prisma.asset.create({
        data: {
          name: "مخزن ذخیره متانول TK-801",
          description: "مخزن ذخیره متانول با سقف شناور",
          model: "CUSTOM STORAGE TANK",
          serialNumber: "TK2024008",
          barcode: "TNK-801-2024",
          purchasePrice: 750000000,
          purchaseDate: new Date("2023-07-01"),
          residualValue: 75000000,
          usefulLife: 25,
          usefulLifeUnit: "year",
          placedInServiceDate: new Date("2023-09-01"),
          warrantyExpirationDate: new Date("2025-09-01"),
          additionalInformation: "ظرفیت 5000 متر مکعب",
          companyId,
          workerId: users[1].id // محمد رضایی
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
      }),
      prisma.part.create({
        data: {
          name: "مشعل کوره",
          partNumber: "BURNER-FH-H10",
          description: "مشعل گازسوز برای کوره امرسون",
          minimumQuantity: 1,
          isCritical: true,
          additionalInformation: "ظرفیت حرارتی 10 میلیون BTU/hr",
          companyId,
          assets: {
            connect: [{ id: assets[5].id }] // F-601
          }
        }
      }),
      prisma.part.create({
        data: {
          name: "موتور همزن راکتور",
          partNumber: "MOTOR-STR-R500",
          description: "موتور الکتریکی 75 کیلووات برای همزن راکتور ABB",
          minimumQuantity: 1,
          isCritical: true,
          additionalInformation: "ولتاژ: 400 ولت، سرعت: 1500 RPM",
          companyId,
          assets: {
            connect: [{ id: assets[6].id }] // R-701
          }
        }
      }),
      prisma.part.create({
        data: {
          name: "سنسور سطح مخزن",
          partNumber: "LEVEL-SENSOR-TK",
          description: "سنسور سطح راداری برای مخزن ذخیره",
          minimumQuantity: 2,
          isCritical: false,
          additionalInformation: "برند: Schneider Electric",
          companyId,
          assets: {
            connect: [{ id: assets[7].id }] // TK-801
          }
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
      }),
      prisma.preventiveMaintenance.create({
        data: {
          title: "بازرسی و نگهداری کوره F-601",
          description: "بازرسی مشعل‌ها، چک کردن نسوزها، تمیزکاری لوله‌ها",
          scheduleType: "regularInterval",
          frequency: 6,
          timeUnit: "month",
          createWOsDaysBeforeDue: 15,
          workOrderTitle: "نگهداری شش‌ماهه کوره F-601",
          workOrderDescription: "انجام بازرسی و نگهداری دوره‌ای کوره حرارتی",
          workOrderPriority: "high",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2024-07-01"),
          createdById: users[4].id, // سارا زمانی
          assignedToId: users[5].id, // رضا قاسمی
          assetId: assets[5].id, // F-601
          companyId
        }
      }),
      prisma.preventiveMaintenance.create({
        data: {
          title: "بازرسی راکتور R-701",
          description: "بررسی سیستم همزن، کنترل دمای راکتور، بازرسی آب‌بندها",
          scheduleType: "regularInterval",
          frequency: 4,
          timeUnit: "month",
          createWOsDaysBeforeDue: 10,
          workOrderTitle: "نگهداری چهارماهه راکتور R-701",
          workOrderDescription: "انجام بازرسی‌های دوره‌ای راکتور پلیمریزاسیون",
          workOrderPriority: "high",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2024-05-01"),
          createdById: users[5].id, // رضا قاسمی
          assignedToId: users[4].id, // سارا زمانی
          assetId: assets[6].id, // R-701
          companyId
        }
      }),
      prisma.preventiveMaintenance.create({
        data: {
          title: "بازرسی مخزن ذخیره TK-801",
          description: "بازرسی ضخامت بدنه، کنترل سقف شناور، تست سیستم اطفاء حریق",
          scheduleType: "regularInterval",
          frequency: 2,
          timeUnit: "year",
          createWOsDaysBeforeDue: 30,
          workOrderTitle: "بازرسی دوسالانه مخزن TK-801",
          workOrderDescription: "انجام بازرسی جامع مخزن ذخیره متانول",
          workOrderPriority: "medium",
          startDate: new Date("2024-01-01"),
          nextDueDate: new Date("2026-01-01"),
          createdById: users[1].id, // محمد رضایی
          assignedToId: users[3].id, // حسن محمودی
          assetId: assets[7].id, // TK-801
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
      }),
      prisma.workOrder.create({
        data: {
          title: "تعمیر اضطراری مشعل کوره F-601",
          description: "مشعل شماره 3 از کار افتاده است، نیاز به تعویض فوری دارد",
          status: "pending",
          priority: "high",
          dueDate: new Date("2024-03-10"),
          preventiveMaintenanceId: preventiveMaintenances[5].id,
          assignedToId: users[4].id, // سارا زمانی
          assetId: assets[5].id, // F-601
          companyId
        }
      }),
      prisma.workOrder.create({
        data: {
          title: "بازرسی سیستم خنک‌کننده راکتور R-701",
          description: "دمای راکتور بالاتر از حد مجاز است، سیستم خنک‌کننده بررسی شود",
          status: "inProgress",
          priority: "high",
          dueDate: new Date("2024-03-05"),
          preventiveMaintenanceId: preventiveMaintenances[6].id,
          assignedToId: users[5].id, // رضا قاسمی
          assetId: assets[6].id, // R-701
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
