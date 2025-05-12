import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AssetForm from "@/components/dashboard/assets/asset-form";

// Define the manufacturer type for the form
export type Manufacturer = {
  id: string;
  name: string;
};

// Define the user type for the form
export type User = {
  id: string;
  name: string;
};

// Fetch asset data from the database
async function getAssetData(assetId: string, companyId: string) {
  // If assetId is "new", return null
  if (assetId === "new") {
    return null;
  }

  // Fetch the asset data from the database
  const asset = await prisma.asset.findFirst({
    where: {
      id: assetId,
      companyId: companyId,
    },
    include: {
      manufacturer: true,
      worker: true,
      additionalWorkers: true,
    },
  });

  return asset;
}

// Fetch manufacturers from the database
async function getManufacturers(companyId: string): Promise<Manufacturer[]> {
  const manufacturers = await prisma.manufacturer.findMany({
    where: {
      companyId: companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return manufacturers;
}

// Fetch users from the database
async function getUsers(companyId: string): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      companyId: companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return users;
}

export default async function AssetPage({
  params,
}: {
  params: { companyId: string; assetId: string };
}) {
  // Fetch data in parallel
  const [asset, manufacturers, users] = await Promise.all([
    getAssetData(params.assetId, params.companyId),
    getManufacturers(params.companyId),
    getUsers(params.companyId),
  ]);

  // If we're editing an asset that doesn't exist, return 404
  if (params.assetId !== "new" && !asset) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AssetForm
        companyId={params.companyId}
        assetId={params.assetId === "new" ? undefined : params.assetId}
        manufacturers={manufacturers}
        users={users}
        initialData={asset || undefined}
      />
    </div>
  );
}
