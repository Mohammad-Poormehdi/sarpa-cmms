import { Icons } from "@/components/ui/icons";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Icons.spinner className="h-12 w-12 animate-spin" />
    </div>
  );
}
