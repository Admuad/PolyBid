/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_AUCTION_CONTRACT_ADDRESS: string
  readonly VITE_AUCTION_FACTORY_ADDRESS: string
  readonly VITE_SEPOLIA_RPC_URL: string
  readonly VITE_PINATA_JWT_TOKEN: string
  readonly VITE_PINATA_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
