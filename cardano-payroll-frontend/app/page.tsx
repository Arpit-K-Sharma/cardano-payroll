"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { EmployeesPage } from "@/components/pages/employees-page"
import { PayrollPage } from "@/components/pages/payroll-page"
import { WalletPage } from "@/components/pages/wallet-page"
import { DashboardPage } from "@/components/pages/dashboard-page"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "employees" | "payroll" | "wallet">("dashboard")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "employees" && <EmployeesPage />}
        {currentPage === "payroll" && <PayrollPage />}
        {currentPage === "wallet" && <WalletPage />}
      </main>
    </div>
  )
}
