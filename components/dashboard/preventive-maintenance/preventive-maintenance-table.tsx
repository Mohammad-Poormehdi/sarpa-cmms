import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns-jalali"
import { PreventiveMaintenance } from "@prisma/client"

type MaintenanceWithRelations = PreventiveMaintenance & {
  asset: { name: string } | null
  createdBy: { name: string }
}

interface PreventiveMaintenanceTableProps {
  maintenances: MaintenanceWithRelations[]
  companyId: string
}

export function PreventiveMaintenanceTable({
  maintenances,
  companyId,
}: PreventiveMaintenanceTableProps) {
  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان</TableHead>
            <TableHead>تجهیز</TableHead>
            <TableHead>ایجاد کننده</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>دوره تکرار</TableHead>
            <TableHead>نوع برنامه</TableHead>
            <TableHead>تاریخ شروع</TableHead>
            <TableHead>تاریخ بعدی</TableHead>
            <TableHead>عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maintenances.map((maintenance) => (
            <TableRow 
              key={maintenance.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <TableCell className="font-medium">
                <Link href={`/dashboard/${companyId}/preventive-maintenance/${maintenance.id}`} className="hover:underline text-primary">
                  {maintenance.title}
                </Link>
              </TableCell>
              <TableCell>{maintenance.asset?.name || "—"}</TableCell>
              <TableCell>
                {maintenance.createdBy.name}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    maintenance.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : maintenance.status === "in-progress"
                      ? "bg-slate-100 text-slate-800"
                      : maintenance.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {maintenance.status === "pending"
                    ? "در انتظار"
                    : maintenance.status === "in-progress"
                    ? "در حال انجام"
                    : maintenance.status === "completed"
                    ? "تکمیل شده"
                    : "تاخیر"}
                </span>
              </TableCell>
              <TableCell>
                {`${maintenance.frequency} ${
                  maintenance.timeUnit === "day"
                    ? "روز"
                    : maintenance.timeUnit === "week"
                    ? "هفته"
                    : maintenance.timeUnit === "month"
                    ? "ماه"
                    : "سال"
                }`}
              </TableCell>
              <TableCell>
                {maintenance.scheduleType === "regularInterval"
                  ? "بازه منظم"
                  : "پس از تکمیل"}
              </TableCell>
              <TableCell>
                {format(new Date(maintenance.startDate), "yyyy/MM/dd")}
              </TableCell>
              <TableCell>
                {format(new Date(maintenance.nextDueDate), "yyyy/MM/dd")}
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/${companyId}/preventive-maintenance/${maintenance.id}`} className="text-primary hover:underline">
                  مشاهده
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 