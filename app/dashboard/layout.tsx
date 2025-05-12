import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div dir="rtl" >
      <SidebarProvider>
        <AppSidebar side="right" />
        <SidebarInset>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
} 