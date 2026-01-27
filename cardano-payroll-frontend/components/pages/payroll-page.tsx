"use client"

import { useState, useEffect } from "react"
import config from "../../lib/config";
import { sendBatchAda } from "@/lib/kuber-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentTable } from "@/components/tables/payment-table"
import { PayrollTransaction } from "@/lib/types"
import { Loader2, PlayCircle, RefreshCw, Wallet as WalletIcon } from "lucide-react"
import { toast } from "sonner"
import { WalletConnect } from "@/components/wallet-connect"
const API_BASE_URL =  config.apiBaseUrl;


function getConnectedWalletInfo() {
  const session = sessionStorage.getItem("walletSession")
  if (!session) return null
  try {
    const { walletName } = JSON.parse(session)
    const walletObj = typeof window !== "undefined" && (window as any).cardano?.[walletName]
    return walletObj
      ? { name: walletName, icon: walletObj.icon, displayName: walletObj.name || walletName }
      : { name: walletName }
  } catch {
    return null
  }
}


export function PayrollPage() {
  const [transactions, setTransactions] = useState<PayrollTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<any[]>([]) // Add this line
  const [processingPayroll, setProcessingPayroll] = useState(false)
  const [runStatus, setRunStatus] = useState<string | null>(null)
  const [sendingAda, setSendingAda] = useState(false)
  const [sendStatus, setSendStatus] = useState<string | null>(null)
  const [openWalletDialog, setOpenWalletDialog] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const walletInfo = typeof window !== "undefined" ? getConnectedWalletInfo() : null

  useEffect(() => {
    fetchTransactions()
    fetchEmployees()

    // Listen for wallet connection/disconnection events
    const handleWalletEvent = () => {
      setWalletConnected(prev => !prev) // Toggle to force re-render
    }

    window.addEventListener('wallet-connected', handleWalletEvent)
    window.addEventListener('wallet-disconnected', handleWalletEvent)

    return () => {
      window.removeEventListener('wallet-connected', handleWalletEvent)
      window.removeEventListener('wallet-disconnected', handleWalletEvent)
    }
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

  const handleWalletConnect = (walletId: string, address: string) => {
    const wallet = { walletName: walletId, address }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('walletSession', JSON.stringify(wallet))
      // Dispatch custom event to update all wallet-related components
      window.dispatchEvent(new Event('wallet-connected'))
    }
    setOpenWalletDialog(false)
  }

  const handleWalletDisconnect = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('walletSession')
      // Dispatch custom event to update all wallet-related components
      window.dispatchEvent(new Event('wallet-disconnected'))
    }
    setOpenWalletDialog(false)
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
      toast.error("Wallet not connected. Please connect your wallet first.")
      return
    }
    const payments = getPayrollPayments()
    if (payments.length === 0) {
      toast.error("No employees with valid address and salary.")
      return
    }
    setSendingAda(true)
    toast.info("Sending ADA payroll transaction...")
    try {
      await sendBatchAda(payments)
      toast.success("Payroll transaction sent successfully.")
      await fetchTransactions()
    } catch (e: any) {
      toast.error(e?.message || "Failed to send payroll.")
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
            className="w-full md:w-auto cursor-pointer"
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

          {!walletInfo ? (
            <Button
              onClick={() => setOpenWalletDialog(true)}
              className="w-full md:w-auto cursor-pointer"
            >
              <WalletIcon size={16} className="mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <Button
              onClick={handleSendAdaPayroll}
              disabled={sendingAda}
              className="w-full md:w-auto cursor-pointer"
            >
              {sendingAda ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  {walletInfo.icon && (
                    <img
                      src={walletInfo.icon}
                      alt={walletInfo.displayName || walletInfo.name}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  Pay with {walletInfo.displayName || walletInfo.name}
                </>
              )}
            </Button>
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

      {/* Stats moved to table header */}

      {/* Transactions Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Payment Transactions</h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center text-xs px-2 py-1 rounded bg-green-50 text-green-700 font-semibold border border-green-100">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="mr-1"><circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#bbf7d0"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {transactions.filter(t => t.status?.toUpperCase() === "SUCCESS").length} Success
              </span>
              <span className="flex items-center text-xs px-2 py-1 rounded bg-red-50 text-red-700 font-semibold border border-red-100">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="mr-1"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="#fee2e2"/><path d="M9 9l6 6M15 9l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg>
                {transactions.filter(t => t.status?.toUpperCase() === "FAILED").length} Failed
              </span>
              <Button
                onClick={fetchTransactions}
                variant="outline"
                size="sm"
                disabled={loading}
                className="cursor-pointer ml-2"
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

      {/* Wallet Connect Dialog */}
      {openWalletDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative border border-primary/20">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpenWalletDialog(false)}
              aria-label="Close"
            >
              ×
            </button>
            <WalletConnect onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
          </div>
        </div>
      )}
    </div>
  )
}