import React from 'react';
import { useAuctionMetadata, useSpecificAuctionStatus, useSpecificAuctionBidders } from '@/hooks/useAuction';
import { AuctionCard } from './AuctionCard';

interface AuctionCardWrapperProps {
    auctionAddress: string;
    onClick: () => void;
    isFeatured?: boolean;
    isTrending?: boolean;
    searchQuery?: string;
}

export function AuctionCardWrapper({
    auctionAddress,
    onClick,
    isFeatured = false,
    isTrending = false,
    searchQuery = ''
}: AuctionCardWrapperProps) {
    const metadata = useAuctionMetadata(auctionAddress);
    const status = useSpecificAuctionStatus(auctionAddress);
    const { bidderCount } = useSpecificAuctionBidders(auctionAddress);

    // Filter by search query
    if (searchQuery && metadata.itemName) {
        const query = searchQuery.toLowerCase();
        const name = metadata.itemName.toLowerCase();
        const description = metadata.description.toLowerCase();
        if (!name.includes(query) && !description.includes(query)) {
            return null;
        }
    }

    if (!metadata.itemName) {
        // If searching, don't show loading skeletons that might not match
        if (searchQuery) return null;

        return (
            <div className="card-zama animate-pulse">
                <div className="h-32 bg-gray-700 rounded-lg mb-4" />
                <div className="h-6 bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-700 rounded" />
            </div>
        );
    }

    return (
        <AuctionCard
            auctionAddress={auctionAddress}
            itemName={metadata.itemName}
            description={metadata.description}
            creator={metadata.creator}
            endTime={status.endTime}
            bidderCount={bidderCount}
            isActive={status.isActive}
            imageDataUri={metadata.imageDataUri}
            isFeatured={isFeatured}
            isTrending={isTrending}
            onClick={onClick}
        />
    );
}
