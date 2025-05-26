"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LineChart, Calendar, BookText, LayoutDashboard } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/journal",
      label: "Journal",
      icon: BookText,
      active: pathname === "/journal",
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: LineChart,
      active: pathname === "/analytics",
    },
    {
      href: "/calendar",
      label: "Calendar",
      icon: Calendar,
      active: pathname === "/calendar",
    },
  ]

  return (
    <nav className="flex items-center gap-4 lg:gap-6">
      <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
        <LineChart className="h-6 w-6" />
        <span>TradeProp Journal</span>
      </Link>
      <div className="hidden gap-6 md:flex">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {route.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
