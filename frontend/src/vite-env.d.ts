/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_AUCTION_CONTRACT_ADDRESS: string
  readonly VITE_SEPOLIA_RPC_URL: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_MORALIS_API_KEY: string
  readonly VITE_COINGECKO_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
