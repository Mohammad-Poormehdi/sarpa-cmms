import Link from "next/link"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Part } from "@prisma/client"

type PartWithRelations = Part & {
  assets: { name: string }[]
}

interface PartsTableProps {
  parts: PartWithRelations[]
  companyId: string
}

export function PartsTable({
  parts,
  companyId,
}: PartsTableProps) {
  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>تصویر</TableHead>
            <TableHead>نام</TableHead>
            <TableHead>شماره قطعه</TableHead>
            <TableHead>موجودی حداقل</TableHead>
            <TableHead>قطعه حیاتی</TableHead>
            <TableHead>غیر موجودی</TableHead>
            <TableHead>عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow 
              key={part.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <TableCell>
                {part.imageUrl ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-md">
                    <Image 
                      src={part.imageUrl} 
                      alt={part.name} 
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
                <Link href={`/dashboard/${companyId}/parts/${part.id}`} className="hover:underline text-primary">
                  {part.name}
                </Link>
              </TableCell>
              <TableCell>{part.partNumber || "—"}</TableCell>
              <TableCell>{part.minimumQuantity || "—"}</TableCell>
              <TableCell>{part.isCritical ? "بله" : "خیر"}</TableCell>
              <TableCell>{part.isNoneStock ? "بله" : "خیر"}</TableCell>
              <TableCell>
                <Link 
                  href={`/dashboard/${companyId}/parts/${part.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  مشاهده / ویرایش
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 