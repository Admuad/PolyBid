import { useState } from 'react';
import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { Trophy, Wallet, DollarSign, Loader2 } from 'lucide-react';
import { showErrorToast } from '@/lib/errorHandler';
import { AUCTION_ABI } from '@/config/contracts';
import { formatEther } from 'viem';
import { initializeFHE, checkIfWinner } from '@/lib/fhe';
import { useEthersSigner } from '@/hooks/useEthersSigner';

interface AuctionActionsProps {
    auctionAddress: string;
    auctionEnded: boolean;
    endTime: number;
    isOwner: boolean;
    hasBid: boolean;
}

export function AuctionActions({
    auctionAddress,
    auctionEnded,
    endTime,
    isOwner,
    hasBid,
}: AuctionActionsProps) {
    const { address } = useAccount();
    const signer = useEthersSigner();
    const { writeContract, isPending } = useWriteContract();

    const [winStatus, setWinStatus] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState<string>('');
    const [actionStatus, setActionStatus] = useState<string>('');

    // Check if auction time has expired
    const now = Math.floor(Date.now() / 1000);
    const timeExpired = now >= endTime;

    // Read user's bid deposit
    const { data: bidDeposit } = useReadContract({
        address: auctionAddress as `0x${string}`,
        abi: AUCTION_ABI,
        functionName: 'bidDeposits',
        args: address ? [address] : undefined,
    });

    // Read close reward
    const { data: closeReward } = useReadContract({
        address: auctionAddress as `0x${string}`,
        abi: AUCTION_ABI,
        functionName: 'CLOSE_REWARD',
    });

    // Read bidder count
    const { data: bidderCount } = useReadContract({
        address: auctionAddress as `0x${string}`,
        abi: AUCTION_ABI,
        functionName: 'getBidderCount',
    });

    // Check if user can close the auction
    const noBids = bidderCount === 0n || bidderCount === BigInt(0);
    const canCloseAuction = !noBids || isOwner;

    // Check win status when auction ends
    // REMOVED: Auto-trigger useEffect to prevent unwanted transactions
    // useEffect(() => {
    //     if (auctionEnded && hasBid && address && signer && winStatus === null && !checking) {
    //         checkWinStatus();
    //     }
    // }, [auctionEnded, hasBid, address, signer]);

    const checkWinStatus = async () => {
        if (!address || !signer) return;

        setChecking(true);
        setError('');

        try {
            console.log('Initializing FHE for win status check...');
            const fheInstance = await initializeFHE();
            if (!fheInstance) {
                throw new Error('Failed to initialize FHE instance');
            }

            console.log('Checking if winner...');
            const isWinner = await checkIfWinner(
                fheInstance,
                auctionAddress,
                address,
                signer // Pass signer, not signer.provider
            );

            console.log('Win status result:', isWinner);
            setWinStatus(isWinner);
        } catch (err) {
            showErrorToast(err, 'relayer');
            setError('Failed to check win status. Please refresh and try again.');
        } finally {
            setChecking(false);
        }
    };

    const handleCloseAuction = () => {
        setActionStatus('');
        writeContract(
            {
                address: auctionAddress as `0x${string}`,
                abi: AUCTION_ABI,
                functionName: 'closeAuction',
            },
            {
                onSuccess: () => {
                    setActionStatus('✅ Auction closed! You earned the reward.');
                },
                onError: (err) => {
                    showErrorToast(err, 'transaction');
                    setActionStatus(`❌ Failed: ${err.message}`);
                },
            }
        );
    };

    const handleWithdrawRefund = () => {
        setActionStatus('');
        writeContract(
            {
                address: auctionAddress as `0x${string}`,
                abi: AUCTION_ABI,
                functionName: 'withdrawRefund',
            },
            {
                onSuccess: () => {
                    setActionStatus('✅ Refund withdrawn successfully!');
                },
                onError: (err) => {
                    showErrorToast(err, 'transaction');
                    setActionStatus(`❌ Failed: ${err.message}`);
                },
            }
        );
    };

    const handleWithdrawProceeds = () => {
        setActionStatus('');
        writeContract(
            {
                address: auctionAddress as `0x${string}`,
                abi: AUCTION_ABI,
                functionName: 'withdrawProceeds',
            },
            {
                onSuccess: () => {
                    setActionStatus('✅ Proceeds withdrawn successfully!');
                },
                onError: (err) => {
                    showErrorToast(err, 'transaction');
                    setActionStatus(`❌ Failed: ${err.message}`);
                },
            }
        );
    };

    // Auction ended but not yet closed - show close button only if allowed
    if (auctionEnded === false && timeExpired && canCloseAuction) {
        const rewardEth = closeReward ? formatEther(closeReward as bigint) : '0.0001';

        return (
            <div className="card-zama border-2 border-yellow-500/50">
                <div className="flex items-start gap-3">
                    <DollarSign className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-yellow-500 mb-2">Close & Earn Reward</h3>
                        <p className="text-sm text-gray-300 mb-1">
                            Auction has ended. {noBids ? 'Only owner can close it.' : 'Anyone can close it!'}
                        </p>
                        <p className="text-xs text-yellow-300 mb-4">
                            💰 Earn <strong>{rewardEth} ETH</strong> reward for closing
                        </p>
                        <button
                            onClick={handleCloseAuction}
                            disabled={isPending}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold py-3 rounded-lg transition-colors cursor-target"
                        >
                            {isPending ? 'Closing...' : `Close Auction (Earn ${rewardEth} ETH)`}
                        </button>
                        {actionStatus && (
                            <p className="text-xs text-gray-400 mt-2 text-center">{actionStatus}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Checking win status
    if (checking) {
        return (
            <div className="card-zama border-2 border-purple-500/50">
                <div className="flex items-center justify-center gap-3 py-6">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    <div className="text-center">
                        <p className="text-sm font-semibold text-purple-300">Checking your result...</p>
                        <p className="text-xs text-gray-400 mt-1">Decrypting win status (private)</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && auctionEnded && hasBid) {
        return (
            <div className="card-zama border-2 border-red-500/50">
                <p className="text-red-500 mb-2 text-sm">{error}</p>
                <button
                    onClick={checkWinStatus}
                    disabled={checking}
                    className="text-sm text-blue-500 hover:text-blue-400 cursor-target"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Manual Check Button (Default state when auction ended + has bid + unknown status)
    if (auctionEnded && hasBid && winStatus === null) {
        return (
            <div className="card-zama border-2 border-purple-500/50">
                <div className="flex items-start gap-3">
                    <Trophy className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-purple-500 mb-2">Auction Ended</h3>
                        <p className="text-sm text-gray-300 mb-4">
                            Check if you won! Your result is private.
                        </p>
                        <button
                            onClick={checkWinStatus}
                            disabled={checking}
                            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors cursor-target"
                        >
                            {checking ? 'Checking...' : 'Check My Result'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Winner celebration!
    if (winStatus === true) {
        return (
            <div className="card-zama border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-transparent">
                <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-500 mb-2">🎉 Congratulations!</h2>
                    <p className="text-lg text-gray-300 mb-1">You Won the Auction!</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Your bid: <strong className="text-yellow-500">{bidDeposit ? formatEther(bidDeposit) : '0'} ETH</strong>
                    </p>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/30">
                        <p className="text-xs text-gray-400 mb-2">📦 Next Steps:</p>
                        <p className="text-sm text-gray-300">
                            Contact the seller to arrange item delivery.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Your deposit will go to the seller when they withdraw proceeds.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Loser - can claim refund
    if (winStatus === false && bidDeposit && bidDeposit > 0n) {
        return (
            <div className="card-zama border-2 border-blue-500/50">
                <div className="flex items-start gap-3">
                    <Wallet className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-500 mb-2">Claim Your Refund</h3>
                        <p className="text-sm text-gray-300 mb-2">
                            Your bid: <strong>{formatEther(bidDeposit)} ETH</strong>
                        </p>
                        <p className="text-xs text-blue-300 mb-4">
                            💯 You'll receive a <strong>full 100% refund</strong>!
                        </p>
                        <button
                            onClick={handleWithdrawRefund}
                            disabled={isPending}
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors cursor-target"
                        >
                            {isPending ? 'Processing...' : 'Withdraw Refund'}
                        </button>
                        {actionStatus && (
                            <p className="text-xs text-gray-400 mt-2 text-center">{actionStatus}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Seller withdrawal (after bidders have time to claim) - only show if there were bids
    if (isOwner && auctionEnded && !noBids) {
        return (
            <div className="card-zama border-2 border-green-500/50">
                <div className="flex items-start gap-3">
                    <DollarSign className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-500 mb-2">Withdraw Proceeds</h3>
                        <p className="text-sm text-gray-300 mb-4">
                            Withdraw the winner's deposit (remaining balance in contract).
                        </p>
                        <button
                            onClick={handleWithdrawProceeds}
                            disabled={isPending}
                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors cursor-target"
                        >
                            {isPending ? 'Processing...' : 'Withdraw Proceeds'}
                        </button>
                        {actionStatus && (
                            <p className="text-xs text-gray-400 mt-2 text-center">{actionStatus}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
