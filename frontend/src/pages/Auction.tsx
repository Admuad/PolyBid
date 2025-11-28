import { AlertCircle, Clock, Users, Trophy, Zap } from 'lucide-react';
import { AuctionTimer } from '@/components/AuctionTimer';
import { BidForm } from '@/components/BidForm';
import { EncryptedBidList } from '@/components/EncryptedBidList';
import { WinnerReveal } from '@/components/WinnerReveal';
import { useAccount } from 'wagmi';
import { useAuctionStatus, useAuctionBidders, useHasSubmittedBid, useAuctionWinner, useInitializeAuction } from '@/hooks/useAuction';
import { useState } from 'react';

export function Auction() {
  const { isConnected, address } = useAccount();
  const { isActive, auctionStarted, auctionEnded, endTime, refetch } = useAuctionStatus();
  const { bidderCount } = useAuctionBidders();
  const { winner } = useAuctionWinner();
  const { hasBid } = useHasSubmittedBid(address);
  const { initializeAuction, isPending: isInitializing, isSuccess: initSuccess } = useInitializeAuction();
  const [durationMinutes, setDurationMinutes] = useState(5);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient-zama">
            PolyBid
          </h1>
          <p className="text-xl text-gray-300">
            Submit your encrypted bid and compete for victory
          </p>
        </div>

        {/* Status Alert */}
        {!isConnected && (
          <div className="max-w-2xl mx-auto mb-8 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-semibold">Wallet Not Connected</p>
                <p className="text-yellow-500/80 text-sm mt-1">
                  Please connect your wallet to participate in the auction
                </p>
              </div>
            </div>
          </div>
        )}

        {!auctionStarted && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-500 font-semibold">Auction Not Started</p>
                  <p className="text-blue-500/80 text-sm mt-1">
                    The auction hasn't started yet. Please initialize it to begin accepting bids.
                  </p>
                </div>
              </div>
            </div>

            {isConnected && (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">Auction Duration (minutes)</span>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-zama-primary"
                  />
                </label>
                <button
                  onClick={() => initializeAuction(durationMinutes * 60)}
                  disabled={isInitializing}
                  className="w-full bg-zama-primary hover:bg-zama-primary/90 disabled:bg-gray-600 text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  {isInitializing ? 'Initializing...' : 'Initialize Auction'}
                </button>
              </div>
            )}

            {initSuccess && (
              <div className="mt-4 bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-500 font-semibold">✓ Auction initialized successfully!</p>
              </div>
            )}
          </div>
        )}

        {/* Auction Stats */}
        {auctionStarted && !auctionEnded && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-zama">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-zama-primary" />
                <h3 className="text-sm text-gray-400">Status</h3>
              </div>
              <p className="text-2xl font-bold text-zama-primary">
                {isActive ? 'Active' : 'Ended'}
              </p>
            </div>

            <div className="card-zama">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-zama-primary" />
                <h3 className="text-sm text-gray-400">Total Bids</h3>
              </div>
              <p className="text-2xl font-bold text-white">{bidderCount}</p>
            </div>

            <div className="card-zama">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-zama-primary" />
                <h3 className="text-sm text-gray-400">Your Status</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {!isConnected ? 'Not Connected' : hasBid ? 'Submitted' : 'Not Bid'}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column */}
          <div className="space-y-8">
            {isActive && (
              <div className="card-zama">
                <AuctionTimer endTime={endTime} onExpire={refetch} />
              </div>
            )}

            {isActive && isConnected && !hasBid && (
              <BidForm onSuccess={refetch} />
            )}

            {isActive && hasBid && (
              <div className="card-zama border-2 border-green-500/50">
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-500 mb-2">
                    Bid Submitted!
                  </h3>
                  <p className="text-gray-400">
                    Your encrypted bid has been recorded. Good luck!
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    You can update your bid before the auction ends
                  </p>
                </div>
              </div>
            )}

            {auctionEnded && winner && (
              <WinnerReveal winner={winner} />
            )}

            {auctionEnded && !winner && (
              <div className="card-zama border-2 border-yellow-500/50">
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-yellow-500 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-500 mb-2">
                    Auction Ended
                  </h3>
                  <p className="text-gray-400">
                    Determining winner using FHE...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            <EncryptedBidList />
          </div>
        </div>

        {/* How FHE Works */}
        <div className="max-w-4xl mx-auto">
          <div className="card-zama">
            <h3 className="text-2xl font-bold mb-6 text-gradient-zama">
              How FHE Encryption Works
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zama-primary/20 flex items-center justify-center text-zama-primary font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Client-Side Encryption</h4>
                  <p className="text-sm text-gray-400">
                    Your bid is encrypted in your browser using Zama's FHE SDK before being sent to the blockchain.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zama-primary/20 flex items-center justify-center text-zama-primary font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">On-Chain Storage</h4>
                  <p className="text-sm text-gray-400">
                    Encrypted bids are stored on-chain. No one can decrypt them, not even the contract owner.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zama-primary/20 flex items-center justify-center text-zama-primary font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Homomorphic Comparison</h4>
                  <p className="text-sm text-gray-400">
                    The smart contract compares encrypted bids without decrypting them using FHE operations.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zama-primary/20 flex items-center justify-center text-zama-primary font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Winner Reveal</h4>
                  <p className="text-sm text-gray-400">
                    After the auction ends, the winning bid is revealed through secure decryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}