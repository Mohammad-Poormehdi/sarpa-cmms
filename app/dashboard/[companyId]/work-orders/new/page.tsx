import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WorkOrderForm from "@/components/dashboard/work-orders/work-order-form";

type User = {
  id: string;
  name: string;
};

type Asset = {
  id: string;
  name: string;
};

// Get users for the company for assignment
async function getUsers(companyId: string): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });
  return users;
}

// Get assets for the company
async function getAssets(companyId: string): Promise<Asset[]> {
  const assets = await prisma.asset.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });
  return assets;
}

// Get preventive maintenances for the company
async function getPreventiveMaintenances(companyId: string): Promise<{ id: string; title: string }[]> {
  const pms = await prisma.preventiveMaintenance.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      title: true,
    },
  });
  return pms;
}

export default async function NewWorkOrderPage({
  params,
}: {
  params: { companyId: string };
}) {
  const user = await isAuthenticated();
  
  if (!user) {
    redirect("/login");
  }

  const [users, assets, preventiveMaintenances] = await Promise.all([
    getUsers(params.companyId),
    getAssets(params.companyId),
    getPreventiveMaintenances(params.companyId),
  ]);

  return (
    <div className="p-6">
      <WorkOrderForm
        companyId={params.companyId}
        assets={assets}
        users={users}
        preventiveMaintenances={preventiveMaintenances}
      />
    </div>
  );
} 