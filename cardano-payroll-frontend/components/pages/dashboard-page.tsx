"use client"
import { useState, useEffect } from "react"
import config from "../../lib/config";
import { Card } from "@/components/ui/card"
import { Users, DollarSign, Wallet, TrendingUp, UserPlus, RefreshCw } from "lucide-react"
import { Employee, PayrollTransaction } from "@/lib/types"
import Link from "next/link"
const API_BASE_URL = config.apiBaseUrl;

export function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [transactions, setTransactions] = useState<PayrollTransaction[]>([])
  const [walletBalance, setWalletBalance] = useState("0")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const companyWalletAddress = "addr_test1vpyjcw5rrlgrpq7ry9c2z2frnsaxccd63nthac4ckenfpzc89shfw"

      const [employeesRes, transactionsRes, walletRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/getAllEmployees`),
        fetch(`${API_BASE_URL}/api/transactions`),
        fetch(`${API_BASE_URL}/api/wallet/balance?address=${companyWalletAddress}`)
      ])

      if (employeesRes.ok) setEmployees(await employeesRes.json())
      if (transactionsRes.ok) setTransactions(await transactionsRes.json())
      if (walletRes.ok) setWalletBalance(await walletRes.text())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Stats calculations
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthTransactions = transactions.filter(t => {
    if (!t.timestamp) return false
    const date = new Date(t.timestamp)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  const successfulTransactions = transactions.filter(t => t.status?.toUpperCase() === "SUCCESS")
  const failedTransactions = transactions.filter(t => t.status?.toUpperCase() === "FAILED")
  const totalPayrollThisMonth = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalAdaSent = successfulTransactions.reduce((sum, t) => sum + t.amount, 0)
  const averageSalary = employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length : 0

  // Recent activity (last 5 transactions)
  const recentTransactions = transactions
    .filter(t => t.status === "success")
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 5)

  // Recent employees (last 5)
  const recentEmployees = employees
    .slice(-5)
    .reverse()

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your Cardano Payroll System</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex items-center gap-4">
          <Users className="text-blue-500" size={32} />
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
            <p className="text-2xl font-bold">{employees.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <DollarSign className="text-green-500" size={32} />
          <div>
            <p className="text-sm text-muted-foreground mb-1">Payroll This Month</p>
            <p className="text-2xl font-bold">₳{totalPayrollThisMonth.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <Wallet className="text-purple-500" size={32} />
          <div>
            <p className="text-sm text-muted-foreground mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold">
              {walletBalance.includes("Error")
                ? walletBalance
                : walletBalance.includes("Balance:")
                  ? `₳${parseFloat(walletBalance.replace("Balance: ", "").replace(" ADA", "")).toFixed(2)}`
                  : walletBalance}
            </p>
          </div>
        </Card>
      </div>

      {/* Payroll Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Payroll Overview</h3>
          <div className="flex justify-between text-sm">
            <span>Average Salary</span>
            <span>₳{averageSalary.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Successful Transactions</span>
            <span>{successfulTransactions.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Failed Transactions</span>
            <span>{failedTransactions.length}</span>
          </div>
        </Card>
        <Card className="p-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Recent Employees</h3>
          {recentEmployees.length === 0 ? (
            <p className="text-muted-foreground">No employees found.</p>
          ) : (
            <ul className="text-sm">
              {recentEmployees.map((emp, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{emp.fullName}</span>
                  <span className="text-muted-foreground">₳{emp.salary}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

      </div>

    </div>
  )
}