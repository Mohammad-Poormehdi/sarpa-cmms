"use client"

import * as React from "react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerUser } from "@/app/actions/auth"
import { useState } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PasswordStrengthMeter } from "@/components/ui/password-strength"

const signUpFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "نام باید حداقل 2 حرف باشد",
  }),
  lastName: z.string().min(2, {
    message: "نام خانوادگی باید حداقل 2 حرف باشد",
  }),
  companyName: z.string().min(2, {
    message: "نام شرکت باید حداقل 2 حرف باشد",
  }),
  email: z.string().email({
    message: "لطفا یک ایمیل معتبر وارد کنید",
  }),
  password: z.string().min(8, {
    message: "رمز عبور باید حداقل 8 کاراکتر باشد",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن باید یکسان باشند",
  path: ["confirmPassword"],
})

type SignUpFormValues = z.infer<typeof signUpFormSchema>

type SignUpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignUpDialog({ open, onOpenChange }: SignUpDialogProps) {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // State to track password for strength meter
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(data: SignUpFormValues) {
    try {
      setIsSubmitting(true)
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        email: data.email,
        password: data.password,
      })

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("خطا در ثبت نام. لطفا دوباره تلاش کنید")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">ثبت نام برای دوره آزمایشی رایگان</DialogTitle>
          <DialogDescription className="text-center">
            لطفا اطلاعات خود را وارد کنید تا دوره آزمایشی رایگان شما آغاز شود.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام</FormLabel>
                    <FormControl>
                      <Input placeholder="نام" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="نام خانوادگی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام شرکت</FormLabel>
                  <FormControl>
                    <Input placeholder="نام شرکت" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ایمیل</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ایمیل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="رمز عبور" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e)
                        setPassword(e.target.value)
                      }}
                    />
                  </FormControl>
                  <PasswordStrengthMeter password={password} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تکرار رمز عبور</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="تکرار رمز عبور" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "در حال ثبت نام..." : "ثبت نام"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 