"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { format } from "date-fns-jalali";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";

const formSchema = z.object({
  title: z.string().min(1, { message: "عنوان دستور کار الزامی است" }),
  description: z.string().optional(),
  status: z.enum(["pending", "inProgress", "completed", "cancelled"], {
    required_error: "وضعیت دستور کار را انتخاب کنید",
  }),
  priority: z.enum(["none", "low", "medium", "high"], {
    required_error: "اولویت دستور کار را انتخاب کنید",
  }),
  dueDate: z.date().optional(),
  assignedToId: z.string().optional(),
  assetId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type User = {
  id: string;
  name: string;
};

export type Asset = {
  id: string;
  name: string;
};

interface WorkOrderFormProps {
  companyId: string;
  workOrderId?: string;
  assets: Asset[];
  users: User[];
  initialData?: Partial<FormValues>;
}

export default function WorkOrderForm({
  companyId,
  workOrderId,
  assets,
  users,
  initialData,
}: WorkOrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
    },
  });

  // Set date fields after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (!initialData?.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      form.setValue("dueDate", tomorrow);
    }
  }, [form, initialData]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Define the API endpoint based on whether we're creating or updating
      const endpoint = workOrderId 
        ? `/api/companies/${companyId}/work-orders/${workOrderId}` 
        : `/api/companies/${companyId}/work-orders`;
      
      const response = await fetch(endpoint, {
        method: workOrderId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ثبت اطلاعات');
      }
      
      const result = await response.json();
      
      // Redirect to the work orders list page after successful submission
      router.push(`/dashboard/${companyId}/work-orders`);
      router.refresh(); // Refresh the page data
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'خطا در ثبت اطلاعات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            {workOrderId ? 'ویرایش دستور کار' : 'ایجاد دستور کار جدید'}
          </CardTitle>
          <CardDescription className="text-right">
            اطلاعات لازم برای {workOrderId ? 'ویرایش' : 'ایجاد'} دستور کار را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-800 rounded-md text-right">
              {error}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>عنوان</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>عنوان دستور کار که باید معنادار و مشخص باشد</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="عنوان دستور کار" 
                          {...field} 
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>وضعیت</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>وضعیت فعلی دستور کار</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          dir="rtl"
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="انتخاب وضعیت" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">در انتظار</SelectItem>
                            <SelectItem value="inProgress">در حال انجام</SelectItem>
                            <SelectItem value="completed">تکمیل شده</SelectItem>
                            <SelectItem value="cancelled">لغو شده</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>توضیحات</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>توضیحات تکمیلی درباره دستور کار و اقدامات لازم</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="توضیحات دستور کار را وارد کنید" 
                        {...field} 
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>اولویت</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>اولویت انجام دستور کار</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          dir="rtl"
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="انتخاب اولویت" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">بدون اولویت</SelectItem>
                            <SelectItem value="low">کم</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="high">زیاد</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <FormLabel>تاریخ سررسید</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>تاریخ موعد اتمام دستور کار</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <PersianDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="تاریخ را انتخاب کنید"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>مسئول انجام</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>کاربری که مسئول انجام دستور کار است</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          dir="rtl"
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="انتخاب مسئول" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>تجهیز</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>تجهیزی که این دستور کار برای آن تعریف می‌شود</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          dir="rtl"
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="انتخاب تجهیز" />
                          </SelectTrigger>
                          <SelectContent>
                            {assets.map(asset => (
                              <SelectItem key={asset.id} value={asset.id}>
                                {asset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/${companyId}/work-orders`)}
                  disabled={isSubmitting}
                >
                  انصراف
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'در حال ذخیره...' : workOrderId ? 'بروزرسانی' : 'ایجاد دستور کار'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 