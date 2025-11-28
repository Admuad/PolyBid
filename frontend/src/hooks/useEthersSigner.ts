import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import type { WalletClient } from 'viem';

/**
 * Convert wagmi WalletClient to ethers Signer
 * Needed for FHE decryption and contract interactions that require signing
 */
function walletClientToSigner(walletClient: WalletClient): JsonRpcSigner | undefined {
    const { account, chain, transport } = walletClient;
    if (!account || !chain || !transport) return undefined;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    return new JsonRpcSigner(provider, account.address);
}

/**
 * Hook to get ethers signer from wagmi wallet client
 */
export function useEthersSigner() {
    const { data: walletClient } = useWalletClient();

    return useMemo(
        () => (walletClient ? walletClientToSigner(walletClient) : undefined),
        [walletClient]
    );
}
