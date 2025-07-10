import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { prisma } from "@/lib/prisma"
import { Asset } from "@prisma/client"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AssetsTable } from "@/components/dashboard/assets/assets-table"
import { isAuthenticated } from "@/lib/auth"

type AssetWithRelations = Asset & {
  manufacturer: { name: string } | null
  worker: { name: string } | null
}

async function getAssets(companyId: string) {
  const assets = await prisma.asset.findMany({
    where: {
      companyId,
    },
    include: {
      manufacturer: true,
      worker: true,
    },
    orderBy: {
      name: 'asc'
    }
  })
  return assets
}

export default async function AssetsPage({
  params,
}: {
  params: { companyId: string }
}) {
  const user = await isAuthenticated();
  
  if (!user) {
    redirect("/login")
  }
  
  if (user.companyId !== params.companyId) {
    throw new Error("غیر مجاز");
  }
  
  const assets = await getAssets(params.companyId)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">تجهیزات</h1>
          <p className="text-sm text-muted-foreground">
            لیست تمام تجهیزات شرکت شما
          </p>
        </div>
        <Link href={`/dashboard/${params.companyId}/assets/new`}>
          <Button>
            <ClipboardList className="ml-2 h-4 w-4" />
            تجهیز جدید
          </Button>
        </Link>
      </div>

      {assets.length > 0 ? (
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
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="inactive">غیرفعال</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Suspense fallback={<div>در حال بارگذاری...</div>}>
            <AssetsTable assets={assets} companyId={params.companyId} />
          </Suspense>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg bg-background">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">هیچ تجهیزی وجود ندارد</h3>
          <p className="mt-2 text-sm text-muted-foreground">برای شروع، یک تجهیز جدید اضافه کنید.</p>
          <Link href={`/dashboard/${params.companyId}/assets/new`}>
            <Button className="mt-4" variant="outline">تجهیز جدید</Button>
          </Link>
        </div>
      )}
    </div>
  )
} 