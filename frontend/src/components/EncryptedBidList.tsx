import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useSpecificAuctionBidders } from '@/hooks/useAuction';

interface EncryptedBidListProps {
  auctionAddress?: string;
  className?: string;
}

export function EncryptedBidList({ auctionAddress, className = '' }: EncryptedBidListProps) {
  const { bidderCount } = auctionAddress 
    ? useSpecificAuctionBidders(auctionAddress) 
    : { bidderCount: 0 };

  return (
    <div className={`card-zama ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gradient-zama flex items-center gap-2">
          <EyeOff className="w-5 h-5" />
          Encrypted Bids
        </h3>
        <span className="bg-zama-primary/20 text-zama-primary px-3 py-1 rounded-full text-sm font-semibold">
          {bidderCount} {bidderCount === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      {bidderCount === 0 ? (
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No bids submitted yet</p>
          <p className="text-sm text-gray-500 mt-2">Be the first to place an encrypted bid!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: bidderCount }).map((_, index) => (
            <div
              key={index}
              className="bg-black/30 border border-zama-primary/20 rounded-lg p-4 hover:border-zama-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zama-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-zama-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Bidder #{index + 1}</p>
                    <p className="text-xs text-gray-500 font-mono">Encrypted</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zama-primary" />
                  <span className="text-sm text-gray-400 font-mono">••••••••</span>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-zama-primary/5 border border-zama-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-zama-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                All bids are encrypted using <span className="text-zama-primary font-semibold">FHE</span>.
                Amounts will remain hidden until the auction concludes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
