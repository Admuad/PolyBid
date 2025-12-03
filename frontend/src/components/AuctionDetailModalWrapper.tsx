
import { useAuctionMetadata, useSpecificAuctionStatus, useSpecificAuctionBidders, useSpecificAuctionWinner, useSpecificHasSubmittedBid } from '@/hooks/useAuction';
import { useAccount } from 'wagmi';
import { AuctionDetailModal } from './AuctionDetailModal';

interface AuctionDetailModalWrapperProps {
    auctionAddress: string;
    onClose: () => void;
    onBidStatus?: (status: 'pending' | 'success' | 'error', message: string) => void;
}

export function AuctionDetailModalWrapper({ auctionAddress, onClose, onBidStatus }: AuctionDetailModalWrapperProps) {
    const metadata = useAuctionMetadata(auctionAddress);
    const status = useSpecificAuctionStatus(auctionAddress);
    const { bidderCount, refetch: refetchBidders } = useSpecificAuctionBidders(auctionAddress);
    const { winner } = useSpecificAuctionWinner(auctionAddress);
    const { address } = useAccount();
    const { hasBid, refetch: refetchHasBid } = useSpecificHasSubmittedBid(auctionAddress, address);

    const handleRefresh = () => {
        status.refetch();
        refetchBidders();
        refetchHasBid();
    };

    return (
        <AuctionDetailModal
            isOpen={true}
            onClose={onClose}
            auctionAddress={auctionAddress}
            itemName={metadata.itemName}
            description={metadata.description}
            creator={metadata.creator}
            isActive={status.isActive}
            auctionEnded={status.auctionEnded}
            endTime={status.endTime}
            bidderCount={bidderCount}
            winner={winner}
            hasBid={hasBid}
            imageDataUri={metadata.imageDataUri}
            onBidSuccess={handleRefresh}
            onBidStatus={onBidStatus}
        />
    );
}
