"use client"

import { useState, useEffect } from 'react'
import type { SupportedWallet } from '@/lib/cardano-wallet'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { connectWallet } from '@/lib/cardano-wallet'

// Supported wallets (Nami, Eternl, etc.)
const SUPPORTED_WALLETS: SupportedWallet[] = [
  {
    id: 'nami',
    name: 'Nami',
    icon: '🦊',
    checkAvailable: () => typeof window !== 'undefined' && 'cardano' in window && 'nami' in (window as any).cardano,
    getApi: () => (window as any).cardano?.nami,
  },
  {
    id: 'eternl',
    name: 'Eternl',
    icon: '🦋',
    checkAvailable: () => typeof window !== 'undefined' && 'cardano' in window && 'eternl' in (window as any).cardano,
    getApi: () => (window as any).cardano?.eternl,
  },
]

function getAvailableWallets(): SupportedWallet[] {
  return SUPPORTED_WALLETS.filter(wallet => wallet.checkAvailable())
}

export function WalletConnect({ onConnect }: { onConnect?: (walletId: string, address: string) => void } = {}) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connectedWalletId, setConnectedWalletId] = useState<string | null>(null)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Restore wallet connection from localStorage on mount
    const savedWalletId = localStorage.getItem('connected_wallet_id')
    const savedAddress = localStorage.getItem('connected_wallet_address')
    if (savedWalletId && savedAddress) {
      setConnectedWalletId(savedWalletId)
      setConnectedAddress(savedAddress)
      setSelectedWallet(savedWalletId)
    } else {
      setConnectedWalletId(null)
      setConnectedAddress(null)
      setSelectedWallet(null)
    }
  }, [])

  const handleConnect = async (walletId: string) => {
    setConnecting(true)
    setError(null)
    setSelectedWallet(walletId)
    try {
      const { address } = await connectWallet(walletId)
      setConnectedWalletId(walletId)
      setConnectedAddress(address)
      localStorage.setItem('connected_wallet_id', walletId)
      localStorage.setItem('connected_wallet_address', address)
      toast.success('Wallet connected successfully!')
      if (onConnect) onConnect(walletId, address)
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet')
      toast.error(err?.message || 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setConnectedWalletId(null)
    setConnectedAddress(null)
    setSelectedWallet(null)
    localStorage.removeItem('connected_wallet_id')
    localStorage.removeItem('connected_wallet_address')
    toast('Wallet disconnected')
  }

  const installedWallets = getAvailableWallets()

  return (
    <div className="flex flex-col gap-6 items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-2">Connect Cardano Wallet</h2>
      {connectedAddress && connectedWalletId ? (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <div className="p-2 rounded bg-green-50 text-green-700 border border-green-200 text-sm w-full text-center">
            Connected: <span className="font-mono break-all">{connectedAddress}</span>
            <div className="text-xs text-gray-500 mt-1">Wallet: {connectedWalletId}</div>
          </div>
          <Button className="w-full mt-2" variant="outline" onClick={handleDisconnect}>
            Disconnect
          </Button>
          <div className="text-xs text-gray-500 mt-2">You can switch wallets below.</div>
        </div>
      ) : null}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {SUPPORTED_WALLETS.map(wallet => {
          const installed = installedWallets.some((w: SupportedWallet) => w.id === wallet.id)
          // installUrl logic removed
          return (
            <div key={wallet.id} className={`border rounded-lg p-4 flex items-center gap-3 ${selectedWallet === wallet.id ? 'border-primary' : 'border-gray-200'}` }>
              <span className="text-3xl">{wallet.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{wallet.name}</div>
                {installed ? (
                  <Button
                    onClick={() => handleConnect(wallet.id)}
                    disabled={connecting && selectedWallet === wallet.id}
                    variant={selectedWallet === wallet.id ? 'default' : 'outline'}
                    className="w-full mt-2"
                  >
                    {connecting && selectedWallet === wallet.id ? 'Connecting...' : (connectedWalletId === wallet.id ? 'Reconnect' : 'Connect')}
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
    </div>
  )
}
