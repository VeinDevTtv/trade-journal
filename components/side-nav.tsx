"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LineChart, Calendar, BookText, LayoutDashboard, Upload, Download, Settings, Calculator } from "lucide-react"
import { NewTradeButton } from "@/components/new-trade-button"

export function SideNav() {
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
    {
      href: "/calculator",
      label: "Calculator",
      icon: Calculator,
      active: pathname === "/calculator",
    },
  ]

  const utilityRoutes = [
    {
      href: "/import",
      label: "Import",
      icon: Upload,
      active: pathname === "/import",
    },
    {
      href: "/export",
      label: "Export",
      icon: Download,
      active: pathname === "/export",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <NewTradeButton className="w-full justify-start" />
        <div className="py-4">
          <nav className="grid gap-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  route.active ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="py-2">
          <h3 className="px-3 text-xs font-medium text-muted-foreground">Utilities</h3>
          <nav className="grid gap-2 pt-2">
            {utilityRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  route.active ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="py-2">
          <h3 className="px-3 text-xs font-medium text-muted-foreground">Accounts</h3>
          <nav className="grid gap-2 pt-2">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-md bg-green-100 px-3 py-2 text-sm font-medium dark:bg-green-900/20"
            >
              <div className="h-2 w-2 rounded-full bg-green-500" />
              FTMO Challenge
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              MyForexFunds
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              Demo Account
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
