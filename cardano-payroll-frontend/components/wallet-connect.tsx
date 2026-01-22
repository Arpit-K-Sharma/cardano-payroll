"use client"

import { useState, useEffect } from 'react'
import type { SupportedWallet } from '@/lib/cardano-wallet'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getWalletInstallUrl, connectWallet } from '@/lib/cardano-wallet'

// Minimal SupportedWallet type for Nami and Eternl only
const SUPPORTED_WALLETS: SupportedWallet[] = [
  {
    id: 'nami',
    name: 'Nami',
    icon: '🦊',
    checkAvailable: () => {
      if (typeof window === 'undefined') return false;
      const cardano = (window as any).cardano as Record<string, unknown> | undefined;
      return !!(cardano && 'nami' in cardano);
    },
    getApi: () => (typeof window !== 'undefined' ? (window as any).cardano?.nami : undefined),
  },
  {
    id: 'eternl',
    name: 'Eternl',
    icon: '🦋',
    checkAvailable: () => {
      if (typeof window === 'undefined') return false;
      const cardano = (window as any).cardano as Record<string, unknown> | undefined;
      return !!(cardano && 'eternl' in cardano);
    },
    getApi: () => (typeof window !== 'undefined' ? (window as any).cardano?.eternl : undefined),
  },
]

function getAvailableWallets(): SupportedWallet[] {
  return SUPPORTED_WALLETS.filter(wallet => wallet.checkAvailable())
}

export function WalletConnect() {
  const [installedWallets, setInstalledWallets] = useState<SupportedWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInstalledWallets(getAvailableWallets())
    // Restore wallet connection from localStorage
    const savedWalletId = localStorage.getItem('connected_wallet_id')
    const savedAddress = localStorage.getItem('connected_wallet_address')
    if (savedWalletId && savedAddress) {
      setSelectedWallet(savedWalletId)
      setConnectedAddress(savedAddress)
    }
  }, [])

  const handleConnect = async (walletId: string) => {
    setConnecting(true)
    setError(null)
    setSelectedWallet(walletId)
    try {
      const { address } = await connectWallet(walletId)
      setConnectedAddress(address)
      localStorage.setItem('connected_wallet_id', walletId)
      localStorage.setItem('connected_wallet_address', address)
      toast.success('Wallet connected successfully!')
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet')
      toast.error(err?.message || 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Card className="p-8 max-w-md mx-auto shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-pulse">🔗</div>
          <h2 className="text-3xl font-extrabold mb-2 text-primary">Sign in with Cardano Wallet</h2>
          <p className="text-base text-muted-foreground">Select a CIP-30 compatible wallet to continue</p>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 -mr-2">
          {SUPPORTED_WALLETS.map(wallet => {
            const installed = installedWallets.some((w: SupportedWallet) => w.id === wallet.id)
            const installUrl = getWalletInstallUrl(wallet.id)
            return (
              <div key={wallet.id} className={`border-2 rounded-xl p-5 flex items-center gap-4 transition-all ${installed ? 'border-green-400 bg-green-50/30 dark:bg-green-900/10' : 'border-orange-300 bg-orange-50/30 dark:bg-orange-900/10'} ${selectedWallet === wallet.id ? 'ring-2 ring-primary' : ''}` }>
                <span className="text-4xl drop-shadow-sm">{wallet.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{wallet.name}</span>
                    {installed ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20">✓ Installed</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20">Not Installed</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {installed ? 'Ready to connect to your wallet' : 'Install the browser extension to use this wallet'}
                  </div>
                  {installed ? (
                    <Button
                      onClick={() => handleConnect(wallet.id)}
                      disabled={connecting && selectedWallet === wallet.id}
                      variant={selectedWallet === wallet.id ? 'default' : 'outline'}
                      className="w-full font-semibold"
                      size="sm"
                    >
                      {connecting && selectedWallet === wallet.id ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                  ) : installUrl ? (
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full font-semibold"
                      size="sm"
                    >
                      <a href={installUrl} target="_blank" rel="noopener noreferrer">
                        <span className="mr-2">📥</span>Install {wallet.name}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
        {/* Error and success toasts are now handled by toast notifications */}
        {connectedAddress && (
          <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-500/20 rounded-lg text-green-700 dark:text-green-300 text-sm mb-2">
            Connected: <span className="font-mono break-all">{connectedAddress}</span>
          </div>
        )}
        <div className="text-xs text-center text-muted-foreground pt-4 border-t">
          <p>🔒 Your wallet signature proves ownership without exposing your private keys</p>
        </div>
      </div>
    </Card>
  )
}
