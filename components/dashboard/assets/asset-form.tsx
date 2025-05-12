"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, InfoIcon, PlusIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/ui/file-upload";

// Define the schema for the form based on Asset model
const formSchema = z.object({
  name: z.string().min(1, { message: "نام تجهیز الزامی است" }),
  description: z.string().optional(),
  image: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  purchaseDate: z.date().optional(),
  residualValue: z.coerce.number().optional(),
  usefulLife: z.coerce.number().optional(),
  usefulLifeUnit: z.enum(["day", "week", "month", "year"]).optional(),
  placedInServiceDate: z.date().optional(),
  warrantyExpirationDate: z.date().optional(),
  additionalInformation: z.string().optional(),
  manufacturerId: z.string().optional(),
  workerId: z.string().optional(),
  additionalWorkers: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type Manufacturer = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
};

interface AssetFormProps {
  companyId: string;
  assetId?: string;
  manufacturers: Manufacturer[];
  users: User[];
  initialData?: any; // We'll type this more specifically when we implement backend
}

export default function AssetForm({
  companyId,
  assetId,
  manufacturers,
  users,
  initialData,
}: AssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdditionalWorkers, setSelectedAdditionalWorkers] = useState<string[]>(
    initialData?.additionalWorkers?.map((worker: any) => worker.id) || []
  );
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
      model: initialData?.model || "",
      serialNumber: initialData?.serialNumber || "",
      barcode: initialData?.barcode || "",
      purchasePrice: initialData?.purchasePrice || undefined,
      purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate) : undefined,
      residualValue: initialData?.residualValue || undefined,
      usefulLife: initialData?.usefulLife || undefined,
      usefulLifeUnit: initialData?.usefulLifeUnit || undefined,
      placedInServiceDate: initialData?.placedInServiceDate ? new Date(initialData.placedInServiceDate) : undefined,
      warrantyExpirationDate: initialData?.warrantyExpirationDate ? new Date(initialData.warrantyExpirationDate) : undefined,
      additionalInformation: initialData?.additionalInformation || "",
      manufacturerId: initialData?.manufacturerId || undefined,
      workerId: initialData?.workerId || undefined,
      additionalWorkers: initialData?.additionalWorkers?.map((worker: any) => worker.id) || [],
    },
  });

  // This would be implemented when backend functionality is added
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload happens separately through the FileUpload component,
      // So we just use the URL that was set in the form data
      
      const response = await fetch(`/api/companies/${companyId}/assets${assetId ? `/${assetId}` : ''}`, {
        method: assetId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          additionalWorkers: selectedAdditionalWorkers
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'خطا در ثبت اطلاعات تجهیز');
      }
      
      router.push(`/dashboard/${companyId}/assets`);
    } catch (err: any) {
      console.error('Error submitting asset form:', err);
      setError(err.message || 'خطا در ثبت اطلاعات تجهیز');
      setIsSubmitting(false);
    }
  };

  const handleWorkerSelect = (workerId: string) => {
    const currentWorkers = form.getValues("additionalWorkers") || [];
    
    if (currentWorkers.includes(workerId)) {
      // Remove worker if already selected
      const updatedWorkers = currentWorkers.filter(id => id !== workerId);
      form.setValue("additionalWorkers", updatedWorkers);
      setSelectedAdditionalWorkers(updatedWorkers);
    } else {
      // Add worker if not selected
      const updatedWorkers = [...currentWorkers, workerId];
      form.setValue("additionalWorkers", updatedWorkers);
      setSelectedAdditionalWorkers(updatedWorkers);
    }
  };

  const getUserNameById = (userId: string) => {
    const user = users.find(user => user.id === userId);
    return user ? user.name : "";
  };

  const getManufacturerById = (manufacturerId: string) => {
    const manufacturer = manufacturers.find(m => m.id === manufacturerId);
    return manufacturer ? manufacturer.name : "";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            {assetId ? 'ویرایش تجهیز' : 'ثبت تجهیز جدید'}
          </CardTitle>
          <CardDescription className="text-right">
            اطلاعات لازم برای {assetId ? 'ویرایش' : 'ثبت'} تجهیز را وارد کنید
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
              <Accordion type="multiple" defaultValue={["basic-info", "purchase-info", "additional-info"]} className="w-full">
                
                {/* Basic Information */}
                <AccordionItem value="basic-info">
                  <AccordionTrigger className="text-right">اطلاعات پایه تجهیز</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام تجهیز</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="نام تجهیز" 
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
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مدل</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="مدل تجهیز" 
                                {...field}
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>شماره سریال</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="شماره سریال تجهیز" 
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
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>بارکد</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="بارکد تجهیز" 
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
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="توضیحات تجهیز را وارد کنید" 
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
                      name="image"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>تصویر تجهیز</FormLabel>
                          <FormControl>
                            <FileUpload 
                              value={field.value}
                              onChange={field.onChange}
                              label="آپلود تصویر تجهیز"
                              description="فرمت‌های تصویری مانند JPG، PNG و غیره پشتیبانی می‌شوند"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="manufacturerId"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>سازنده</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              dir="rtl"
                            >
                              <SelectTrigger className="text-right">
                                <SelectValue placeholder="انتخاب سازنده" />
                              </SelectTrigger>
                              <SelectContent>
                                {manufacturers.map((manufacturer) => (
                                  <SelectItem key={manufacturer.id} value={manufacturer.id}>
                                    {manufacturer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                {/* Purchase Information */}
                <AccordionItem value="purchase-info">
                  <AccordionTrigger className="text-right">اطلاعات خرید و مالی</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="purchasePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>قیمت خرید</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="قیمت خرید" 
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
                        name="residualValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ارزش اسقاط</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="ارزش اسقاط" 
                                {...field}
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="purchaseDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>تاریخ خرید</FormLabel>
                            <FormControl>
                              <PersianDatePicker
                                value={field.value as Date}
                                onChange={field.onChange}
                                placeholder="تاریخ خرید را انتخاب کنید"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="placedInServiceDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>تاریخ شروع بهره‌برداری</FormLabel>
                            <FormControl>
                              <PersianDatePicker
                                value={field.value as Date}
                                onChange={field.onChange}
                                placeholder="تاریخ شروع بهره‌برداری را انتخاب کنید"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="usefulLife"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عمر مفید</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="عمر مفید" 
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
                        name="usefulLifeUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>واحد عمر مفید</FormLabel>
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
                      
                      <FormField
                        control={form.control}
                        name="warrantyExpirationDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>تاریخ اتمام گارانتی</FormLabel>
                            <FormControl>
                              <PersianDatePicker
                                value={field.value as Date}
                                onChange={field.onChange}
                                placeholder="تاریخ اتمام گارانتی را انتخاب کنید"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Additional Information */}
                <AccordionItem value="additional-info">
                  <AccordionTrigger className="text-right">اطلاعات تکمیلی و پرسنل</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <FormField
                      control={form.control}
                      name="additionalInformation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اطلاعات تکمیلی</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="اطلاعات تکمیلی تجهیز را وارد کنید" 
                              {...field} 
                              dir="rtl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="workerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>کارشناس اصلی</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                dir="rtl"
                              >
                                <SelectTrigger className="text-right">
                                  <SelectValue placeholder="انتخاب کارشناس اصلی" />
                                </SelectTrigger>
                                <SelectContent>
                                  {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              کارشناس اصلی مسئول نگهداری این تجهیز
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <Label className="mb-2 block">کارشناسان اضافی</Label>
                      <div className="mb-2">
                        {selectedAdditionalWorkers.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedAdditionalWorkers.map((workerId) => (
                              <Badge key={workerId} variant="secondary" className="flex items-center gap-1">
                                {getUserNameById(workerId)}
                                <button
                                  type="button"
                                  onClick={() => handleWorkerSelect(workerId)}
                                  className="text-xs mr-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-2">هیچ کارشناس اضافی انتخاب نشده است</p>
                        )}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <p className="text-sm mb-2">افزودن کارشناس</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {users
                            .filter(user => !selectedAdditionalWorkers.includes(user.id))
                            .map((user) => (
                              <Button
                                key={user.id}
                                type="button"
                                variant="outline"
                                className="justify-start text-right"
                                onClick={() => handleWorkerSelect(user.id)}
                              >
                                <PlusIcon className="h-4 w-4 ml-2" />
                                {user.name}
                              </Button>
                            ))}
                        </div>
                      </div>
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
                  onClick={() => router.push(`/dashboard/${companyId}/assets`)}
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