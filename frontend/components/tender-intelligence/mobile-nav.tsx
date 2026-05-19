"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, History, Info, Briefcase } from "lucide-react"

interface MobileNavProps {
  activeItem: string
  onItemClick: (item: string) => void
}

const navItems = [
  { id: "new-query", label: "Chat", icon: MessageSquare },
  { id: "history", label: "History", icon: History },
  { id: "about", label: "About", icon: Info },
]

export function MobileNav({ activeItem, onItemClick }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
