import React, { useState } from 'react';
import { useAllAuctions, useAuctionStatuses } from '@/hooks/useAuction';
import { AuctionGrid } from '@/components/AuctionGrid';
import { AuctionDetailModalWrapper } from '@/components/AuctionDetailModalWrapper';
import { Flame, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

export function CompletedAuctionsPage() {
    const { auctionAddresses } = useAllAuctions();
    const statuses = useAuctionStatuses(auctionAddresses);
    const [selectedAuctionAddress, setSelectedAuctionAddress] = useState<string | null>(null);
    const [toasts, setToasts] = useState<any[]>([]);

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Filter ended auctions
    const endedAuctions = auctionAddresses.filter(addr => {
        const status = statuses.get(addr);
        return status ? !status.isActive : false;
    });

    // Toast logic
    const addToast = (type: 'success' | 'error' | 'info' | 'pending', message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    return (
        <div className="min-h-screen bg-black">
            <AuctionGrid
                title="Completed Auctions"
                icon={<Flame className="w-6 h-6 text-orange-400" />}
                auctions={endedAuctions}
                onAuctionClick={setSelectedAuctionAddress}
                backLink="/marketplace"
                emptyMessage="No completed auctions found."
            />

            {selectedAuctionAddress && (
                <AuctionDetailModalWrapper
                    auctionAddress={selectedAuctionAddress}
                    onClose={() => setSelectedAuctionAddress(null)}
                    onBidStatus={(status, message) => addToast(status, message)}
                />
            )}

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`px-4 py-3 rounded-lg flex items-start gap-2 backdrop-blur-sm border text-sm ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-300' :
                            toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-300' :
                                'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5" />}
                        {toast.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5" />}
                        {toast.type === 'info' && <Clock className="w-4 h-4 mt-0.5" />}
                        <p className="flex-1">{toast.message}</p>
                        <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
                            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
