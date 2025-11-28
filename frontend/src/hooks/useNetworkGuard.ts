import { useEffect } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'react-hot-toast';

/**
 * Network Guard Hook
 * Automatically switches to Sepolia network on wallet connection
 * and prevents transactions on wrong networks
 */
export function useNetworkGuard() {
    const { isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const isCorrectNetwork = chainId === sepolia.id;

    useEffect(() => {
        if (isConnected && !isCorrectNetwork) {
            // Auto-switch to Sepolia when wallet connects on wrong network
            const switchToSepolia = async () => {
                try {
                    await switchChain({ chainId: sepolia.id });
                    toast.success('Switched to Sepolia network for your safety', {
                        duration: 4000,
                        icon: '🔒',
                    });
                } catch (error) {
                    console.error('Failed to switch network:', error);
                    toast.error(
                        'Please switch to Sepolia network manually to use PolyBid',
                        {
                            duration: 6000,
                            icon: '⚠️',
                        }
                    );
                }
            };

            switchToSepolia();
        }
    }, [isConnected, isCorrectNetwork, switchChain]);

    return {
        isCorrectNetwork,
        isConnected,
        currentChainId: chainId,
        requiredChainId: sepolia.id,
        requiredChainName: sepolia.name,
    };
}
