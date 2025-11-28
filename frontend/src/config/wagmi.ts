import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';

// Zama fhEVM runs on Sepolia testnet with real FHE encryption
// All bids are encrypted client-side and processed with Fully Homomorphic Encryption
export const config = getDefaultConfig({
  appName: 'PolyBid',
  projectId,
  chains: [sepolia],
  ssr: false,
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://11155111.rpc.thirdweb.com'),
  },
});
