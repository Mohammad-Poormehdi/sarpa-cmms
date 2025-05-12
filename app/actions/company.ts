"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { PrismaClient, Prisma } from "@prisma/client"

type CreateCompanyResult = {
  success?: boolean
  error?: string
}

export async function createCompany(formData: FormData): Promise<CreateCompanyResult> {
  try {
    const name = formData.get("name") as string
    const userId = formData.get("userId") as string

    if (!name || !name.trim()) {
      return { error: "لطفا نام شرکت را وارد کنید" }
    }

    if (!userId) {
      return { error: "خطای سیستمی: شناسه کاربر یافت نشد" }
    }

    // Create company and connect it to user in a transaction
    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the company
      const company = await tx.company.create({
        data: {
          name: name.trim(),
        },
      })

      // Create relationship between user and company
      await tx.userCompany.create({
        data: {
          userId,
          companyId: company.id,
          role: "admin", // The creator of the company gets admin role
        },
      })

      return company
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error creating company:", error)
    return { error: "خطا در ایجاد شرکت. لطفا دوباره تلاش کنید" }
  }
} 