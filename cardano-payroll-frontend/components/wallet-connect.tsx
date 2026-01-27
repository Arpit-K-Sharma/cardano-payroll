"use client"

import { useState, useEffect } from 'react'
import { useEffect as useLayoutEffect, useState as useLayoutState } from 'react'
import { Buffer } from 'buffer'
let Address: any = null
if (typeof window !== 'undefined') {
  import('@emurgo/cardano-serialization-lib-asmjs').then(mod => {
    Address = mod.Address
  })
}
import { Button } from '@/components/ui/button'

// Wallet configuration
const SUPPORTED_WALLETS = [
  { id: 'lace', name: 'Lace', icon: '💎', installUrl: 'https://www.lace.io/' },
  { id: 'eternl', name: 'Eternl', icon: '🦋', installUrl: 'https://eternl.io/' },
  { id: 'flint', name: 'Flint', icon: '🔥', installUrl: 'https://flint-wallet.com/' },
  { id: 'yoroi', name: 'Yoroi', icon: '🌸', installUrl: 'https://yoroi-wallet.com/' },
  { id: 'gerowallet', name: 'Gero', icon: '⚡', installUrl: 'https://gerowallet.io/' },
  { id: 'typhoncip30', name: 'Typhon', icon: '🌊', installUrl: 'https://typhonwallet.io/' },
]

interface WalletConnectProps {
  onConnect?: (walletId: string, address: string) => void
  onDisconnect?: () => void
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps = {}) {
  const [connectedWallet, setConnectedWallet] = useState<{ id: string; name: string; icon: string } | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [installedWallets, setInstalledWallets] = useState<typeof SUPPORTED_WALLETS>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  const session = sessionStorage.getItem('walletSession')
  if (session) {
    const { id, address } = JSON.parse(session)
    const walletInfo = SUPPORTED_WALLETS.find(w => w.id === id)
    if (walletInfo && address) {
      setConnectedWallet({
        id,
        name: walletInfo.name,
        icon: walletInfo.icon,
      })
      setWalletAddress(address)
    }
  }
}, [])

  // Check for installed wallets
  const checkInstalledWallets = () => {
    if (typeof window === 'undefined' || !(window as any).cardano) {
      return []
    }

    const installed = SUPPORTED_WALLETS.filter(wallet => {
      try {
        return (window as any).cardano[wallet.id] !== undefined
      } catch {
        return false
      }
    })

    return installed
  }

  // Initial check and periodic updates
  useEffect(() => {
    const checkWallets = () => {
      const wallets = checkInstalledWallets()
      setInstalledWallets(wallets)
    }

    // Initial check after a short delay to allow extensions to load
    setTimeout(checkWallets, 100)
    
    // Periodic check for newly installed wallets
    const interval = setInterval(checkWallets, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Connect to wallet
  const connectWallet = async (walletId: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      if (!(window as any).cardano || !(window as any).cardano[walletId]) {
        throw new Error(`${walletId} wallet not found. Please install the extension.`)
      }

      const walletApi = (window as any).cardano[walletId]

      // Try to show the wallet chooser popup if available, fallback to plain enable()
      let api
      try {
        // Always request preprod network and allow network switch for all wallets
        api = await walletApi.enable({ network: 'preprod', allowNetworkSwitch: true })
      } catch (e) {
        // Fallback to plain enable()
        api = await walletApi.enable()
      }


      // Get the address
      const usedAddresses = await api.getUsedAddresses()
      const unusedAddresses = await api.getUnusedAddresses()
      const rawAddress = usedAddresses[0] || unusedAddresses[0]

      if (!rawAddress) {
        throw new Error('No addresses found in wallet')
      }

      // Convert to bech32 if needed
      let address = rawAddress
      if (typeof rawAddress === 'string' && rawAddress.startsWith('addr')) {
        address = rawAddress
      } else {
        // Try to convert hex or bytes to bech32
        let bytes: Uint8Array
        if (typeof rawAddress === 'string') {
          bytes = Buffer.from(rawAddress, 'hex')
        } else {
          bytes = new Uint8Array(rawAddress)
        }
        if (Address) {
          address = Address.from_bytes(bytes).to_bech32()
        } else {
          address = '[Install cardano-serialization-lib-asmjs for bech32]'
        }
      }

      const walletInfo = SUPPORTED_WALLETS.find(w => w.id === walletId)

      const connectedInfo = {
        id: walletId,
        name: walletInfo?.name || walletId,
        icon: walletInfo?.icon || '💼',
      }

      setConnectedWallet(connectedInfo)
      setWalletAddress(address)

      sessionStorage.setItem('walletSession', JSON.stringify({
        id: walletId,
        address,
      }))

      if (onConnect) {
        onConnect(walletId, address)
      }

      console.log('Connected to', walletId, 'with address:', address)
      console.log('usedAddresses:', usedAddresses)
    } catch (err: any) {
      console.error('Wallet connection error:', err)
      setError(err.message || 'Failed to connect to wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnectedWallet(null)
    setWalletAddress(null)
    setError(null)
    sessionStorage.removeItem('walletSession')
    if (onDisconnect) {
      onDisconnect()
    }
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ''
    if (addr.length < 20) return addr
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Connect Cardano Wallet</h2>
      
      {connectedWallet ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="w-full p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{connectedWallet.icon}</span>
              <div>
                <p className="font-semibold text-foreground">{connectedWallet.name}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Connected</p>
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          {walletAddress && (
            <div className="w-full p-4 rounded-xl bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="font-mono text-sm text-foreground break-all">{formatAddress(walletAddress)}</p>
            </div>
          )}

          <Button onClick={disconnectWallet} variant="destructive" className="w-full">
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-3">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {installedWallets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4 text-sm">
                No wallets detected. Please install a Cardano wallet extension and refresh the page.
              </p>
            </div>
          ) : null}

          {SUPPORTED_WALLETS.map((wallet) => {
            const isInstalled = installedWallets.some(w => w.id === wallet.id)

            return (
              <div
                key={wallet.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  isInstalled
                    ? 'border-primary/20 bg-primary/5 hover:border-primary/40'
                    : 'border-border bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{wallet.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{wallet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isInstalled ? 'Installed' : 'Not installed'}
                      </p>
                    </div>
                  </div>

                  {isInstalled ? (
                    <Button
                      onClick={() => connectWallet(wallet.id)}
                      disabled={isConnecting}
                      size="sm"
                      className="cursor-pointer"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a href={wallet.installUrl} target="_blank" rel="noopener noreferrer">
                        Install
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-400">
              💡 <strong>Tip:</strong> If you just installed a wallet, please refresh this page.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}