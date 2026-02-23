
const config = {
  kuberApiUrl: process.env.NEXT_PUBLIC_KUBER_API_URL as string,
  kuberApiKey: process.env.NEXT_PUBLIC_KUBER_API_KEY as string,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL as string,
  companyWalletAddress: process.env.NEXT_PUBLIC_COMPANY_WALLET_ADDRESS as string,
  cardanoNetwork: process.env.NEXT_PUBLIC_CARDANO_NETWORK as 'mainnet' | 'preprod' | 'preview',
};

/**
 * Derives the Cardano network from a bech32 wallet address.
 *
 * - Addresses starting with "addr1"      → mainnet
 * - Addresses starting with "addr_test1" → testnet
 *   For testnet the caller must supply the specific testnet name
 *   (preprod | preview) because both share the same address prefix.
 *   Falls back to NEXT_PUBLIC_CARDANO_NETWORK env var, then "preprod".
 */
export function getNetworkFromAddress(
  address: string,
  testnetFallback?: 'preprod' | 'preview'
): 'mainnet' | 'preprod' | 'preview' {
  if (address.startsWith('addr1')) {
    return 'mainnet';
  }
  // addr_test1... covers both preprod and preview.
  // Priority: explicit argument → user's sessionStorage choice → env var → 'preprod'
  const storedTestnet =
    typeof window !== 'undefined'
      ? (sessionStorage.getItem('cardanoTestnet') as 'preprod' | 'preview' | null)
      : null;

  return (
    testnetFallback ??
    storedTestnet ??
    (process.env.NEXT_PUBLIC_CARDANO_NETWORK as 'preprod' | 'preview' | undefined) ??
    'preprod'
  );
}

/**
 * Returns the Kuber API base URL for the given wallet address.
 * Pattern: https://{network}.kuber.cardanoapi.io
 */
export function getKuberApiUrl(address: string): string {
  const network = getNetworkFromAddress(address);
  return `https://${network}.kuber.cardanoapi.io`;
}

export default config;