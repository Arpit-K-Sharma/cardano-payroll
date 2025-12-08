"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentTable } from "@/components/tables/payment-table"
import { PayrollTransaction } from "@/lib/types"
import { Loader2, PlayCircle, RefreshCw } from "lucide-react"

export function PayrollPage() {
  const [transactions, setTransactions] = useState<PayrollTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [processingPayroll, setProcessingPayroll] = useState(false)
  const [runStatus, setRunStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/api/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunPayroll = async () => {
    try {
      setProcessingPayroll(true)
      setRunStatus("Triggering payroll run...")
      const response = await fetch("http://localhost:8080/api/run-payroll")
      const message = await response.text()

      if (!response.ok) {
        throw new Error(message || "Failed to trigger payroll run")
      }

      setRunStatus(message || "Payroll triggered successfully. Refreshing data...")
      await fetchTransactions()
    } catch (error) {
      console.error("Error processing payroll:", error)
      setRunStatus("Failed to trigger payroll. Please try again.")
    } finally {
      setProcessingPayroll(false)
    }
  }

  const getNextSchedulerRun = () => {
    const now = new Date()
    let nextRun = new Date(now.getFullYear(), now.getMonth(), 1, 10, 0, 0)

    if (now >= nextRun) {
      nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1, 10, 0, 0)
    }

    return nextRun
  }

  const nextSchedulerRun = getNextSchedulerRun()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Payroll Processing</h2>
        <p className="text-muted-foreground">Process and track employee payments on Cardano</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Manual Run</p>
            <p className="text-sm text-muted-foreground">
              Triggers the `/api/run-payroll` endpoint to process every employee found in the database.
            </p>
          </div>
          <Button onClick={handleRunPayroll} disabled={processingPayroll}>
            {processingPayroll ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Running...
              </>
            ) : (
              <>
                <PlayCircle size={16} className="mr-2" />
                Run Payroll Now
              </>
            )}
          </Button>
          {runStatus && <p className="text-sm text-muted-foreground">{runStatus}</p>}
        </Card>

        <Card className="p-6 flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Scheduled Run</p>
            <p className="text-sm text-muted-foreground">
              Backend scheduler executes automatically on the 1st of every month at 10:00 (server time).
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next execution</span>
            <span className="font-semibold text-foreground">{nextSchedulerRun.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">Your local timezone: {timezone}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Payroll This Month</p>
          <p className="text-2xl font-bold text-foreground">
            ₳{transactions
              .filter((t) => {
                if (!t.timestamp) return false
                const date = new Date(t.timestamp)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              })
              .reduce((sum, t) => sum + (t.amount || 0), 0)
              .toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Successful Transactions</p>
          <p className="text-2xl font-bold text-green-600">
            {transactions.filter((t) => t.status?.toUpperCase() === "SUCCESS" || t.status?.toUpperCase() === "success").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Failed Transactions</p>
          <p className="text-2xl font-bold text-red-600">
            {transactions.filter((t) => t.status?.toUpperCase() === "FAILED" || t.status?.toUpperCase() === "failed").length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Payment Transactions</h3>
            <Button onClick={fetchTransactions} variant="outline" size="sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Loading
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-2" size={24} />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : (
            <PaymentTable transactions={transactions} />
          )}
        </div>
      </Card>
    </div>
  )
}
