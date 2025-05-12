"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns-jalali";
import { WorkOrderPriority, WorkOrderStatus } from "@prisma/client";

const priorityLabels: Record<WorkOrderPriority, string> = {
  none: "بدون اولویت",
  low: "کم",
  medium: "متوسط",
  high: "بالا",
};

const priorityColors: Record<WorkOrderPriority, string> = {
  none: "bg-gray-100 text-gray-800",
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusLabels: Record<WorkOrderStatus, string> = {
  pending: "در انتظار",
  inProgress: "در حال انجام",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

const statusColors: Record<WorkOrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  inProgress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

type WorkOrdersTableProps = {
  data: any[];
  total: number;
  companyId: string;
  isLoading?: boolean;
};

export function WorkOrdersTable({
  data,
  total,
  companyId,
  isLoading = false,
}: WorkOrdersTableProps) {
  if (isLoading) {
    return <div>درحال بارگذاری...</div>;
  }

  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان</TableHead>
            <TableHead>اولویت</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>تجهیز</TableHead>
            <TableHead>مسئول انجام</TableHead>
            <TableHead>تاریخ موعد</TableHead>
            <TableHead>عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((workOrder) => (
            <TableRow
              key={workOrder.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/${companyId}/work-orders/${workOrder.id}`}
                  className="hover:underline text-primary"
                >
                  {workOrder.title}
                </Link>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    priorityColors[workOrder.priority as WorkOrderPriority]
                  }`}
                >
                  {priorityLabels[workOrder.priority as WorkOrderPriority]}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    statusColors[workOrder.status as WorkOrderStatus]
                  }`}
                >
                  {statusLabels[workOrder.status as WorkOrderStatus]}
                </span>
              </TableCell>
              <TableCell>{workOrder.asset?.name || "—"}</TableCell>
              <TableCell>{workOrder.assignedTo?.name || "—"}</TableCell>
              <TableCell>
                {workOrder.dueDate
                  ? format(new Date(workOrder.dueDate), "yyyy/MM/dd")
                  : "—"}
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/${companyId}/work-orders/${workOrder.id}`}
                  className="text-primary hover:underline"
                >
                  مشاهده
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 