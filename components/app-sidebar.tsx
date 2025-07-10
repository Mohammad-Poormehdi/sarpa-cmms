"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import {
  BarChart3,
  Box,
  ClipboardList,
  Component,
  MessageSquare,
  Settings,
  ShoppingCart,
  Sparkles,
  Wrench,
  type LucideIcon,
  type LucideProps
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GradientText } from "@/components/ui/gradient-text"
import { cn } from "@/lib/utils"

// Gradient icon component
const GradientIcon = ({ 
  icon: Icon, 
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 8,
  className,
  ...props
}: { 
  icon: LucideIcon
  colors?: string[]
  animationSpeed?: number
  className?: string
} & Omit<LucideProps, 'ref'>) => {
  const gradientId = React.useId()
  
  return (
    <div className={cn("relative w-5 h-5", className)}>
      <svg width="0" height="0" className="absolute">
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
          gradientTransform={`rotate(25)`}
        >
          {colors.map((color, index) => (
            <stop
              key={index}
              offset={`${(index / (colors.length - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </svg>
      <Icon className="h-5 w-5 animate-gradient" style={{ 
        stroke: `url(#${gradientId})`,
        animationDuration: `${animationSpeed}s`
      }} />
    </div>
  )
}

export function AppSidebar({ side = "left", name, email, ...props }: React.ComponentProps<typeof Sidebar> & { side?: "left" | "right", name: string, email: string }) {
  const params = useParams()
  const pathname = usePathname()
  const companyId = params.companyId as string

  // Navigation data with dynamic company ID
  const navItems = [
    {
      title: "سفارشات کار",
      url: `/dashboard/${companyId}/work-orders`,
      icon: ClipboardList,
      isActive: pathname.includes(`/dashboard/${companyId}/work-orders`),
    },
    {
      title: "نگهداری پیشگیرانه",
      url: `/dashboard/${companyId}/preventive-maintenance`,
      icon: Wrench,
      isActive: pathname.includes(`/dashboard/${companyId}/preventive-maintenance`),
    },
    {
      title: "تجهیزات",
      url: `/dashboard/${companyId}/assets`,
      icon: Box,
      isActive: pathname.includes(`/dashboard/${companyId}/assets`),
    },
    {
      title: "قطعات و انبار",
      url: `/dashboard/${companyId}/parts`,
      icon: ShoppingCart,
      isActive: pathname.includes(`/dashboard/${companyId}/parts`),
    },
    {
      title: "تحلیل‌ها",
      url: `/dashboard/${companyId}/analytics`,
      icon: BarChart3,
      isActive: pathname.includes(`/dashboard/${companyId}/analytics`),
    },
    {
      title: (
        <GradientText 
          colors={["#ffaa40", "#9c40ff", "#ffaa40"]} 
          animationSpeed={8}
          className="!m-0"
        >
          دستیار هوشمند
        </GradientText>
      ),
      url: `/dashboard/${companyId}/ai`,
      icon: Sparkles,
      customIcon: (
        <GradientIcon 
          icon={Sparkles} 
          colors={["#ffaa40", "#9c40ff", "#ffaa40"]} 
          animationSpeed={8} 
        />
      ),
      isActive: pathname.includes(`/dashboard/${companyId}/ai`),
    },
  ]

  // User data
  const userData = {
    name: name,
    email: email,
    avatar: "/avatars/john-doe.jpg",
  }

  return (
    <Sidebar collapsible="icon" side={side} {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
