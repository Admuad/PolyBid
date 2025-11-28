import { History, Lock, User, Gavel, Package } from 'lucide-react';
import { useEffect } from 'react';
import { useAllAuctions, useAuctionStatuses } from '@/hooks/useAuction';
import DotGrid from '@/components/DotGrid';
import { AuctionCardWrapper } from '@/components/AuctionCardWrapper';
import CountUp from '@/components/CountUp';

export function BidHistory() {
  const { auctionAddresses } = useAllAuctions();
  const statuses = useAuctionStatuses(auctionAddresses);

  // Calculate global stats
  const totalAuctions = auctionAddresses.length;
  let totalBids = 0;
  const activeAuctions: string[] = [];

  auctionAddresses.forEach(addr => {
    const status = statuses.get(addr);
    if (status) {
      totalBids += status.bidderCount;
      if (status.isActive) {
        activeAuctions.push(addr);
      }
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-8 relative">
      {/* Full-page DotGrid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
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

      {/* Content with relative positioning */}
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-zama flex items-center justify-center mx-auto">
                <History className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gradient-zama">
              Platform Activity
            </h1>
            <p className="text-xl text-gray-300">
              Global statistics and active bidding across the platform
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            <div className="card-zama text-center">
              <User className="w-8 h-8 text-zama-primary mx-auto mb-2" />
              <p className="text-sm text-gray-400">Total Bids Placed</p>
              <p className="text-3xl font-bold text-white mt-1">
                <CountUp to={totalBids} duration={1.5} separator="," />
              </p>
            </div>

            <div className="card-zama text-center">
              <Package className="w-8 h-8 text-zama-primary mx-auto mb-2" />
              <p className="text-sm text-gray-400">Total Auctions</p>
              <p className="text-3xl font-bold text-white mt-1">
                <CountUp to={totalAuctions} duration={1.5} separator="," />
              </p>
            </div>

            <div className="card-zama text-center">
              <Gavel className="w-8 h-8 text-zama-primary mx-auto mb-2" />
              <p className="text-sm text-gray-400">Active Now</p>
              <p className="text-3xl font-bold text-white mt-1">
                <CountUp to={activeAuctions.length} duration={1.5} separator="," />
              </p>
            </div>
          </div>

          {/* Active Auctions List */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Lock className="w-6 h-6 text-zama-primary" />
              <h2 className="text-2xl font-bold text-white">Active Auctions & Bids</h2>
            </div>

            {activeAuctions.length === 0 ? (
              <div className="text-center py-16 card-zama border-dashed border-gray-800">
                <Gavel className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Active Auctions</h3>
                <p className="text-gray-500">There are currently no active auctions to bid on.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAuctions.map((auctionAddress) => (
                  <AuctionCardWrapper
                    key={auctionAddress}
                    auctionAddress={auctionAddress}
                    onClick={() => { }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="max-w-5xl mx-auto mt-12">
            <div className="card-zama bg-zama-primary/5 border-zama-primary/30">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-zama-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-2">Privacy Guaranteed</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    All bid amounts are encrypted using <span className="text-zama-primary font-semibold">Fully Homomorphic Encryption (FHE)</span>.
                    The "Total Bids" count is visible, but the individual bid amounts remain completely hidden from everyone, including the platform.
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