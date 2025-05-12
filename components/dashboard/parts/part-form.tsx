"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/ui/file-upload";

// Define the schema for the form based on Part model
const formSchema = z.object({
  name: z.string().min(1, { message: "نام قطعه الزامی است" }),
  partNumber: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isNoneStock: z.boolean(),
  isCritical: z.boolean(),
  additionalInformation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PartFormProps {
  companyId: string;
  partId?: string;
  initialData?: any; // Will type more specifically when implementing backend
}

export default function PartForm({
  companyId,
  partId,
  initialData,
}: PartFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      partNumber: initialData?.partNumber || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      isNoneStock: initialData?.isNoneStock ?? false,
      isCritical: initialData?.isCritical ?? false,
      additionalInformation: initialData?.additionalInformation || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/companies/${companyId}/parts${partId ? `/${partId}` : ''}`, {
        method: partId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'خطا در ثبت اطلاعات قطعه');
      }
      
      router.push(`/dashboard/${companyId}/parts`);
    } catch (err: any) {
      console.error('Error submitting part form:', err);
      setError(err.message || 'خطا در ثبت اطلاعات قطعه');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            {partId ? 'ویرایش قطعه' : 'ثبت قطعه جدید'}
          </CardTitle>
          <CardDescription className="text-right">
            اطلاعات لازم برای {partId ? 'ویرایش' : 'ثبت'} قطعه را وارد کنید
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
              <Accordion type="multiple" defaultValue={["basic-info", "status-info"]} className="w-full">
                
                {/* Basic Information */}
                <AccordionItem value="basic-info">
                  <AccordionTrigger className="text-right">اطلاعات پایه قطعه</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام قطعه</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="نام قطعه" 
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
                        name="partNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>شماره قطعه</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="شماره قطعه" 
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
                              placeholder="توضیحات قطعه را وارد کنید" 
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
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>تصویر قطعه</FormLabel>
                          <FormControl>
                            <FileUpload 
                              value={field.value}
                              onChange={field.onChange}
                              label="آپلود تصویر قطعه"
                              description="فرمت‌های تصویری مانند JPG، PNG و غیره پشتیبانی می‌شوند"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                {/* Status Information */}
                <AccordionItem value="status-info">
                  <AccordionTrigger className="text-right">اطلاعات وضعیت</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="isNoneStock"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 rtl:space-x-reverse">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                // @ts-ignore
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>قطعه بدون موجودی</FormLabel>
                              <FormDescription>
                                این قطعه در انبار نگهداری نمی‌شود و در صورت نیاز سفارش داده می‌شود
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isCritical"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 rtl:space-x-reverse">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                // @ts-ignore
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>قطعه حیاتی</FormLabel>
                              <FormDescription>
                                زمانی که این قطعه برای عملکرد سیستم حیاتی است
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="additionalInformation"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>اطلاعات تکمیلی</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="اطلاعات تکمیلی قطعه را وارد کنید" 
                              {...field} 
                              dir="rtl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  onClick={() => router.push(`/dashboard/${companyId}/parts`)}
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