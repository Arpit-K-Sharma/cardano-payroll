"use client"

import type React from "react"

import { Home, Users, DollarSign, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentPage: "dashboard" | "employees" | "payroll" | "wallet"
  onPageChange: (page: "dashboard" | "employees" | "payroll" | "wallet") => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">₳</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Cardano Payroll</h1>
            <p className="text-xs text-sidebar-accent">Enterprise Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon={<Home size={20} />}
          label="Dashboard"
          active={currentPage === "dashboard"}
          onClick={() => onPageChange("dashboard")}
        />
        <NavItem
          icon={<Users size={20} />}
          label="Employees"
          active={currentPage === "employees"}
          onClick={() => onPageChange("employees")}
        />
        <NavItem
          icon={<DollarSign size={20} />}
          label="Payroll"
          active={currentPage === "payroll"}
          onClick={() => onPageChange("payroll")}
        />
        <NavItem
          icon={<Wallet size={20} />}
          label="Wallets"
          active={currentPage === "wallet"}
          onClick={() => onPageChange("wallet")}
        />
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="outline" className="w-full bg-transparent" size="sm">
          Documentation
        </Button>
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}
