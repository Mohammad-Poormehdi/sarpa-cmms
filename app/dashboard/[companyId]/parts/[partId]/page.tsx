import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"
import { notFound } from "next/navigation"
import { PartForm } from "@/components/dashboard/parts"

async function getPart(partId: string) {
  if (partId === "new") {
    return null
  }

  const part = await prisma.part.findUnique({
    where: {
      id: partId,
    },
    include: {
      assets: true,
    }
  })

  if (!part) {
    notFound()
  }

  return part
}

export default async function PartFormPage({
  params,
}: {
  params: { companyId: string; partId: string }
}) {
  const user = await isAuthenticated()
  
  if (user.companyId !== params.companyId) {
    throw new Error("غیر مجاز")
  }

  const part = await getPart(params.partId)

  return (
    <div className="py-4">
      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <PartForm
          companyId={params.companyId}
          partId={params.partId !== "new" ? params.partId : undefined}
          initialData={part}
        />
      </Suspense>
    </div>
  )
}
