
const config = {
  kuberApiUrl: process.env.NEXT_PUBLIC_KUBER_API_URL as string,
  kuberApiKey: process.env.NEXT_PUBLIC_KUBER_API_KEY as string,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL as string,
  companyWalletAddress: process.env.NEXT_PUBLIC_COMPANY_WALLET_ADDRESS as string,
  cardanoNetwork: process.env.NEXT_PUBLIC_CARDANO_NETWORK as 'mainnet' | 'preprod' | 'preview',
};

export default config;