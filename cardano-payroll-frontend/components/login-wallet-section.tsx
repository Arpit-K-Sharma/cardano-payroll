"use client"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"

// Keep in sync with SUPPORTED_WALLETS in wallet-connect.tsx
const SUPPORTED_WALLETS = [
  { id: 'lace', name: 'Lace', icon: '💎' },
  { id: 'eternl', name: 'Eternl', icon: '🦋' },
  { id: 'flint', name: 'Flint', icon: '🔥' },
  { id: 'yoroi', name: 'Yoroi', icon: '🌸' },
  { id: 'gerowallet', name: 'Gero', icon: '⚡' },
  { id: 'typhoncip30', name: 'Typhon', icon: '🌊' },
]

export function LoginWalletSection() {
  const [open, setOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<{ id: string; address: string } | null>(null)

  // Restore session on mount
  useEffect(() => {
    const session = typeof window !== 'undefined' ? sessionStorage.getItem('walletSession') : null;
    if (session) {
      setConnectedWallet(JSON.parse(session));
    }
  }, []);

  const handleConnect = (walletId: string, address: string) => {
    const wallet = { id: walletId, address };
    setConnectedWallet(wallet);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('walletSession', JSON.stringify(wallet));
    }
    setOpen(false);
  }

  const handleDisconnect = () => {
    setConnectedWallet(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('walletSession');
    }
  }

  const formatAddress = (addr: string) => {
    if (addr.length < 20) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`
  }

  return (
    <div className="p-4 border-t border-sidebar-border">
      {connectedWallet ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {/* Show wallet icon and name */}
            {(() => {
              const walletMeta = SUPPORTED_WALLETS.find(w => w.id === connectedWallet.id)
              return walletMeta ? (
                <span className="flex items-center gap-1 text-xs font-mono text-green-700 dark:text-green-400">
                  <span className="text-base">{walletMeta.icon}</span>
                  <span>{walletMeta.name}</span>
                  <span className="mx-1">·</span>
                  <span>{formatAddress(connectedWallet.address)}</span>
                </span>
              ) : (
                <span className="text-xs font-mono text-green-700 dark:text-green-400">
                  {formatAddress(connectedWallet.address)}
                </span>
              )
            })()}
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent text-xs"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full bg-transparent"
          size="sm"
          onClick={() => setOpen(true)}
        >
          Connect Wallet
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative border border-primary/20">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </div>
        </div>
      )}
    </div>
  )
}