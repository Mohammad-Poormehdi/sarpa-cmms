import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await isAuthenticated()

  if (user?.companyId) {
    redirect(`/dashboard/${user.companyId}/work-orders`)
  } else {
    // This case should not be reached for an authenticated user
    // because every user should have a company.
    // As a fallback, redirect to login.
    redirect("/login")
  }
}
