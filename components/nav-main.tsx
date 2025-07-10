"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: React.ReactNode
    url: string
    icon?: LucideIcon
    customIcon?: React.ReactNode
    isActive?: boolean
    badge?: number
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, index) => (
          <SidebarMenuItem key={typeof item.title === 'string' ? item.title : index}>
            <SidebarMenuButton 
              asChild 
              isActive={item.isActive}
              tooltip={typeof item.title === 'string' ? item.title : undefined}
            >
              <Link href={item.url}>
                {item.customIcon ? (
                  item.customIcon
                ) : item.icon ? (
                  <item.icon className="h-5 w-5" />
                ) : null}
                <span>{item.title}</span>
                {item.badge ? (
                  <SidebarMenuBadge className="ml-auto">
                    {item.badge}
                  </SidebarMenuBadge>
                ) : null}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
