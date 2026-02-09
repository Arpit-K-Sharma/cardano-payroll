"use client"
import React, { useState } from "react"
import { Home, Users, DollarSign, Wallet, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { LoginWalletSection } from "./login-wallet-section"

interface SidebarProps {
  currentPage: "dashboard" | "employees" | "payroll" | "wallet"
  onPageChange: (page: "dashboard" | "employees" | "payroll" | "wallet") => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [open, setOpen] = useState(false)

  // Sidebar content as a component for reuse
  const sidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col bg-white text-black">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-bold text-lg">
              ₳
            </div>
            <div>
              <h1 className="font-semibold text-lg">Cardano Payroll</h1>
              <p className="text-xs text-gray-600">Enterprise Edition</p>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-black hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <NavItem
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          active={currentPage === "dashboard"}
          onClick={() => {
            onPageChange("dashboard")
            setOpen(false)
          }}
        />
        <NavItem
          icon={<Users className="h-5 w-5" />}
          label="Employees"
          active={currentPage === "employees"}
          onClick={() => {
            onPageChange("employees")
            setOpen(false)
          }}
        />
        <NavItem
          icon={<DollarSign className="h-5 w-5" />}
          label="Payroll"
          active={currentPage === "payroll"}
          onClick={() => {
            onPageChange("payroll")
            setOpen(false)
          }}
        />
        <NavItem
          icon={<Wallet className="h-5 w-5" />}
          label="Wallets"
          active={currentPage === "wallet"}
          onClick={() => {
            onPageChange("wallet")
            setOpen(false)
          }}
        />
      </nav>
      
      {/* Connect Wallet Section */}
        <div>
          <LoginWalletSection />
      </div>
    </div>
  )

  return (
    <>
      {/* Hamburger for mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white">
              <Menu className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 w-full h-full max-w-full m-0 rounded-none border-0" showCloseButton={false}>
            {sidebarContent(true)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200">
        {sidebarContent(false)}
      </aside>
    </>
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
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
        active
          ? "bg-black text-white"
          : "text-gray-700 hover:bg-gray-100 hover:text-black"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}