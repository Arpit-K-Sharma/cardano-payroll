"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Users, DollarSign, Wallet, TrendingUp } from "lucide-react"
import { Employee, PayrollTransaction } from "@/lib/types"

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
        fetch("http://localhost:8080/api/getAllEmployees"),
        fetch("http://localhost:8080/api/transactions"),
        fetch(`http://localhost:8080/api/wallet/balance?address=${companyWalletAddress}`)
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData)
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }

      if (walletRes.ok) {
        const balance = await walletRes.text()
        setWalletBalance(balance)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthTransactions = transactions.filter(t => {
    if (!t.timestamp) return false
    const date = new Date(t.timestamp)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalPayrollThisMonth = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
  const successfulTransactions = transactions.filter(t => t.status === "success")
  const totalAdaSent = successfulTransactions.reduce((sum, t) => sum + t.amount, 0)
  const averageSalary = employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length : 0
  const pendingPayments = transactions.filter(t => t.status === "pending").length
  const failedTransactions = transactions.filter(t => t.status === "failed").length

  // Recent activity (last 3 transactions)
  const recentTransactions = transactions
    .filter(t => t.status === "success")
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 3)

  const stats = [
    {
      title: "Total Employees",
      value: employees.length.toString(),
      change: "Active",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Payroll This Month",
      value: `₳${totalPayrollThisMonth.toFixed(2)}`,
      change: `${thisMonthTransactions.length} transactions`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Wallet Balance",
      value: walletBalance.includes("Error") 
        ? "Error" 
        : walletBalance.includes("Balance:") 
          ? `₳${parseFloat(walletBalance.replace("Balance: ", "").replace(" ADA", "")).toFixed(2)}`
          : walletBalance,
      change: "Available",
      icon: Wallet,
      color: "text-purple-500",
    },
    {
      title: "Processed Payments",
      value: successfulTransactions.length.toString(),
      change: "All successful",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ]

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
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your Cardano Payroll System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                </div>
                <Icon className={`${stat.color} opacity-20`} size={24} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              recentTransactions.map((transaction, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">Payroll Processed</p>
                    <p className="text-sm text-muted-foreground">Employee: {transaction.employee.fullName}</p>
                  </div>
                  <span className="text-green-600 font-medium">+₳{transaction.amount.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Company Wallet Balance</span>
              <span className="font-semibold text-foreground">
                {walletBalance.includes("Error") 
                  ? walletBalance 
                  : walletBalance.includes("Balance:")
                    ? `₳${parseFloat(walletBalance.replace("Balance: ", "").replace(" ADA", "")).toFixed(2)}`
                    : walletBalance}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average Salary</span>
              <span className="font-semibold text-foreground">₳{averageSalary.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total ADA Sent</span>
              <span className="font-semibold text-foreground">₳{totalAdaSent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending Payments</span>
              <span className="font-semibold text-foreground">{pendingPayments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Failed Transactions</span>
              <span className="font-semibold text-foreground">{failedTransactions}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
