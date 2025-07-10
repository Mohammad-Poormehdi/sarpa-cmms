"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
}) {
  console.log("🚀 Starting user registration process:", { 
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    companyName: formData.companyName,
    // Not logging password for security
  });
  
  try {
    // Check if user already exists
    console.log("👀 Checking if user already exists with email:", formData.email);
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    if (existingUser) {
      console.log("❌ User already exists with email:", formData.email);
      return { success: false, message: "ایمیل قبلاً ثبت شده است" };
    }
    console.log("✅ Email check passed, user does not exist");

    // Hash the password
    console.log("🔒 Hashing password...");
    const hashedPassword = await hash(formData.password, 10);
    console.log("✅ Password hashed successfully");
    
    // Create new company
    console.log("🏢 Creating new company:", formData.companyName);
    const company = await prisma.company.create({
      data: {
        name: formData.companyName,
      },
    });
    console.log("✅ Company created successfully:", { companyId: company.id, companyName: company.name });
    
    // Create new user with company association
    console.log("👤 Creating new user with company association");
    const user = await prisma.user.create({
      data: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: hashedPassword,
        companyId: company.id,
      },
    });
    console.log("✅ User created successfully:", { userId: user.id, email: user.email });

    revalidatePath("/");
    console.log("🎉 Registration completed successfully");
    return {
      success: true,
      message: "ثبت نام با موفقیت انجام شد",
      companyId: company.id,
    };
  } catch (error) {
    console.error("❌ Error during registration process:", error);
    return { success: false, message: "خطا در ثبت نام. لطفا دوباره تلاش کنید" };
  }
} 