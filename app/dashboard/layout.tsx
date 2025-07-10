import { AppSidebar } from "@/components/app-sidebar"
import { isAuthenticated } from "@/lib/auth"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { name, email } = await isAuthenticated()

  return (
    <div dir="rtl" >
      <SidebarProvider>
        <AppSidebar side="right" name={name} email={email} />
        <SidebarInset>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
} 