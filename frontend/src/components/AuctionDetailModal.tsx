import { useRef, useEffect } from 'react';
import { X, Lock, Users, Trophy, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { BidForm } from './BidForm';
import { AuctionTimer } from './AuctionTimer';
import { AuctionActions } from './AuctionActions';
import { useScrollableContainer } from '@/hooks/useScrollableContainer';
import { useAccount } from 'wagmi';

interface AuctionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionAddress: string;
  itemName: string;
  description: string;
  creator: string;
  isActive: boolean;
  auctionEnded: boolean;
  endTime: number;
  bidderCount: number;
  winner?: string;
  hasBid: boolean;
  imageDataUri?: string;
  onBidSuccess: () => void;
  onBidStatus?: (status: 'pending' | 'success' | 'error', message: string) => void;
}

export function AuctionDetailModal({
  isOpen,
  onClose,
  auctionAddress,
  itemName,
  description,
  creator,
  isActive,
  auctionEnded,
  endTime,
  bidderCount,
  // winner,
  hasBid,
  imageDataUri,
  onBidSuccess,
  onBidStatus,
}: AuctionDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useScrollableContainer();
  const { address } = useAccount();

  const isOwner = creator && address && creator.toLowerCase() === address.toLowerCase();

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

      if (typeof window !== 'undefined' && (window as any).lenisInstance) {
        (window as any).lenisInstance.stop();
      }

      if (modalRef.current && overlayRef.current) {
        const tl = gsap.timeline();
        tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        tl.fromTo(
          modalRef.current,
          { y: 50, scale: 0.9, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' },
          '-=0.1'
        );
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';

      if (typeof window !== 'undefined' && (window as any).lenisInstance) {
        (window as any).lenisInstance.start();
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';

      if (typeof window !== 'undefined' && (window as any).lenisInstance) {
        (window as any).lenisInstance.start();
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.documentElement.style.overflow = '';
          document.documentElement.style.paddingRight = '';

          if (typeof window !== 'undefined' && (window as any).lenisInstance) {
            (window as any).lenisInstance.start();
          }

          onClose();
        },
      });

      tl.to(modalRef.current, { y: 50, scale: 0.9, opacity: 0, duration: 0.2, ease: 'power2.in' });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className="relative bg-gradient-to-br from-gray-900 to-black border border-zama-primary/30 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-black border-b border-gray-700 p-6 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-6 h-6 text-zama-primary" />
                <h2 className="text-2xl font-bold text-white">{itemName}</h2>
                {isActive ? (
                  <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                    🟢 Active
                  </span>
                ) : (
                  <span className="bg-gray-500/20 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold">
                    Ended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">by 🔒 Anon Seller</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors cursor-target"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-hide p-6"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          data-lenis-prevent
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {imageDataUri && (
                <div className="card-zama p-0 overflow-hidden">
                  <img
                    src={imageDataUri}
                    alt={itemName}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {isActive && (
                <div className="card-zama">
                  <AuctionTimer endTime={endTime} onExpire={() => { }} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="card-zama">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-zama-primary" />
                    <span className="text-xs text-gray-400">Total Bids</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{bidderCount}</p>
                </div>

                <div className="card-zama">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-zama-primary" />
                    <span className="text-xs text-gray-400">Status</span>
                  </div>
                  <p className="text-2xl font-bold text-zama-primary">
                    {hasBid ? '✓ Bid' : 'Ready'}
                  </p>
                </div>
              </div>


              {auctionEnded && (
                <div className="card-zama border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-400">🔒 Privacy Protected</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Winner identity remains private. Check below to see your result!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card-zama">
                <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                <p className="text-gray-300">{description}</p>
              </div>

              {isActive && !hasBid && (
                <BidForm auctionAddress={auctionAddress} onSuccess={onBidSuccess} onBidStatus={onBidStatus} onCancel={onClose} />
              )}

              {hasBid && (
                <div className="card-zama border-2 border-green-500/50">
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-green-500 mb-2">Bid Submitted</h3>
                    <p className="text-sm text-gray-400">Your encrypted bid has been recorded</p>
                  </div>
                </div>
              )}

              {auctionEnded && !hasBid && (
                <div className="card-zama border-2 border-gray-500/50">
                  <div className="text-center py-6">
                    <AlertCircle className="w-6 h-6 text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">This auction has ended</p>
                  </div>
                </div>
              )}

              {/* Show withdrawal/closing actions after auction ends */}
              <AuctionActions
                auctionAddress={auctionAddress}
                auctionEnded={auctionEnded}
                endTime={endTime}
                isOwner={!!isOwner}
                hasBid={hasBid}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
