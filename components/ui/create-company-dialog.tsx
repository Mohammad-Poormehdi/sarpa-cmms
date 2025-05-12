"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCompany } from "@/app/actions/company"

interface CreateCompanyDialogProps {
  trigger: React.ReactNode
  userId: string
}

export function CreateCompanyDialog({ trigger, userId }: CreateCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await createCompany(formData)
    
    setIsLoading(false)
    
    if (result.error) {
      setError(result.error)
      return
    }
    
    setOpen(false)
    router.refresh()
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>ایجاد شرکت جدید</DialogTitle>
          <DialogDescription>
            نام شرکت جدید را وارد کنید
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />
          <div className="space-y-2">
            <Label htmlFor="name">نام شرکت</Label>
            <Input id="name" name="name" placeholder="نام شرکت را وارد کنید" required />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "در حال ایجاد..." : "ایجاد شرکت"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 