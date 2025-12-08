"use client"

import { PayrollTransaction } from "@/lib/types"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

interface PaymentTableProps {
  transactions: PayrollTransaction[]
}

export function PaymentTable({ transactions }: PaymentTableProps) {
  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase()
    if (statusUpper === "SUCCESS" || statusUpper === "success") {
      return <CheckCircle2 className="text-green-600" size={20} />
    } else if (statusUpper === "FAILED" || statusUpper === "failed") {
      return <XCircle className="text-red-600" size={20} />
    } else {
      return <Clock className="text-yellow-600" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase()
    if (statusUpper === "SUCCESS" || statusUpper === "success") {
      return "text-green-600"
    } else if (statusUpper === "FAILED" || statusUpper === "failed") {
      return "text-red-600"
    } else {
      return "text-yellow-600"
    }
  }

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Employee</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Wallet Address</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Transaction Hash</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                No payment transactions found
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-border hover:bg-muted transition-colors"
              >
                <td className="px-6 py-4 text-sm text-foreground">{transaction.id || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {transaction.employee?.fullName || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                  {transaction.walletAddress ? `${transaction.walletAddress.slice(0, 20)}...` : "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">
                  ₳{transaction.amount?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                    <span className={getStatusColor(transaction.status)}>
                      {transaction.status || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                  {transaction.txHash && transaction.txHash !== "FAILED" ? (
                    <a
                      href={`https://preprod.cardanoscan.io/transaction/${transaction.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {transaction.txHash.slice(0, 20)}...
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(transaction.timestamp)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

