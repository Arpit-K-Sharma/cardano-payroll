"use client"

import { useState, useEffect } from "react"
import { API_BASE_URL as CONFIG_API_BASE_URL } from "../../lib/config"
import { sendBatchAda } from "@/lib/kuber-client"
const DEPLOYED_BACKEND_URL = "https://api-pay.sireto.net"
const API_BASE_URL = DEPLOYED_BACKEND_URL
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentTable } from "@/components/tables/payment-table"
import { PayrollTransaction } from "@/lib/types"
import { Loader2, PlayCircle, RefreshCw } from "lucide-react"

export function PayrollPage() {
  const [transactions, setTransactions] = useState<PayrollTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<any[]>([]) // Add this line
  const [processingPayroll, setProcessingPayroll] = useState(false)
  const [runStatus, setRunStatus] = useState<string | null>(null)
  const [sendingAda, setSendingAda] = useState(false)
  const [sendStatus, setSendStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
    fetchEmployees()
  }, [])


  function isWalletConnected() {
    return !!sessionStorage.getItem("walletSession")
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/getAllEmployees`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }


  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/transactions`)
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
      const response = await fetch(`${API_BASE_URL}/api/run-payroll`)
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

  const getPayrollPayments = () => {
    return employees
      .map(emp => ({
        address: emp.walletAddress,
        amount: Math.floor((emp.salary || 0) * 1_000_000), // ADA to lovelace
      }))
      .filter(p => p.address && p.amount > 0)
  }

  // Handling payment from the wallet
  const handleSendAdaPayroll = async () => {
    if (!isWalletConnected()) {
      setSendStatus("Wallet not connected. Please connect your wallet first.")
      return
    }
    const payments = getPayrollPayments()
    console.log("Payroll payments:", payments)
    if (payments.length === 0) {
      setSendStatus("No employees with valid address and salary.")
      return
    }
    setSendingAda(true)
    setSendStatus("Sending ADA payroll transaction...")
    try {
      const txHash = await sendBatchAda(payments)
      setSendStatus(`Payroll sent! TX hash: ${txHash}`)

      // await fetchTransactions()
    } catch (e: any) {
      setSendStatus(e?.message || "Failed to send payroll.")
    } finally {
      setSendingAda(false)
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-1">
          Payroll Dashboard
        </h2>
        <p className="text-muted-foreground">
          Manage, process, and track employee payments on Cardano.
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Manual Payroll Run</h3>
          <p className="text-sm text-muted-foreground">
            Trigger the backend to process payroll for all employees in the database.
          </p>

          <Button
            onClick={handleRunPayroll}
            disabled={processingPayroll}
            className="w-full md:w-auto"
          >
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

          {runStatus && (
            <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">
              {runStatus}
            </p>
          )}
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Send Payroll from Wallet</h3>
          <p className="text-sm text-muted-foreground">
            Pay all employees instantly using your connected Cardano wallet.
          </p>

          <Button
            onClick={handleSendAdaPayroll}
            disabled={sendingAda}
            className="w-full md:w-auto"
          >
            {sendingAda ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Sending ADA Payroll...
              </>
            ) : (
              "Send ADA Payroll"
            )}
          </Button>

          {sendStatus && (
            <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">
              {sendStatus}
            </p>
          )}
        </Card>
      </div>

      {/* Scheduler Info */}
      <div className="flex justify-center">
        <div className="rounded bg-gray-50 border border-gray-100 px-4 py-2 text-xs text-muted-foreground text-center">
          <span className="font-semibold">Scheduled System:</span>{" "}
          Payroll runs on the <b>1st of every month at 10:00</b> (server time).
          <br />
          Next run: <b>{nextSchedulerRun.toLocaleString()}</b> ({timezone})
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">
            Total Paid This Month
          </p>
          <p className="text-2xl font-bold">
            {transactions
              .filter((t) => {
                if (!t.timestamp) return false
                const d = new Date(t.timestamp)
                const now = new Date()
                return (
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                )
              })
              .reduce((sum, t) => sum + (t.amount || 0), 0)
              .toFixed(2)}{" "}
            ADA
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">
            Successful Transactions
          </p>
          <p className="text-2xl font-bold text-green-600">
            {
              transactions.filter(
                (t) => t.status?.toUpperCase() === "SUCCESS"
              ).length
            }
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">
            Failed Transactions
          </p>
          <p className="text-2xl font-bold text-red-600">
            {
              transactions.filter(
                (t) => t.status?.toUpperCase() === "FAILED"
              ).length
            }
          </p>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Payment Transactions</h3>
            <Button
              onClick={fetchTransactions}
              variant="outline"
              size="sm"
              disabled={loading}
            >
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