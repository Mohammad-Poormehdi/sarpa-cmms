import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/app/dashboard/[companyId]/preventive-maintenance/[pm_id]/page";
import { formatDate } from "@/lib/utils";

// Function to get status badge color
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
    case "باز":
      return <Badge variant="outline">باز</Badge>;
    case "in progress":
    case "در حال انجام":
      return <Badge variant="secondary">در حال انجام</Badge>;
    case "completed":
    case "تکمیل شده":
      return <Badge variant="success">تکمیل شده</Badge>;
    case "cancelled":
    case "لغو شده":
      return <Badge variant="destructive">لغو شده</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Function to get priority badge color
const getPriorityBadge = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
    case "بالا":
      return <Badge variant="destructive">بالا</Badge>;
    case "medium":
    case "متوسط":
      return <Badge variant="warning">متوسط</Badge>;
    case "low":
    case "پایین":
      return <Badge variant="default">پایین</Badge>;
    case "none":
    case "بدون":
      return <Badge variant="outline">بدون</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

interface PMWorkOrdersTableProps {
  workOrders: WorkOrder[];
  companyId: string;
}

export default function PMWorkOrdersTable({ workOrders, companyId }: PMWorkOrdersTableProps) {
  if (!workOrders.length) return null;

  return (
    <div className="border rounded-md bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>اولویت</TableHead>
            <TableHead>موعد اجرا</TableHead>
            <TableHead>تخصیص به</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo) => (
            <TableRow key={wo.id}>
              <TableCell className="font-medium">{wo.title}</TableCell>
              <TableCell>{getStatusBadge(wo.status)}</TableCell>
              <TableCell>{getPriorityBadge(wo.priority)}</TableCell>
              <TableCell>{wo.dueDate ? formatDate(wo.dueDate) : "-"}</TableCell>
              <TableCell>{wo.assignedToName || "-"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/dashboard/${companyId}/work-orders/${wo.id}`}>
                    مشاهده
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 