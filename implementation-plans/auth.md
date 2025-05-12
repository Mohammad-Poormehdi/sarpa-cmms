# One-Day Secure Authentication Implementation Plan

## Step 1: Auth Utilities (1.5 hours)
- Implement bcrypt password hashing and validation
- Create secure JWT token generation with proper expiration
- Setup HTTP-only cookies for secure token storage

## Step 2: API Routes (2.5 hours)
- Create `/api/auth/register` endpoint with input validation
- Create `/api/auth/login` endpoint with basic security
- Add CSRF protection to API routes

## Step 3: UI Components (3 hours)
- Create login form with validation
- Create registration form with password requirements
- Add error handling and user feedback

## Step 4: Route Protection (1 hour)
- Create simple middleware for protected routes
- Add auth check functions for client-side validation

## Security Features:
1. **Password Security**: Use bcrypt with appropriate salt rounds
2. **Session Management**: HTTP-only cookies with secure flag
3. **CSRF Protection**: Use tokens for form submissions
4. **Input Validation**: Server-side validation for all inputs

## Implementation Details

### Auth Utilities
- Create a `lib/auth.ts` file for authentication utilities
- Implement password hashing using bcrypt
- Create JWT generation and validation functions

### API Routes
- Build `/api/auth/register` for creating new users
- Build `/api/auth/login` for authenticating users
- Add validation using Zod schemas

### UI Components
- Create `app/login/page.tsx` with login form
- Create `app/register/page.tsx` with registration form
- Use React Hook Form for form management
- Use Axios for API calls

### Route Protection
- Create middleware in `middleware.ts` to check authentication status
- Implement redirect logic for unauthenticated users
- Add helper utilities for client-side auth checks

## Timeline
- Morning: Complete Steps 1 & 2
- Afternoon: Complete Steps 3 & 4
- Evening: Testing and bug fixes

# Detailed Technical Implementation

## Step 0: Install Axios

```bash
npm install axios
```

## Step 1: Auth Utilities

### 1.1 Create Auth Library (lib/auth.ts)

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'replace-this-with-a-real-secret-key');

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT generation
export async function createToken(userId: string, email: string): Promise<string> {
  const token = await new SignJWT({ 
    userId, 
    email 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(JWT_SECRET);
  
  return token;
}

// JWT verification
export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(token: string) {
  cookies().set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/'
  });
}

// Get auth cookie
export function getAuthCookie() {
  return cookies().get('auth-token')?.value;
}

// Remove auth cookie (logout)
export function removeAuthCookie() {
  cookies().delete('auth-token');
}

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  companyId: z.string().min(1, { message: "Company ID is required" }),
});
```

### 1.2 Create Axios Instance (lib/axios.ts)

```typescript
import axios from 'axios';

// Create a custom axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '', // Empty string means relative to current origin
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies to be sent with requests
});

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Any status codes outside the range of 2xx trigger this function
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

## Step 2: API Routes

### 2.1 Create Register Endpoint (app/api/auth/register/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, registerSchema, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { name, email, password, companyId } = result.data;
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        companyId
      }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId
      }
    });
    
    // Create JWT
    const token = await createToken(user.id, user.email);
    
    // Set cookie
    setAuthCookie(token);
    
    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
```

### 2.2 Create Login Endpoint (app/api/auth/login/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, loginSchema, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { email, password } = result.data;
    
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        companyId: body.companyId // This should be sent from the login form
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create JWT
    const token = await createToken(user.id, user.email);
    
    // Set cookie
    setAuthCookie(token);
    
    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
```

### 2.3 Create Logout Endpoint (app/api/auth/logout/route.ts)

```typescript
import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  removeAuthCookie();
  return NextResponse.json({ success: true });
}
```

## Step 3: UI Components

### 3.1 Create Persian Login Form (app/login/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/auth';
import Link from 'next/link';
import axios from '@/lib/axios';
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/login', data);
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'ورود ناموفق بود');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-6" />
                  </div>
                  <span className="sr-only">سیستم سرپا</span>
                </a>
                <h1 className="text-xl font-bold">به سیستم سرپا خوش آمدید</h1>
                <div className="text-center text-sm">
                  حساب کاربری ندارید؟{" "}
                  <Link href="/register" className="underline underline-offset-4">
                    ثبت نام
                  </Link>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="************"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'در حال ورود...' : 'ورود'}
                </Button>
              </div>
            </div>
          </form>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            با کلیک بر روی ادامه، شما با <a href="#">شرایط استفاده از خدمات</a> و{" "}
            <a href="#">سیاست حفظ حریم خصوصی</a> ما موافقت می کنید.
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Create Persian Registration Form (app/register/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/auth';
import Link from 'next/link';
import axios from '@/lib/axios';
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/register', data);
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'ثبت نام ناموفق بود');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-6" />
                  </div>
                  <span className="sr-only">سیستم سرپا</span>
                </a>
                <h1 className="text-xl font-bold">ثبت نام در سیستم سرپا</h1>
                <div className="text-center text-sm">
                  حساب کاربری دارید؟{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    ورود
                  </Link>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">نام</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="نام و نام خانوادگی"
                    {...register('name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="************"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="companyId">شرکت</Label>
                  <select
                    id="companyId"
                    className="w-full p-2 border rounded"
                    {...register('companyId')}
                    disabled={isLoading}
                  >
                    <option value="">انتخاب شرکت</option>
                    {/* This would be populated from an API call */}
                    <option value="company-id-1">شرکت 1</option>
                    <option value="company-id-2">شرکت 2</option>
                  </select>
                  {errors.companyId && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyId.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'در حال ثبت نام...' : 'ثبت نام'}
                </Button>
              </div>
            </div>
          </form>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            با کلیک بر روی ادامه، شما با <a href="#">شرایط استفاده از خدمات</a> و{" "}
            <a href="#">سیاست حفظ حریم خصوصی</a> ما موافقت می کنید.
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Step 4: Route Protection

### 4.1 Create Authentication Middleware (middleware.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/dashboard/work-orders',
  '/dashboard/inventory',
  '/dashboard/settings'
];

// Define public routes
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // If it's a protected route and no token exists, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If token exists, verify it
  if (token) {
    const decoded = await verifyToken(token);
    
    // If token is invalid and trying to access protected route, redirect to login
    if (!decoded && isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // If token is valid and trying to access public route (login/register), redirect to dashboard
    if (decoded && isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

### 4.2 Create Auth Utils for Client Components (lib/client-auth.ts)

```typescript
'use client';

import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

// Client-side logout function
export async function logout() {
  const router = useRouter();
  
  try {
    await axios.post('/api/auth/logout');
    
    router.push('/login');
    router.refresh(); // Force refresh to update UI
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Helper function to get current user from API on client
export async function getCurrentUser() {
  try {
    const response = await axios.get('/api/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
```

### 4.3 Create API Endpoint to Get Current User (app/api/auth/me/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = getAuthCookie();
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
```

## Additional Steps and Testing

### Create JWT Secret

1. Add a secure JWT secret to your .env file:
```
JWT_SECRET=your-secure-random-string-here
```

### Test the Authentication Flow

1. Start the development server:
```
npm run dev
```

2. Test the registration flow:
   - Navigate to /register
   - Create a new account
   - Verify you're redirected to the dashboard

3. Test the login flow:
   - Navigate to /login
   - Log in with your credentials
   - Verify you're redirected to the dashboard

4. Test protected routes:
   - Try accessing /dashboard without being logged in
   - Verify you're redirected to the login page

5. Test the logout flow:
   - Log out from the dashboard
   - Verify you're redirected to the login page
   - Try accessing protected routes again
