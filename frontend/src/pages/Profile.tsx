import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useAllAuctions, useAuctionStatuses, useMyAuctions, useUserParticipation, useCloseAuction, useWithdrawRefund } from '@/hooks/useAuction';

import { User, Wallet, Package, Gavel, CheckCircle, Clock, ExternalLink, Trophy, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatEther } from 'viem';
import DotGrid from '@/components/DotGrid';
import { showErrorToast } from '@/lib/errorHandler';

type TabType = 'selling' | 'buying';

export function Profile() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const { auctionAddresses: allAuctions } = useAllAuctions();
    const { auctionAddresses: myAuctions } = useMyAuctions(address);
    const statuses = useAuctionStatuses(allAuctions);
    const participation = useUserParticipation(address, allAuctions);
    const [activeTab, setActiveTab] = useState<TabType>('selling');

    // Filter participated auctions (where user has bid)
    const participatedAuctions = allAuctions.filter(addr => participation.get(addr));

    // Get last 4 characters of address for anonymization
    const anonId = address ? `Anon-${address.slice(-4)}` : 'Anon';

    if (!isConnected) {
        return (
            <div className="min-h-screen py-20 bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Wallet className="w-16 h-16 text-gray-600 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-300">Wallet Not Connected</h2>
                    <p className="text-gray-500">Please connect your wallet to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-black">
            {/* DotGrid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <DotGrid
                    dotSize={5}
                    gap={12}
                    baseColor="#00B8A3"
                    activeColor="#00B8A3"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                    style={{ opacity: 0.3, height: '100vh', width: '100%' }}
                />
            </div>

            <div className="relative z-10 py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Enhanced Profile Header */}
                    <div className="card-zama p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-gradient-zama flex items-center justify-center shadow-lg shadow-zama-primary/30">
                                <User className="w-10 h-10 text-white" />
                            </div>

                            {/* Identity & Status */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">{anonId}</h1>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        Connected
                                    </div>
                                </div>
                                <p className="text-gray-400 font-mono text-sm mb-3">{address}</p>

                                {/* Wallet Balance */}
                                <div className="flex items-center gap-2 text-sm">
                                    <Wallet className="w-4 h-4 text-zama-primary" />
                                    <span className="text-gray-300">Balance:</span>
                                    <span className="text-zama-primary font-semibold">
                                        {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : 'Loading...'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="flex-1 md:flex-none text-center bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-800">
                                    <Package className="w-5 h-5 text-zama-primary mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Created</p>
                                    <p className="text-xl font-bold text-white">{myAuctions.length}</p>
                                </div>
                                <div className="flex-1 md:flex-none text-center bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-800">
                                    <Gavel className="w-5 h-5 text-zama-primary mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Bids Placed</p>
                                    <p className="text-xl font-bold text-white">{participatedAuctions.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabbed Interface */}
                    <div className="mb-8">
                        <div className="flex gap-2 mb-6 border-b border-gray-800">
                            <button
                                onClick={() => setActiveTab('selling')}
                                className={`px-6 py-3 font-semibold transition-all ${activeTab === 'selling'
                                    ? 'text-zama-primary border-b-2 border-zama-primary'
                                    : 'text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Selling ({myAuctions.length})
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('buying')}
                                className={`px-6 py-3 font-semibold transition-all ${activeTab === 'buying'
                                    ? 'text-zama-primary border-b-2 border-zama-primary'
                                    : 'text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Gavel className="w-5 h-5" />
                                    Buying ({participatedAuctions.length})
                                </div>
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'selling' ? (
                            <SellingTab myAuctions={myAuctions} statuses={statuses} />
                        ) : (
                            <BuyingTab participatedAuctions={participatedAuctions} statuses={statuses} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Selling Tab Component
function SellingTab({ myAuctions, statuses }: { myAuctions: string[], statuses: Map<string, any> }) {
    if (myAuctions.length === 0) {
        return (
            <div className="text-center py-16 card-zama border-dashed border-gray-800">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Auctions Created</h3>
                <p className="text-gray-500 mb-6">You haven't created any encrypted auctions yet.</p>
                <Link to="/marketplace" className="btn-zama inline-flex items-center gap-2">
                    Create Your First Auction
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {myAuctions.map((auctionAddress) => (
                <SellerAuctionCard key={auctionAddress} auctionAddress={auctionAddress} status={statuses.get(auctionAddress)} />
            ))}
        </div>
    );
}

// Seller Auction Card with Actions
function SellerAuctionCard({ auctionAddress, status }: { auctionAddress: string, status: any }) {
    const { closeAuction, isPending: isClosing } = useCloseAuction();

    const getStatusBadge = () => {
        if (!status) return null;

        if (status.isActive) {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Active
                </div>
            );
        } else if (status.hasEnded && !status.winner) {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold border border-yellow-500/30">
                    <Clock className="w-3 h-3" />
                    Pending Reveal
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-semibold border border-gray-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Ended
                </div>
            );
        }
    };

    const handleEndBidding = async () => {
        try {
            await closeAuction(auctionAddress);
        } catch (error) {
            showErrorToast(error, 'transaction');
        }
    };

    return (
        <div className="card-zama p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">Auction</h3>
                        {getStatusBadge()}
                    </div>
                    <p className="text-sm text-gray-400 font-mono mb-1">{auctionAddress}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{status?.bidderCount || 0} bids</span>
                        {status?.timeRemaining && status.timeRemaining > 0 && (
                            <span>{Math.floor(status.timeRemaining / 60)} mins remaining</span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {status?.isActive && (
                        <button
                            onClick={handleEndBidding}
                            disabled={isClosing}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-target"
                        >
                            {isClosing ? 'Ending...' : 'End Bidding'}
                        </button>
                    )}
                    {status?.hasEnded && !status.winner && (
                        <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-semibold transition-colors cursor-target">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                Reveal Winner
                            </div>
                        </button>
                    )}
                    {status?.winner && (
                        <div className="px-4 py-2 bg-zama-primary/20 text-zama-primary border border-zama-primary/30 rounded-lg text-sm font-semibold">
                            Winner: Anon-{status.winner.slice(-4)}
                        </div>
                    )}
                    <Link
                        to={`/marketplace`}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors cursor-target flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Buying Tab Component
function BuyingTab({ participatedAuctions, statuses }: { participatedAuctions: string[], statuses: Map<string, any> }) {
    if (participatedAuctions.length === 0) {
        return (
            <div className="text-center py-16 card-zama border-dashed border-gray-800">
                <Gavel className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Bids Placed</h3>
                <p className="text-gray-500 mb-6">You haven't placed any encrypted bids yet.</p>
                <Link to="/marketplace" className="btn-zama inline-flex items-center gap-2">
                    Browse Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {participatedAuctions.map((auctionAddress) => (
                <BuyerAuctionCard key={auctionAddress} auctionAddress={auctionAddress} status={statuses.get(auctionAddress)} />
            ))}
        </div>
    );
}

// Buyer Auction Card with Actions
function BuyerAuctionCard({ auctionAddress, status }: { auctionAddress: string, status: any }) {
    const { withdrawRefund, isPending: isWithdrawing } = useWithdrawRefund();

    const handleClaimFunds = async () => {
        try {
            await withdrawRefund(auctionAddress);
        } catch (error) {
            showErrorToast(error, 'transaction');
        }
    };

    return (
        <div className="card-zama p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Auction Bid</h3>
                    <p className="text-sm text-gray-400 font-mono mb-3">{auctionAddress}</p>

                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-2 h-2 bg-zama-primary rounded-full" />
                            <span>Your Encrypted Bid: Hidden</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <span>Locked Deposit: Check on-chain</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-zama-primary/20 hover:bg-zama-primary/30 text-zama-primary border border-zama-primary/30 rounded-lg text-sm font-semibold transition-colors cursor-target">
                        Check Win Status
                    </button>
                    {status?.hasEnded && (
                        <button
                            onClick={handleClaimFunds}
                            disabled={isWithdrawing}
                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-target"
                        >
                            {isWithdrawing ? 'Claiming...' : 'Claim Funds'}
                        </button>
                    )}
                    <Link
                        to={`/marketplace`}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors cursor-target flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
}
