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
import { Part } from "@prisma/client"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PartsTable } from "@/components/dashboard/parts/parts-table"
import { isAuthenticated } from "@/lib/auth"

type PartWithRelations = Part & {
  assets: { name: string }[]
}

async function getParts(companyId: string) {
  const parts = await prisma.part.findMany({
    where: {
      companyId,
    },
    include: {
      assets: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  return parts
}

export default async function PartsPage({
  params,
}: {
  params: { companyId: string }
}) {
  const user = await isAuthenticated();
  
  if (user.companyId !== params.companyId) {
    throw new Error("غیر مجاز");
  }
  
  const parts = await getParts(params.companyId)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">قطعات</h1>
          <p className="text-sm text-muted-foreground">
            لیست تمام قطعات شرکت شما
          </p>
        </div>
        <Link href={`/dashboard/${params.companyId}/parts/new`}>
          <Button>
            <ClipboardList className="ml-2 h-4 w-4" />
            قطعه جدید
          </Button>
        </Link>
      </div>

      {parts.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="جستجو..."
                className="max-w-[250px]"
                name="search"
              />
              <Button variant="ghost" className={cn("h-8 px-2 lg:px-3")}>
                جستجو
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="critical">قطعات حیاتی</SelectItem>
                  <SelectItem value="noneStock">قطعات غیر موجودی</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Suspense fallback={<div>در حال بارگذاری...</div>}>
            <PartsTable parts={parts} companyId={params.companyId} />
          </Suspense>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg bg-background">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">هیچ قطعه ای وجود ندارد</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            برای شروع، یک قطعه جدید اضافه کنید.
          </p>
          <Link href={`/dashboard/${params.companyId}/parts/new`}>
            <Button className="mt-4" variant="outline">
              قطعه جدید
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
