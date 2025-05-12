"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { Suspense } from "react";

export default function AIPage() {
  return (
      <Suspense fallback={<div className="w-full h-[500px] flex items-center justify-center">در حال بارگذاری...</div>}>
        <AnimatedAIChat />
      </Suspense>
  );
}
