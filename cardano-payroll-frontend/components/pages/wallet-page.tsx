"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface WalletInfo {
  address: string
  balance: string
  transactions: string[]
}

const COMPANY_WALLET_ADDRESS = "addr_test1vpyjcw5rrlgrpq7ry9c2z2frnsaxccd63nthac4ckenfpzc89shfw"

export function WalletPage() {
  const [walletAddress, setWalletAddress] = useState(COMPANY_WALLET_ADDRESS)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Automatically load company wallet balance on mount
    handleCheckBalance()
  }, [])

  const handleCheckBalance = async () => {
    const addressToCheck = walletAddress || COMPANY_WALLET_ADDRESS
    if (!addressToCheck) return

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/wallet/balance?address=${addressToCheck}`)
      const balance = await response.text()

      const txResponse = await fetch(`http://localhost:8080/api/wallet/transactions?address=${addressToCheck}`)
      const transactions = await txResponse.text()

      setWalletInfo({
        address: addressToCheck,
        balance,
        transactions: [transactions],
      })
    } catch (error) {
      console.error("Error fetching wallet info:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Wallet Management</h2>
        <p className="text-muted-foreground">Check Cardano wallet balances and transaction history</p>
      </div>

      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cardano Wallet Address</label>
            <div className="flex gap-2">
              <Input
                placeholder="addr1..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCheckBalance} disabled={loading || !walletAddress}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Loading...
                  </>
                ) : (
                  "Check Balance"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Default: Company Wallet Address (pre-loaded)
            </p>
          </div>
        </div>
      </Card>

      {walletInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Wallet Balance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-mono text-sm break-all text-foreground">{walletInfo.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-accent">
                  {walletInfo.balance.includes("Balance:") 
                    ? `₳${parseFloat(walletInfo.balance.replace("Balance: ", "").replace(" ADA", "")).toFixed(2)}`
                    : walletInfo.balance}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
            <div className="space-y-2">
              {walletInfo.transactions && walletInfo.transactions.length > 0 ? (
                <p className="text-sm text-muted-foreground font-mono break-all">{walletInfo.transactions[0]}</p>
              ) : (
                <p className="text-muted-foreground">No transactions found</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
