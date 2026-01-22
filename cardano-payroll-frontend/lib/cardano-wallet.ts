// Cardano CIP-30 Wallet Integration Logic
// Supports: Nami, Eternl, and other CIP-30 wallets
// Cardano CIP-30 Wallet Integration Logic
// Supports: Nami, Eternl, and other CIP-30 wallets

export interface WalletApi {
  enable(): Promise<CardanoWalletApi>
}

export interface CardanoWalletApi {
  getUsedAddresses(): Promise<string[]>
  getUnusedAddresses(): Promise<string[]>
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
  if (!wallet.checkAvailable()) throw new Error(`${wallet.name} is not installed. Please install the extension.`)
  const walletApi = wallet.getApi()
  if (!walletApi) throw new Error(`Failed to get ${wallet.name} API`)
  const api = await walletApi.enable()
  const usedAddresses = await api.getUsedAddresses()
  const unusedAddresses = await api.getUnusedAddresses()
  const rawAddress = usedAddresses[0] || unusedAddresses[0]
  if (!rawAddress) throw new Error('No addresses found in wallet')
  const address = rawAddress
  let stakeAddress: string | null = null
  try {
    const rewardAddresses = await api.getRewardAddresses()
    if (rewardAddresses && rewardAddresses.length > 0) {
      stakeAddress = rewardAddresses[0]
    }
  } catch (error) {
    // ignore
  }
  return { api, address, stakeAddress }
}

export async function signData(
  api: CardanoWalletApi,
  address: string,
  message: string
): Promise<DataSignature> {
  const messageHex = Buffer.from(message, 'utf-8').toString('hex')
  const signature = await api.signData(address, messageHex)
  return signature
}

export function hasAnyWallet(): boolean {
  return getAvailableWallets().length > 0
}
