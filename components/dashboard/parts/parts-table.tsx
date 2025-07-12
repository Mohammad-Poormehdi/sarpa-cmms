"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, X, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deletePart } from "@/app/actions/work-order";
import { Part } from "@prisma/client";

type PartWithRelations = Part & {
  assets: { name: string }[];
};

interface PartsTableProps {
  parts: PartWithRelations[];
  companyId: string;
}

export function PartsTable({
  parts,
  companyId,
}: PartsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (partId: string) => {
    setPartToDelete(partId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deletePart(partToDelete, companyId);
      if (result.success) {
        setDeleteDialogOpen(false);
        setPartToDelete(null);
      } else {
        alert(result.error || "خطا در حذف قطعه");
      }
    } catch (error) {
      alert("خطا در حذف قطعه");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
              <TableHead></TableHead>
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
                <TableCell>
                  {part.isCritical ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  {part.isNoneStock ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/${companyId}/parts/${part.id}`}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(part.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">حذف قطعه</DialogTitle>
            <DialogDescription className="text-right">
              آیا از حذف این قطعه اطمینان دارید؟ این عمل قابل برگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              لغو
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "در حال حذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 