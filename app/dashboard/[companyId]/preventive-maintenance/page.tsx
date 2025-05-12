import { Suspense } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { prisma } from "@/lib/prisma"
import { PreventiveMaintenance, ScheduleType, TimeUnit } from "@prisma/client"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PreventiveMaintenanceTable } from "@/components/dashboard/preventive-maintenance/preventive-maintenance-table"

type MaintenanceWithRelations = PreventiveMaintenance & {
  asset: { name: string } | null
  createdBy: { name: string }
}

async function getPreventiveMaintenances(companyId: string) {
  const maintenances = await prisma.preventiveMaintenance.findMany({
    where: {
      companyId,
    },
    include: {
      asset: true,
      createdBy: true,
    },
    orderBy: {
      nextDueDate: 'asc'
    }
  })
  return maintenances
}

export default async function PreventiveMaintenancePage({
  params,
}: {
  params: { companyId: string }
}) {
  const maintenances = await getPreventiveMaintenances(params.companyId)

  return (
    <div className="p-6 space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">نگهداری و تعمیرات پیشگیرانه</h1>
        <Link href={`/dashboard/${params.companyId}/preventive-maintenance/new`}>
          <Button variant="outline">ایجاد برنامه جدید</Button>
        </Link>
      </div>

      {maintenances.length > 0 ? (
        <>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="جستجو..."
                className="w-full pl-8 pr-4"
              />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="pending">در انتظار</SelectItem>
                <SelectItem value="in-progress">در حال انجام</SelectItem>
                <SelectItem value="completed">تکمیل شده</SelectItem>
                <SelectItem value="overdue">تاخیر</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اولویت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه اولویت‌ها</SelectItem>
                <SelectItem value="low">کم</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">زیاد</SelectItem>
                <SelectItem value="critical">بحرانی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PreventiveMaintenanceTable 
            maintenances={maintenances} 
            companyId={params.companyId} 
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg bg-background">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">هیچ برنامه نگهداری و تعمیراتی وجود ندارد</h3>
          <p className="mt-2 text-sm text-muted-foreground">برای شروع، یک برنامه نگهداری و تعمیرات جدید ایجاد کنید.</p>
          <Link href={`/dashboard/${params.companyId}/preventive-maintenance/new`}>
            <Button className="mt-4" variant="outline">ایجاد برنامه جدید</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

