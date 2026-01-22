"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { WalletConnect } from "@/components/wallet-connect"

export function LoginWalletSection() {
  const [open, setOpen] = useState(false)
  return (
    <div className="p-4 border-t border-sidebar-border">
      <Button
        variant="outline"
        className="w-full bg-transparent"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Login
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <WalletConnect />
      </Dialog>
    </div>
  )
}