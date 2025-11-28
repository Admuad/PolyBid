import { useRef, useEffect } from 'react';
import { Clock, Users, Trophy, Lock, TrendingUp, Shield, Eye } from 'lucide-react';
import gsap from 'gsap';

interface AuctionCardProps {
  auctionAddress: string;
  itemName: string;
  description: string;
  creator: string;
  endTime: number;
  bidderCount: number;
  isActive: boolean;
  onClick: () => void;
  isTrending?: boolean;
  isFeatured?: boolean;
  imageDataUri?: string;
}

export function AuctionCard({
  auctionAddress: _auctionAddress, // Not displayed for privacy
  itemName,
  description,
  creator: _creator, // Not displayed - showing "Anonymous Seller" instead
  endTime,
  bidderCount,
  isActive,
  onClick,
  isTrending = false,
  isFeatured = false,
  imageDataUri,
}: AuctionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate time remaining
  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = Math.max(0, endTime - now);
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  // Card tilt animation with 15° rotation and 0.1s duration
  useEffect(() => {
    if (!cardRef.current) return;

    // Check if device is mobile (touch-enabled or small screen)
    const isMobile = window.matchMedia('(max-width: 768px)').matches ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);

    if (isMobile) return;

    const element = cardRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 15° rotation sensitivity as per memory
      const rotateX = ((y - centerY) / centerY) * -15;
      const rotateY = ((x - centerX) / centerX) * 15;

      gsap.to(element, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.1, // Fast response as per memory
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`card-zama cursor-pointer cursor-target transition-all hover:border-zama-primary/60 relative group ${!isActive ? 'opacity-75' : ''
        }`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {isActive ? (
          <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Active
          </span>
        ) : (
          <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-xs font-semibold">
            Ended
          </span>
        )}

        {/* Trending Badge */}
        {isTrending && (
          <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending
          </span>
        )}

        {/* Featured Badge */}
        {isFeatured && (
          <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Featured
          </span>
        )}
      </div>

      {/* FHE Privacy Badge - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-1 bg-zama-primary/20 text-zama-primary px-2 py-1 rounded-full text-xs font-semibold">
          <Shield className="w-3 h-3" />
          <span>FHE Protected</span>
        </div>
      </div>

      {/* Item Icon/Image */}
      <div className="w-full h-32 bg-gradient-to-br from-zama-primary/20 to-zama-primary/5 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
        {/* Image if available, otherwise fallback gradient */}
        {imageDataUri ? (
          <img
            src={imageDataUri}
            alt={itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {/* Fallback gradient background with lock icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-zama-primary/30 via-transparent to-purple-600/20 group-hover:from-zama-primary/40 group-hover:to-purple-600/30 transition-all" />
            <Lock className="w-16 h-16 text-zama-primary/60 relative z-10" />
          </>
        )}
        {/* Activity Indicator */}
        {bidderCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-zama-primary text-black text-xs font-bold px-2 py-1 rounded-full z-20">
            {bidderCount} bids
          </div>
        )}
      </div>

      {/* Item Name */}
      <h3 className="text-xl font-bold text-white mb-2 truncate">{itemName}</h3>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
        {description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Time Remaining */}
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-zama-primary" />
            <span className="text-xs text-gray-400">Time Left</span>
          </div>
          {isActive ? (
            <p className="text-sm font-mono font-semibold text-white">
              {hours > 0 && `${hours}h `}
              {minutes}m {seconds}s
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-500">Ended</p>
          )}
        </div>

        {/* Bid Count */}
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-zama-primary" />
            <span className="text-xs text-gray-400">Bidders</span>
          </div>
          <p className="text-sm font-semibold text-white">{bidderCount}</p>
        </div>
      </div>

      {/* Creator Info with Seller Badge */}
      <div className="border-t border-gray-700 pt-3 mb-3">
        <p className="text-xs text-gray-500 mb-1">Creator</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zama-primary">🔒 Anon Seller</p>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            Verified
          </div>
        </div>
      </div>

      {/* Privacy Score Badge */}
      <div className="bg-zama-primary/10 border border-zama-primary/30 rounded-lg p-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-zama-primary font-semibold">
            <Eye className="w-3 h-3" />
            Privacy Score
          </div>
          <span className="text-zama-primary font-bold">Max</span>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trophy className="w-5 h-5 text-zama-primary" />
      </div>
    </div>
  );
}
