"use client"
import { useState, useEffect } from "react"

export function useWalletSession() {
  const [walletId, setWalletId] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    setWalletId(localStorage.getItem("wallet_id"))
    setAddress(localStorage.getItem("wallet_address"))
  }, [])

  const connect = (id: string, addr: string) => {
    localStorage.setItem("wallet_id", id)
    localStorage.setItem("wallet_address", addr)
    setWalletId(id)
    setAddress(addr)
  }

  const disconnect = () => {
    localStorage.removeItem("wallet_id")
    localStorage.removeItem("wallet_address")
    setWalletId(null)
    setAddress(null)
  }

  return { walletId, address, connect, disconnect }
}
