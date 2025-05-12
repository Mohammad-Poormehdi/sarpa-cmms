import React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { WorkOrdersTable } from "@/components/dashboard/work-orders/work-orders-table"
import { getWorkOrders, WorkOrdersSearchParams } from "@/app/actions/work-order"
import { isAuthenticated } from "@/lib/auth"
import { ClipboardList } from "lucide-react"

export default async function WorkOrdersPage({
  params,
  searchParams,
}: {
  params: { companyId: string };
  searchParams: WorkOrdersSearchParams;
}) {
  const user = await isAuthenticated();
  
  if (user.companyId !== params.companyId) {
    throw new Error("Unauthorized");
  }

  const { data, total } = await getWorkOrders(params.companyId, searchParams);

  return (
    <div className="p-6 space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">سفارشات کار</h1>
        <Link href={`/dashboard/${params.companyId}/work-orders/new`}>
          <Button variant="outline">ایجاد سفارش کار جدید</Button>
        </Link>
      </div>

      {data.length > 0 ? (
        <>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="جستجو..."
                className="w-full pl-8 pr-4"
              />
            </div>

            <Select 
              defaultValue={searchParams?.status || "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <Link href={`/dashboard/${params.companyId}/work-orders`} className="block w-full">
                    همه وضعیت‌ها
                  </Link>
                </SelectItem>
                <SelectItem value="pending">
                  <Link href={`/dashboard/${params.companyId}/work-orders?status=pending`} className="block w-full">
                    در انتظار
                  </Link>
                </SelectItem>
                <SelectItem value="inProgress">
                  <Link href={`/dashboard/${params.companyId}/work-orders?status=inProgress`} className="block w-full">
                    در حال انجام
                  </Link>
                </SelectItem>
                <SelectItem value="completed">
                  <Link href={`/dashboard/${params.companyId}/work-orders?status=completed`} className="block w-full">
                    تکمیل شده
                  </Link>
                </SelectItem>
                <SelectItem value="cancelled">
                  <Link href={`/dashboard/${params.companyId}/work-orders?status=cancelled`} className="block w-full">
                    لغو شده
                  </Link>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select 
              defaultValue={searchParams?.priority || "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اولویت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <Link href={`/dashboard/${params.companyId}/work-orders`} className="block w-full">
                    همه اولویت‌ها
                  </Link>
                </SelectItem>
                <SelectItem value="none">
                  <Link href={`/dashboard/${params.companyId}/work-orders?priority=none`} className="block w-full">
                    بدون اولویت
                  </Link>
                </SelectItem>
                <SelectItem value="low">
                  <Link href={`/dashboard/${params.companyId}/work-orders?priority=low`} className="block w-full">
                    کم
                  </Link>
                </SelectItem>
                <SelectItem value="medium">
                  <Link href={`/dashboard/${params.companyId}/work-orders?priority=medium`} className="block w-full">
                    متوسط
                  </Link>
                </SelectItem>
                <SelectItem value="high">
                  <Link href={`/dashboard/${params.companyId}/work-orders?priority=high`} className="block w-full">
                    زیاد
                  </Link>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <WorkOrdersTable data={data} total={total} companyId={params.companyId} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg bg-background">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">هیچ سفارش کاری وجود ندارد</h3>
          <p className="mt-2 text-sm text-muted-foreground">برای شروع، یک سفارش کار جدید ایجاد کنید.</p>
          <Link href={`/dashboard/${params.companyId}/work-orders/new`}>
            <Button className="mt-4" variant="outline">ایجاد سفارش کار جدید</Button>
          </Link>
        </div>
      )}
    </div>
  )
} 