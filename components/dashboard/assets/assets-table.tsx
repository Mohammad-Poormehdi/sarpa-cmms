import Link from "next/link"
import Image from "next/image"
import { Edit } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns-jalali"
import { Asset } from "@prisma/client"

type AssetWithRelations = Asset & {
  manufacturer: { name: string } | null
  worker: { name: string } | null
}

interface AssetsTableProps {
  assets: AssetWithRelations[]
  companyId: string
}

export function AssetsTable({
  assets,
  companyId,
}: AssetsTableProps) {
  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>تصویر</TableHead>
            <TableHead>نام</TableHead>
            <TableHead>مدل</TableHead>
            <TableHead>سریال</TableHead>
            <TableHead>سازنده</TableHead>
            <TableHead>کاربر مسئول</TableHead>
            <TableHead>تاریخ خرید</TableHead>
            <TableHead>قیمت خرید</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow 
              key={asset.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <TableCell>
                {asset.image ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-md">
                    <Image 
                      src={asset.image} 
                      alt={asset.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                    —
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/dashboard/${companyId}/assets/${asset.id}`} className="hover:underline text-primary">
                  {asset.name}
                </Link>
              </TableCell>
              <TableCell>{asset.model || "—"}</TableCell>
              <TableCell>{asset.serialNumber || "—"}</TableCell>
              <TableCell>{asset.manufacturer?.name || "—"}</TableCell>
              <TableCell>{asset.worker?.name || "—"}</TableCell>
              <TableCell>
                {asset.purchaseDate 
                  ? format(asset.purchaseDate, "yyyy/MM/dd") 
                  : "—"}
              </TableCell>
              <TableCell>
                {asset.purchasePrice 
                  ? `${asset.purchasePrice.toLocaleString()} تومان` 
                  : "—"}
              </TableCell>
              <TableCell>
                <Link 
                  href={`/dashboard/${companyId}/assets/${asset.id}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 