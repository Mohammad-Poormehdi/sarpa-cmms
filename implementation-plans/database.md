# Database Implementation with Prisma

## Overview
This document outlines the implementation plan for database connectivity using Prisma ORM in our CMMS (Computerized Maintenance Management System) application.

## Steps

### 1. Install Prisma dependencies ✓
```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Configure database connection ✓
- Update the `.env` file with the database connection string
- Set up a Prisma Postgres database for development

### 3. Define Schema ✓
Create Prisma schema in `prisma/schema.prisma` with the following models:

```prisma
model User {
  id        String      @id @default(cuid())
  name      String
  email     String      @unique
  password  String
  role      UserRole    @default(TECHNICIAN)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  workOrders WorkOrder[]
}

enum UserRole {
  ADMIN
  MANAGER
  TECHNICIAN
}

model Asset {
  id             String      @id @default(cuid())
  name           String
  description    String?
  serialNumber   String?     @unique
  model          String?
  manufacturer   String?
  location       String?
  status         AssetStatus @default(OPERATIONAL)
  purchaseDate   DateTime?
  lastMaintenance DateTime?
  nextMaintenance DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  workOrders     WorkOrder[]
  parts          Part[]
}

enum AssetStatus {
  OPERATIONAL
  DOWN
  MAINTENANCE
  DECOMMISSIONED
}

model WorkOrder {
  id          String            @id @default(cuid())
  title       String
  description String?
  priority    WorkOrderPriority @default(MEDIUM)
  status      WorkOrderStatus   @default(OPEN)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  assignedTo  User?             @relation(fields: [userId], references: [id])
  userId      String?
  asset       Asset             @relation(fields: [assetId], references: [id])
  assetId     String
  tasks       Task[]
  partsUsed   PartUsage[]
}

enum WorkOrderPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum WorkOrderStatus {
  OPEN
  IN_PROGRESS
  ON_HOLD
  COMPLETED
}

model Task {
  id          String      @id @default(cuid())
  description String
  isCompleted Boolean     @default(false)
  workOrder   WorkOrder   @relation(fields: [workOrderId], references: [id])
  workOrderId String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Part {
  id          String      @id @default(cuid())
  name        String
  description String?
  sku         String?     @unique
  quantity    Int         @default(0)
  minQuantity Int         @default(1)
  unitCost    Float?
  location    String?
  asset       Asset?      @relation(fields: [assetId], references: [id])
  assetId     String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  usages      PartUsage[]
}

model PartUsage {
  id          String    @id @default(cuid())
  quantity    Int
  part        Part      @relation(fields: [partId], references: [id])
  partId      String
  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id])
  workOrderId String
  createdAt   DateTime  @default(now())
}
```

### 4. Create database client utility ✓
Create a file `lib/prisma.ts` for database client singleton:

```typescript
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// PrismaClient type augmentation for TypeScript
declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

### 5. Generate and apply migrations ✓
```bash
npx prisma migrate dev --name init
```

### 6. Create API routes
Implement API routes for each model in the `app/api` directory using Prisma client.

### 7. Connect to Prisma Postgres database ✓
- Create a Prisma Postgres database using Prisma platform
- Update connection string in the `.env` file

### 8. Seed initial data (optional)
Create a `prisma/seed.ts` file for initial data and configure the seed script in `package.json`.

## Implementation Tasks

1. [x] Install Prisma dependencies
2. [x] Set up Prisma Postgres database
3. [x] Define schema models
4. [x] Create database client utility
5. [x] Generate and run migrations
6. [ ] Create API routes for data access
7. [ ] Set up data seeding
8. [ ] Test database connectivity
9. [ ] Add proper error handling
10. [ ] Document usage patterns

## Next Steps

The following steps should be completed to finish the database implementation:

1. Create API routes for:
   - User management
   - Asset management
   - Work order management
   - Task management
   - Parts inventory management

2. Set up seed data for testing and development
   - Create sample users
   - Create sample assets
   - Create sample work orders

3. Implement appropriate error handling in database operations
   - Add try/catch blocks
   - Create custom error types
   - Implement logging

4. Add proper validation for data inputs
   - Form validation on the client-side
   - API route validation
   - Database constraint validation

5. Implement authentication and authorization
   - Set up NextAuth.js
   - Secure routes based on user roles
   - Implement JWT handling
