import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lock, Filter, TrendingUp, X, Zap, AlertCircle, CheckCircle, Clock, Flame } from 'lucide-react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import searchToXAnimation from '@/assets/animations/searchToX.json';
import radioButtonAnimation from '@/assets/animations/radioButton.json';
import { CreateAuctionModal } from '@/components/CreateAuctionModal';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { useAllAuctions, useAuctionStatuses, useCreateAuction } from '@/hooks/useAuction';
import { AnimatedLock } from '@/components/AnimatedLock';
import { AuctionCardWrapper } from '@/components/AuctionCardWrapper';
import { AuctionDetailModalWrapper } from '@/components/AuctionDetailModalWrapper';
import { FloatingFAB } from '@/components/FloatingFAB';

const AnimatedRadio = ({ checked, label, value, name, onChange }: { checked: boolean, label: string, value: string, name: string, onChange: (e: any) => void }) => {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieRef.current) {
      if (checked) {
        lottieRef.current.play(); // Play from start to end
      } else {
        lottieRef.current.stop(); // Reset to start
      }
    }
  }, [checked]);

  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative w-6 h-6 flex items-center justify-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only" // Hide the real input
        />
        <div className="w-8 h-8 -ml-1"> {/* Adjust size/position as needed */}
          <Lottie
            lottieRef={lottieRef}
            animationData={radioButtonAnimation}
            loop={false}
            autoplay={false}
            style={{ width: '100%', height: '100%', filter: 'brightness(0) invert(1)' }} // Make white
          />
        </div>
      </div>
      <span className={`text-xs sm:text-sm transition-colors ${checked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
        {label}
      </span>
    </label>
  );
};

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export function Marketplace() {
  const { isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAuctionAddress, setSelectedAuctionAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchIconRef = useRef<LottieRefCurrentProps>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [sortBy, setSortBy] = useState<'ending-soon' | 'recently-started' | 'most-bids'>('ending-soon');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const { auctionAddresses, refetch: refetchAuctions } = useAllAuctions();
  const { createAuction, isPending: isCreating, isSuccess: isTxSent, error, hash } = useCreateAuction();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Enable mouse wheel scrolling on the page
  useEffect(() => {
    const handleWheel = () => { };
    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Toast notification system
  const addToast = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Notify when transaction is sent
  useEffect(() => {
    if (isTxSent) {
      addToast('info', '🚀 Transaction sent! Waiting for confirmation...');
      setShowCreateModal(false);
    }
  }, [isTxSent]);

  // Refetch auctions when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      addToast('success', '✅ Auction created successfully! Blockchain confirmed.');
      // Refetch auctions immediately after confirmation
      refetchAuctions();
    }
  }, [isConfirmed, refetchAuctions]);

  useEffect(() => {
    if (error) {
      addToast('error', `❌ Error creating auction: ${error.message || 'Unknown error'}`);
    }
  }, [error]);

  // Search expansion animation - expands to the left
  useEffect(() => {
    if (searchContainerRef.current) {
      if (isSearchExpanded) {
        gsap.to(searchContainerRef.current, {
          width: 'calc(100% - 65px)',
          duration: 0.3,
          ease: 'power2.out',
        });
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        gsap.to(searchContainerRef.current, {
          width: '3.5rem',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  }, [isSearchExpanded]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        if (searchQuery === '') {
          setIsSearchExpanded(false);
          searchIconRef.current?.setDirection(-1);
          searchIconRef.current?.play();
        }
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchExpanded, searchQuery]);

  const handleCreateAuction = (itemName: string, description: string, durationSeconds: number, openingPrice: string, imageDataUri?: string) => {
    addToast('info', '⏳ Creating auction... Waiting for wallet confirmation...');
    createAuction(itemName, description, durationSeconds, openingPrice, imageDataUri);
  };

  // Get display limits based on screen size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const activeLimit = isMobile ? 3 : 6;
  const completedLimit = isMobile ? 3 : 6;

  // Fetch statuses for all auctions efficiently
  const statuses = useAuctionStatuses(auctionAddresses);

  // Filter auctions based on status and REVERSE to show newest first
  const activeAuctionsList = [...auctionAddresses].reverse().filter(addr => {
    const status = statuses.get(addr);
    return status ? status.isActive : false;
  });

  const endedAuctionsList = [...auctionAddresses].reverse().filter(addr => {
    const status = statuses.get(addr);
    // Consider ended if NOT active (even if auctionEnded is false on contract)
    return status ? !status.isActive : false;
  });

  // Apply status filter
  let filteredAuctions = [...auctionAddresses].reverse();
  if (statusFilter === 'active') {
    filteredAuctions = activeAuctionsList;
  } else if (statusFilter === 'ended') {
    filteredAuctions = endedAuctionsList;
  }

  // Apply sorting
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    const statusA = statuses.get(a);
    const statusB = statuses.get(b);

    if (sortBy === 'ending-soon') {
      const timeA = statusA?.endTime || Infinity;
      const timeB = statusB?.endTime || Infinity;
      return timeA - timeB;
    } else if (sortBy === 'recently-started') {
      return 0;
    } else if (sortBy === 'most-bids') {
      const countA = statusA?.bidderCount || 0;
      const countB = statusB?.bidderCount || 0;
      return countB - countA;
    }
    return 0;
  });

  // Sort for Trending (by bidder count)
  const trendingAuctionsList = [...activeAuctionsList].sort((a, b) => {
    const countA = statuses.get(a)?.bidderCount || 0;
    const countB = statuses.get(b)?.bidderCount || 0;
    return countB - countA;
  }).slice(0, 3); // Limit to 3 as requested

  // Sort for Featured (e.g. by end time - ending soonest first)
  const featuredAuctionsList = [...activeAuctionsList].sort((a, b) => {
    const timeA = statuses.get(a)?.endTime || 0;
    const timeB = statuses.get(b)?.endTime || 0;
    return timeA - timeB;
  }).slice(0, 3); // Limit to 3 as requested

  return (
    <div className="min-h-screen py-8 bg-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AnimatedLock />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-zama">FHE Marketplace</h1>
            </div>
            <p className="text-xs sm:text-sm md:text-lg text-gray-300">Encrypted auctions with zero front-running</p>
          </div>
        </div>

        {/* FHE Privacy Highlight */}
        <div className="mb-8">
          <PrivacyBadge variant="card" />
        </div>

        {/* Stats Bar - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
          <div className="card-zama p-3 sm:p-6 hover:border-zama-primary/60 transition-colors">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-zama-primary flex-shrink-0" />
              <h3 className="text-xs text-gray-400 truncate">Total</h3>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white truncate">{auctionAddresses.length}</p>
          </div>

          <div className="card-zama p-3 sm:p-6 hover:border-green-500/60 transition-colors">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-green-500 flex-shrink-0" />
              <h3 className="text-xs text-gray-400 truncate">Active</h3>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-500 truncate">{activeAuctionsList.length}</p>
          </div>

          <div className="card-zama p-3 sm:p-6 hover:border-zama-primary/60 transition-colors">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Lock className="w-3 sm:w-4 h-3 sm:h-4 text-zama-primary flex-shrink-0" />
              <h3 className="text-xs text-gray-400 truncate">Privacy</h3>
            </div>
            <p className="text-xs sm:text-lg font-bold text-zama-primary truncate">Max</p>
          </div>

          <div className="card-zama p-3 sm:p-6 hover:border-blue-400/60 transition-colors">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Flame className="w-3 sm:w-4 h-3 sm:h-4 text-orange-400 flex-shrink-0" />
              <h3 className="text-xs text-gray-400 truncate">Ended</h3>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-orange-400 truncate">{endedAuctionsList.length}</p>
          </div>
        </div>

        {/* Back Button when filtered */}
        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
              <TrendingUp className="w-4 h-4 rotate-180" />
            </div>
            <span>Back to Marketplace</span>
          </button>
        )}


        {/* Search and Filter Bar - Right Aligned */}
        <div className="mb-8">
          <div className="flex gap-2 sm:gap-3 justify-end items-center h-[48px]">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 bg-gray-900 border border-zama-primary/30 rounded-lg text-gray-300 hover:border-zama-primary hover:text-white transition-colors h-full flex-shrink-0 cursor-target"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Filters</span>
            </button>

            {/* Animated Search - Expands Left */}
            <div
              ref={searchContainerRef}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 bg-gray-900 border border-zama-primary/30 rounded-lg transition-all h-full overflow-hidden ${!isSearchExpanded ? 'cursor-target' : ''}`}
              style={{
                width: isSearchExpanded ? 'calc(100% - 65px)' : '3.5rem',
                maxWidth: isSearchExpanded ? '500px' : '3.5rem',
              }}
              onClick={() => {
                if (!isSearchExpanded) {
                  setIsSearchExpanded(true);
                  searchIconRef.current?.setDirection(1);
                  searchIconRef.current?.play();
                }
              }}
            >
              <div className="flex-shrink-0 cursor-pointer" style={{ width: 20, height: 20 }}>
                <Lottie
                  lottieRef={searchIconRef}
                  animationData={searchToXAnimation}
                  loop={false}
                  autoplay={false}
                  style={{
                    width: 20,
                    height: 20,
                    filter: 'brightness(0) invert(1)', // White color
                  }}
                />
              </div>

              {isSearchExpanded && (
                <>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-xs sm:text-sm min-w-0 pr-8"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                      className="absolute right-3 z-50 text-gray-400 hover:text-white flex-shrink-0 cursor-pointer p-1 hover:bg-white/10 rounded-full transition-colors cursor-target"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Filters Panel with Slide Animation */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="card-zama p-4 sm:p-6 space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-3">Status</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: '📋 All Auctions' },
                          { value: 'active', label: '🟢 Active' },
                          { value: 'ended', label: '🏁 Completed' },
                        ].map((option) => (
                          <AnimatedRadio
                            key={option.value}
                            name="status"
                            value={option.value}
                            checked={statusFilter === option.value}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            label={option.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-3">Sort By</label>
                      <div className="space-y-2">
                        {[
                          { value: 'ending-soon', label: '⏰ Ending Soon' },
                          { value: 'recently-started', label: '✨ Recently Started' },
                          { value: 'most-bids', label: '🔥 Most Bids' },
                        ].map((option) => (
                          <AnimatedRadio
                            key={option.value}
                            name="sort"
                            value={option.value}
                            checked={sortBy === option.value}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            label={option.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Auctions Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient-zama">🔥 Active Auctions</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-semibold">
                {activeAuctionsList.length}
              </span>
            </div>
            {statusFilter === 'all' && activeAuctionsList.length > 0 && (
              <Link
                to="/marketplace/active"
                className="text-zama-primary hover:text-zama-primary/80 text-sm font-semibold flex items-center gap-1 cursor-target"
              >
                See All →
              </Link>
            )}
          </div>

          {activeAuctionsList.length === 0 ? (
            <div className="card-zama p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Active Auctions</h3>
                <p className="text-gray-400 mb-6">
                  There are no active auctions at the moment. Would you like to create one or check back later?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {isConnected && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-zama inline-flex items-center gap-2 cursor-target"
                    >
                      <Plus className="w-5 h-5" />
                      Create Auction
                    </button>
                  )}
                  <button
                    onClick={() => refetchAuctions()}
                    className="px-6 py-3 rounded-lg border-2 border-zama-primary text-zama-primary hover:bg-zama-primary hover:text-white font-semibold transition-all inline-flex items-center gap-2 cursor-target"
                  >
                    <Clock className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeAuctionsList.slice(0, activeLimit).map((auctionAddress: string) => (
                <AuctionCardWrapper
                  key={auctionAddress}
                  auctionAddress={auctionAddress}
                  onClick={() => setSelectedAuctionAddress(auctionAddress)}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>

        {/* Featured Picks Section */}
        {featuredAuctionsList.length > 0 && statusFilter === 'all' && (
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient-zama">⭐ Featured Picks</h2>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs sm:text-sm font-semibold">Curated</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredAuctionsList.map((auctionAddress) => (
                <AuctionCardWrapper
                  key={auctionAddress}
                  auctionAddress={auctionAddress}
                  onClick={() => setSelectedAuctionAddress(auctionAddress)}
                  isFeatured
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Section */}
        {trendingAuctionsList.length > 0 && statusFilter === 'all' && (
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient-zama">🔥 Trending Now</h2>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm font-semibold">Hot</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trendingAuctionsList.map((auctionAddress) => (
                <AuctionCardWrapper
                  key={auctionAddress}
                  auctionAddress={auctionAddress}
                  onClick={() => setSelectedAuctionAddress(auctionAddress)}
                  isTrending
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Auctions Section */}
        {statusFilter === 'all' && endedAuctionsList.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-gradient-zama">🏁 Completed Auctions</h2>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm font-semibold">
                  {endedAuctionsList.length}
                </span>
              </div>
              <Link
                to="/marketplace/completed"
                className="text-zama-primary hover:text-zama-primary/80 text-sm font-semibold flex items-center gap-1 cursor-target"
              >
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {endedAuctionsList.slice(0, completedLimit).map((auctionAddress: string) => (
                <AuctionCardWrapper
                  key={auctionAddress}
                  auctionAddress={auctionAddress}
                  onClick={() => setSelectedAuctionAddress(auctionAddress)}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateAuctionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAuction}
        isPending={isCreating}
      />

      {selectedAuctionAddress && (
        <AuctionDetailModalWrapper
          auctionAddress={selectedAuctionAddress}
          onClose={() => setSelectedAuctionAddress(null)}
          onBidStatus={(status, message) => addToast(status === 'error' ? 'error' : status === 'success' ? 'success' : 'info', message)}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 sm:px-6 sm:py-4 rounded-lg flex items-start gap-2 sm:gap-3 backdrop-blur-sm border text-sm sm:text-base ${toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-300'
              : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                : 'bg-blue-500/20 border-blue-500/50 text-blue-300'
              }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Clock className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-opacity-60 hover:text-opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Floating Action Button for Creating Auction */}
      <FloatingFAB
        onClick={() => setShowCreateModal(true)}
        disabled={!isConnected}
      />
    </div>
  );
}
