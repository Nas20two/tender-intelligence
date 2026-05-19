"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  FileText,
  LayoutGrid,
  ShieldCheck,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Search,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  pendingApprovals: number
}

const navItems = [
  { id: "about", label: "About Tender Intelligence", icon: Info },
  { id: "new-query", label: "New Query", icon: Search },
  { id: "tender-database", label: "Tender Database", icon: LayoutGrid },
  { id: "hitl-approvals", label: "HITL Approvals", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings2 },
]

export function Sidebar({ activeItem, onItemClick, pendingApprovals }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2563eb] shrink-0 shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-semibold text-sidebar-foreground truncate">
                Tender Intelligence
              </h1>
              <p className="text-xs text-muted-foreground">Enterprise</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            const showBadge = item.id === "hitl-approvals" && pendingApprovals > 0

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onItemClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {showBadge && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-[10px] h-5 px-1.5 bg-destructive/90"
                          >
                            {pendingApprovals}
                          </Badge>
                        )}
                      </>
                    )}
                    {collapsed && showBadge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">
                        {pendingApprovals}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                    {showBadge && ` (${pendingApprovals} pending)`}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Security Badge */}
        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm backdrop-blur-sm">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-sidebar-foreground">HITL Protected</p>
                <p className="text-[10px] text-muted-foreground truncate">Audit Logging Enabled</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mt-2 text-muted-foreground hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
