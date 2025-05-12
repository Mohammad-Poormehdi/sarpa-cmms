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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  // Preventive Maintenance fields
  title: z.string().min(1, { message: "عنوان نگهداری الزامی است" }),
  description: z.string().optional(),
  scheduleType: z.enum(["regularInterval", "afterCompletion"], {
    required_error: "نوع زمان‌بندی را انتخاب کنید",
  }),
  frequency: z.coerce.number().positive({
    message: "فرکانس باید یک عدد مثبت باشد",
  }),
  timeUnit: z.enum(["day", "week", "month", "year"], {
    required_error: "واحد زمانی را انتخاب کنید",
  }),
  createWOsDaysBeforeDue: z.coerce.number().optional(),
  startDate: z.date({
    required_error: "تاریخ شروع الزامی است",
  }),
  endDate: z.date().optional(),
  nextDueDate: z.date({
    required_error: "تاریخ سررسید بعدی الزامی است",
  }),
  assignedToId: z.string().optional(),
  assetId: z.string().optional(),
  
  // Work Order fields
  workOrderTitle: z.string().min(1, { message: "عنوان دستور کار الزامی است" }),
  workOrderDescription: z.string().optional(),
  workOrderPriority: z.enum(["none", "low", "medium", "high"], {
    required_error: "اولویت دستور کار را انتخاب کنید",
  }),
  createWorkOrderNow: z.boolean(),
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

interface PreventiveMaintenanceFormProps {
  companyId: string;
  pmId?: string;
  assets: Asset[];
  users: User[];
  initialData?: Partial<FormValues>;
}

export default function PreventiveMaintenanceForm({
  companyId,
  pmId,
  assets,
  users,
  initialData,
}: PreventiveMaintenanceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      scheduleType: "regularInterval",
      frequency: 1,
      timeUnit: "day",
      createWOsDaysBeforeDue: 7,
      
      // Work Order default values
      workOrderTitle: "",
      workOrderDescription: "",
      workOrderPriority: "medium",
      createWorkOrderNow:false,
    },
  });

  // Set date fields after component mounts to avoid hydration mismatch
  useEffect(() => {
    // Only set dates on the client side if not provided in initialData
    if (!initialData?.startDate || !initialData?.nextDueDate) {
      const now = new Date();
      if (!initialData?.startDate) {
        form.setValue("startDate", now);
      }
      if (!initialData?.nextDueDate) {
        form.setValue("nextDueDate", now);
      }
    }
  }, [form, initialData]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Define the API endpoint based on whether we're creating or updating
      const endpoint = pmId 
        ? `/api/companies/${companyId}/preventive-maintenance/${pmId}` 
        : `/api/companies/${companyId}/preventive-maintenance`;
      
      const response = await fetch(endpoint, {
        method: pmId ? 'PUT' : 'POST',
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
      
      // Redirect to the preventive maintenance list page after successful submission
      router.push(`/dashboard/${companyId}/preventive-maintenance`);
      router.refresh(); // Refresh the page data
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'خطا در ثبت اطلاعات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            {pmId ? 'ویرایش برنامه نگهداری پیشگیرانه' : 'ایجاد برنامه نگهداری پیشگیرانه'}
          </CardTitle>
          <CardDescription className="text-right">
            اطلاعات لازم برای {pmId ? 'ویرایش' : 'ایجاد'} برنامه نگهداری پیشگیرانه را وارد کنید
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
              <Accordion type="multiple" defaultValue={["preventive-maintenance", "work-order"]} className="w-full">
                <AccordionItem value="preventive-maintenance">
                  <AccordionTrigger className="text-right">اطلاعات نگهداری پیشگیرانه</AccordionTrigger>
                  <AccordionContent className="pt-4">
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
                                  <p>عنوان برنامه نگهداری پیشگیرانه که باید معنادار و مشخص باشد</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="عنوان برنامه نگهداری" 
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
                                  <p>تجهیزی که این برنامه نگهداری برای آن تعریف می‌شود</p>
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

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <div className="flex items-center gap-2">
                            <FormLabel>توضیحات</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>توضیحات تکمیلی درباره برنامه نگهداری پیشگیرانه و اقدامات لازم</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <FormControl>
                            <Textarea 
                              placeholder="توضیحات برنامه نگهداری را وارد کنید" 
                              {...field} 
                              dir="rtl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="scheduleType"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>نوع زمان‌بندی</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>بازه زمانی منظم: ایجاد برنامه نگهداری بر اساس زمان‌بندی دقیق</p>
                                  <p>پس از تکمیل: ایجاد نگهداری بعدی پس از اتمام نگهداری فعلی</p>
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
                                  <SelectValue placeholder="انتخاب نوع زمان‌بندی" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="regularInterval">بازه زمانی منظم</SelectItem>
                                  <SelectItem value="afterCompletion">پس از تکمیل</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              نحوه زمان‌بندی نگهداری را مشخص کنید
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>فرکانس</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>تعداد واحدهای زمانی بین هر بار اجرای برنامه نگهداری</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                placeholder="1" 
                                {...field} 
                                dir="rtl"
                              />
                            </FormControl>
                            <FormDescription>
                              چند واحد زمانی بین هر نگهداری
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeUnit"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>واحد زمانی</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>واحد زمانی برای محاسبه فاصله بین هر بار اجرای برنامه نگهداری</p>
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
                                  <SelectValue placeholder="انتخاب واحد زمانی" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="day">روز</SelectItem>
                                  <SelectItem value="week">هفته</SelectItem>
                                  <SelectItem value="month">ماه</SelectItem>
                                  <SelectItem value="year">سال</SelectItem>
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
                      name="createWOsDaysBeforeDue"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <div className="flex items-center gap-2">
                            <FormLabel>ایجاد دستور کار چند روز قبل از سررسید</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>چند روز قبل از موعد سررسید نگهداری، دستور کار به صورت خودکار ایجاد شود</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="7" 
                              {...field} 
                              dir="rtl"
                            />
                          </FormControl>
                          <FormDescription>
                            چند روز قبل از سررسید، دستور کار ایجاد شود (اختیاری)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <FormLabel>تاریخ شروع</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>تاریخ شروع برنامه نگهداری پیشگیرانه</p>
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

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <FormLabel>تاریخ پایان (اختیاری)</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>تاریخ پایان برنامه نگهداری پیشگیرانه (اگر مشخص نشود، برنامه بدون محدودیت زمانی ادامه می‌یابد)</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <FormControl>
                              <PersianDatePicker
                                value={field.value as Date}
                                onChange={field.onChange}
                                placeholder="تاریخ را انتخاب کنید"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nextDueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <FormLabel>تاریخ سررسید بعدی</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>تاریخ سررسید اولین نگهداری پیشگیرانه</p>
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

                    <FormField
                      control={form.control}
                      name="assignedToId"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <div className="flex items-center gap-2">
                            <FormLabel>کاربر مسئول</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>کاربری که مسئول نظارت بر این برنامه نگهداری پیشگیرانه است</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ""}
                              dir="rtl"
                            >
                              <SelectTrigger className="text-right">
                                <SelectValue placeholder="انتخاب کاربر" />
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
                          <FormDescription>
                            کاربری که مسئول این نگهداری است (اختیاری)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="work-order" className="mt-4">
                  <AccordionTrigger className="text-right">اطلاعات دستور کار</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <p className="text-sm text-right text-muted-foreground mb-4">
                      این اطلاعات برای ایجاد دستور کار زمانی که نگهداری پیشگیرانه سررسید شود استفاده می‌شود.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="workOrderTitle"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>عنوان دستور کار</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>عنوان دستور کاری که به صورت خودکار ایجاد می‌شود</p>
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
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="workOrderDescription"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <div className="flex items-center gap-2">
                            <FormLabel>توضیحات دستور کار</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>توضیحات و دستورالعمل‌های دستور کار که به تکنسین کمک می‌کند تا بداند چه کاری باید انجام دهد</p>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="workOrderPriority"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <div className="flex items-center gap-2">
                              <FormLabel>اولویت دستور کار</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>اولویت انجام دستور کار که اهمیت و فوریت آن را نشان می‌دهد</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <FormControl>
                              <div className="relative w-full">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full flex justify-between items-center text-right"
                                      dir="rtl"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className={`inline-block w-3 h-3 rounded-full ${
                                            field.value === "none" ? "bg-gray-400" :
                                            field.value === "low" ? "bg-blue-500" :
                                            field.value === "medium" ? "bg-yellow-500" :
                                            "bg-red-500"
                                          }`}
                                        />
                                        {field.value === "none" && "بدون اولویت"}
                                        {field.value === "low" && "کم"}
                                        {field.value === "medium" && "متوسط"}
                                        {field.value === "high" && "بالا"}
                                      </div>
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-56 p-0">
                                    <div className="space-y-1 p-1">
                                      <Button
                                        variant="ghost"
                                        className="w-full flex justify-start items-center gap-2 text-right"
                                        onClick={() => field.onChange("none")}
                                        dir="rtl"
                                      >
                                        <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />
                                        <span>بدون اولویت</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="w-full flex justify-start items-center gap-2 text-right"
                                        onClick={() => field.onChange("low")}
                                        dir="rtl"
                                      >
                                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                                        <span>کم</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="w-full flex justify-start items-center gap-2 text-right"
                                        onClick={() => field.onChange("medium")}
                                        dir="rtl"
                                      >
                                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" />
                                        <span>متوسط</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="w-full flex justify-start items-center gap-2 text-right"
                                        onClick={() => field.onChange("high")}
                                        dir="rtl"
                                      >
                                        <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                                        <span>بالا</span>
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </FormControl>
                            <FormDescription>
                              اولویت انجام دستور کار
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="createWorkOrderNow"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                ایجاد دستور کار هم‌اکنون
                              </FormLabel>
                              <FormDescription>
                                علاوه بر ایجاد خودکار دستور کار در زمان سررسید، یک دستور کار نیز هم‌اکنون ایجاد شود
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end mt-8">
                <Button 
                  type="submit" 
                  className="ml-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.push(`/dashboard/${companyId}/preventive-maintenance`)}
                  disabled={isSubmitting}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 