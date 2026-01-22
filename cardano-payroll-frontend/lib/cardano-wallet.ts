"use client"

export const WALLET_INSTALL_URLS: Record<string, string> = {
  eternl: "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka",
  lace: "https://chrome.google.com/webstore/detail/lace/efcjdnjjgnpnenekllefifhhohopghco",
}

export function getWalletInstallUrl(walletId: string): string | undefined {
  return WALLET_INSTALL_URLS[walletId]
}

export interface WalletApi {
  enable(): Promise<CardanoWalletApi>
  isEnabled(): Promise<boolean>
  name: string
  icon: string
  apiVersion: string
}

export interface CardanoWalletApi {
  getNetworkId(): Promise<number>
  getUsedAddresses(): Promise<string[]>
  getUnusedAddresses(): Promise<string[]>
  getChangeAddress(): Promise<string>
  getRewardAddresses(): Promise<string[]>
  signData(address: string, payload: string): Promise<DataSignature>
}

export interface DataSignature {
  signature: string
  key: string
}

export interface SupportedWallet {
  id: string
  name: string
  icon: string
  checkAvailable: () => boolean
  getApi: () => WalletApi | undefined
}

export const SUPPORTED_WALLETS: SupportedWallet[] = [
  {
    id: "lace",
    name: "Lace",
    icon: "💎",
    checkAvailable: () => !!(typeof window !== "undefined" && (window as any).cardano?.lace),
    getApi: () => (typeof window !== "undefined" ? (window as any).cardano?.lace : undefined),
  },
  {
    id: "eternl",
    name: "Eternl",
    icon: "🦋",
    checkAvailable: () => !!(typeof window !== "undefined" && (window as any).cardano?.eternl),
    getApi: () => (typeof window !== "undefined" ? (window as any).cardano?.eternl : undefined),
  },
]

export function getAvailableWallets(): SupportedWallet[] {
  return SUPPORTED_WALLETS.filter(wallet => wallet.checkAvailable())
}

export async function connectWallet(walletId: string): Promise<{
  api: CardanoWalletApi
  address: string
  stakeAddress: string | null
}> {
  const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId)
  if (!wallet) throw new Error(`Wallet ${walletId} is not supported`)
  if (!wallet.checkAvailable()) throw new Error(`${wallet.name} is not installed.`)

  const walletApi = wallet.getApi()
  if (!walletApi) throw new Error(`Failed to get ${wallet.name} API`)

  const api = await walletApi.enable()
  const usedAddresses = await api.getUsedAddresses()
  const unusedAddresses = await api.getUnusedAddresses()

  const address = usedAddresses[0] ?? unusedAddresses[0]
  if (!address) throw new Error("No addresses found in wallet")

  let stakeAddress: string | null = null
  try {
    const rewardAddresses = await api.getRewardAddresses()
    if (rewardAddresses?.length) stakeAddress = rewardAddresses[0]
  } catch {}

  return { api, address, stakeAddress }
}

export async function signData(
  api: CardanoWalletApi,
  address: string,
  message: string
): Promise<DataSignature> {
  const messageHex = Buffer.from(message, "utf-8").toString("hex")
  return api.signData(address, messageHex)
}

export function hasAnyWallet(): boolean {
  return getAvailableWallets().length > 0
}
