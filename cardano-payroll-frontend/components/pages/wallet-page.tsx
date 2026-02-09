"use client"

import { useState, useEffect } from "react"
import config from "../../lib/config"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Wallet,
  TrendingUp,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  ExternalLink,
} from "lucide-react"

interface Transaction {
  tx_hash: string
  tx_index: number
  block_height: number
  block_time: number
}

interface WalletInfo {
  address: string
  balance: string
  transactions: Transaction[]
}

const COMPANY_WALLET_ADDRESS = config.companyWalletAddress
const API_BASE_URL = config.apiBaseUrl
const network = config.cardanoNetwork

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState(COMPANY_WALLET_ADDRESS)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  useEffect(() => {
    handleCheckBalance()
  }, [])

  const handleCheckBalance = async () => {
    const addressToCheck = walletAddress || COMPANY_WALLET_ADDRESS
    if (!addressToCheck) return

    try {
      setLoading(true)

      const balanceRes = await fetch(
        `${API_BASE_URL}/api/wallet/balance?address=${addressToCheck}`
      )
      const balance = await balanceRes.text()

      const txRes = await fetch(
        `${API_BASE_URL}/api/wallet/transactions?address=${addressToCheck}`
      )
      const transactions = await txRes.text()

      try {
        const parsedTxs = JSON.parse(transactions)
        setWalletInfo({
          address: addressToCheck,
          balance,
          transactions: Array.isArray(parsedTxs) ? parsedTxs : [parsedTxs],
        })
      } catch {
        setWalletInfo({
          address: addressToCheck,
          balance,
          transactions: [],
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = () => {
    if (!walletInfo?.address) return
    navigator.clipboard.writeText(walletInfo.address)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const balanceValue = walletInfo?.balance.includes("Balance:")
    ? parseFloat(
        walletInfo.balance.replace("Balance: ", "").replace(" ADA", "")
      ).toFixed(2)
    : walletInfo?.balance

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Glow blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="top-0 z-10 border-b border-primary/20 bg-gradient-to-r from-background to-primary/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cardano Wallet</h1>
              <p className="text-sm text-muted-foreground">
                Real-time balance & transaction monitor
              </p>
            </div>
          </div>
          {walletInfo && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-semibold text-black">Current Balance:</span>
              <span className="text-xl font-extrabold text-black">{balanceValue}</span>
              <span className="text-lg font-bold text-black">₳</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Address Input */}
        <Card className="p-6 bg-white dark:bg-card border-2 border-primary/30 shadow-xl shadow-primary/20 rounded-2xl">
          <label className="block text-sm font-semibold mb-3">
            Wallet Address
          </label>
          <div className="flex gap-3">
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="addr1..."
              className="h-11 bg-white border-2 border-primary/30 focus:ring-2 focus:ring-primary/40"
            />
            <Button
              onClick={handleCheckBalance}
              disabled={loading}
              className="h-11 px-6 bg-black text-white shadow-xl shadow-primary/40 hover:scale-[1.02] cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <TrendingUp />
              )}
            </Button>
          </div>
          <p className="mt-3 text-xs flex items-center gap-1 text-muted-foreground">
            <Zap className="w-3 h-3 text-primary" />
            Defaulted to company wallet
          </p>
        </Card>

        {walletInfo && (
          <>
            <Card className="p-6 border-2 border-primary/20 bg-white dark:bg-card rounded-2xl shadow-xl shadow-primary/20">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <Zap className="text-primary" />
                Recent Transactions
              </h3>

              <div className="space-y-3">
                {walletInfo.transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">
                    No transactions found
                  </p>
                ) : (
                  walletInfo.transactions.slice(0, 10).map((tx, idx) => (
                      <a
                        key={tx.tx_hash || idx}
                        href={tx.tx_hash ? `https://${network}.cardanoscan.io/transaction/${tx.tx_hash}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div
                          className="p-4 rounded-xl border-2 border-primary/10 bg-gradient-to-r from-white to-primary/5 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/40 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4 flex-wrap"
                        >
                          <div className="flex gap-3 items-center flex-1 min-w-0">
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-xs truncate">
                                {tx.tx_hash
                                  ? `${tx.tx_hash.substring(0, 20)}...${tx.tx_hash.substring(tx.tx_hash.length - 16)}`
                                  : 'N/A'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {tx.block_time
                                    ? new Date(
                                        tx.block_time * 1000
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "N/A"}
                                </span>
                                <span className="text-xs text-muted-foreground opacity-70">
                                  {tx.block_time
                                    ? new Date(
                                        tx.block_time * 1000
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-xs font-mono font-semibold text-primary">
                                Block {tx.block_height}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Index {tx.tx_index}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                          </div>
                        </div>
                      </a>
                  ))
                )}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
