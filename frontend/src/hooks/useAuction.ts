import { useReadContract, useWriteContract, useWatchContractEvent, useReadContracts } from 'wagmi';
import { parseEther } from 'viem';
import { useState, useEffect } from 'react';
import { AUCTION_CONTRACT_ADDRESS, AUCTION_ABI, AUCTION_FACTORY_ADDRESS, AUCTION_FACTORY_ABI } from '@/config/contracts';

export function useAuctionStatus() {
  const { data: isActive, refetch: refetchActive } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'isAuctionActive',
  });

  const { data: auctionStarted } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'auctionStarted',
  });

  const { data: auctionEnded } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'auctionEnded',
  });

  const { data: endTime } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'auctionEndTime',
  });

  const { data: timeRemaining, refetch: refetchTime } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getTimeRemaining',
  });

  return {
    isActive: Boolean(isActive),
    auctionStarted: Boolean(auctionStarted),
    auctionEnded: Boolean(auctionEnded),
    endTime: endTime ? Number(endTime) : 0,
    timeRemaining: timeRemaining ? Number(timeRemaining) : 0,
    refetch: () => {
      refetchActive();
      refetchTime();
    },
  };
}

export function useAuctionBidders() {
  const { data: bidderCount, refetch } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getBidderCount',
  });

  return {
    bidderCount: bidderCount ? Number(bidderCount) : 0,
    refetch,
  };
}

export function useHasSubmittedBid(address?: string) {
  const { data: hasBid, refetch } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'hasSubmittedBid',
    args: address ? [address as `0x${string}`] : undefined,
  });

  return {
    hasBid: Boolean(hasBid),
    refetch,
  };
}

export function useAuctionWinner() {
  const { data: winner } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getWinner',
  });

  return {
    winner: winner as string | undefined,
  };
}

export function useSubmitBid() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const submitBid = (handle: string, proof: string) => {
    writeContract({
      address: AUCTION_CONTRACT_ADDRESS,
      abi: AUCTION_ABI,
      functionName: 'submitBid',
      args: [handle as `0x${string}`, proof as `0x${string}`],
    });
  };

  return {
    submitBid,
    isPending,
    isSuccess,
    error,
  };
}

export function useInitializeAuction() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const initializeAuction = async (durationInSeconds: number) => {
    try {
      writeContract({
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'initializeAuction',
        args: [BigInt(durationInSeconds), BigInt(0)],
      });
    } catch (err) {
      console.error('Failed to initialize auction:', err);
      throw err;
    }
  };

  return {
    initializeAuction,
    isPending,
    isSuccess,
    error,
  };
}

export function useAuctionEvents() {
  const [events, setEvents] = useState<any[]>([]);

  useWatchContractEvent({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    eventName: 'BidSubmitted',
    onLogs(logs) {
      setEvents((prev) => [...prev, ...logs]);
    },
  });

  useWatchContractEvent({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    eventName: 'AuctionClosed',
    onLogs(logs) {
      setEvents((prev) => [...prev, ...logs]);
    },
  });

  return { events };
}

// ============= FACTORY HOOKS =============

export function useAllAuctions() {
  const { data: auctionAddresses, refetch } = useReadContract({
    address: AUCTION_FACTORY_ADDRESS,
    abi: AUCTION_FACTORY_ABI,
    functionName: 'getAllAuctions',
  });

  return {
    auctionAddresses: (auctionAddresses as string[]) || [],
    refetch,
  };
}

// Hook to get auctions created by a user
export function useMyAuctions(userAddress?: string) {
  const { data: myAuctions } = useReadContract({
    address: AUCTION_FACTORY_ADDRESS,
    abi: AUCTION_FACTORY_ABI,
    functionName: 'getAuctionsByCreator',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  });

  return {
    auctionAddresses: (myAuctions as string[]) || [],
  };
}

export function useAuctionMetadata(auctionAddress?: string) {
  const { data: metadata } = useReadContract({
    address: AUCTION_FACTORY_ADDRESS,
    abi: AUCTION_FACTORY_ABI,
    functionName: 'getAuctionMetadata',
    args: auctionAddress ? [auctionAddress as `0x${string}`] : undefined,
  });

  if (!metadata) {
    return {
      creator: '',
      itemName: '',
      description: '',
      imageDataUri: '',
      createdAt: 0,
      duration: 0,
    };
  }

  const [creator, itemName, description, imageDataUri, createdAt, duration] = metadata as [string, string, string, string, bigint, bigint];

  // Convert IPFS hash to gateway URL if it's an IPFS hash
  let imageUrl = imageDataUri;
  if (imageDataUri && imageDataUri.startsWith('Qm')) {
    // It's an IPFS hash, convert to gateway URL
    imageUrl = `https://gateway.pinata.cloud/ipfs/${imageDataUri}`;
  }

  return {
    creator,
    itemName,
    description,
    imageDataUri: imageUrl,
    createdAt: Number(createdAt),
    duration: Number(duration),
  };
}

export function useCreateAuction() {
  const { writeContract, isPending, isSuccess, error, data } = useWriteContract();

  const createAuction = (itemName: string, description: string, durationInSeconds: number, openingPrice: string, imageDataUri?: string) => {
    console.log('useCreateAuction: Creating auction with:');
    console.log('  Factory Address:', AUCTION_FACTORY_ADDRESS);
    console.log('  ItemName:', itemName);
    console.log('  Description:', description);
    console.log('  Image Data:', imageDataUri ? 'provided' : 'not provided');
    console.log('  Duration (seconds):', durationInSeconds);
    console.log('  Opening Price:', openingPrice);

    const openingPriceWei = openingPrice && parseFloat(openingPrice) > 0
      ? parseEther(openingPrice)
      : BigInt(0);

    try {
      writeContract(
        {
          address: AUCTION_FACTORY_ADDRESS,
          abi: AUCTION_FACTORY_ABI,
          functionName: 'createAuction',
          args: [itemName, description, imageDataUri || '', BigInt(durationInSeconds), openingPriceWei],
          value: parseEther('0.0001'), // Close reward for auction closer
        },
        {
          onSuccess: (hash) => {
            console.log('Transaction sent successfully! Hash:', hash);
          },
          onError: (err) => {
            console.error('Transaction failed:', err);
          },
        }
      );
    } catch (err) {
      console.error('Error calling writeContract:', err);
    }
  };

  console.log('useCreateAuction hook state - isPending:', isPending, 'isSuccess:', isSuccess, 'error:', error);

  return {
    createAuction,
    isPending,
    isSuccess,
    error,
    hash: data,
  };
}

// Auction-specific hooks (for individual auction contracts)
export function useSpecificAuctionStatus(auctionAddress?: string) {
  const { data: isActive, refetch: refetchActive } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'isAuctionActive',
  });

  const { data: auctionStarted } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'auctionStarted',
  });

  const { data: auctionEnded } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'auctionEnded',
  });

  const { data: endTime } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'auctionEndTime',
  });

  const { data: bidderCount } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'getBidderCount',
  });

  const { data: timeRemaining } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'getTimeRemaining',
  });

  return {
    isActive: Boolean(isActive),
    auctionStarted: Boolean(auctionStarted),
    auctionEnded: Boolean(auctionEnded),
    hasEnded: Boolean(auctionEnded),
    endTime: endTime ? Number(endTime) : 0,
    bidderCount: bidderCount ? Number(bidderCount) : 0,
    timeRemaining: timeRemaining ? Number(timeRemaining) : 0,
    refetch: refetchActive,
  };
}

export function useSpecificAuctionBidders(auctionAddress?: string) {
  const { data: bidderCount, refetch } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'getBidderCount',
  });

  return {
    bidderCount: bidderCount ? Number(bidderCount) : 0,
    refetch,
  };
}

export function useSpecificAuctionWinner(auctionAddress?: string) {
  const { data: winner } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'getWinner',
  });

  return {
    winner: winner as string | undefined,
  };
}

export function useSpecificHasSubmittedBid(auctionAddress?: string, userAddress?: string) {
  const { data: hasBid, refetch } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'hasSubmittedBid',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  });

  return {
    hasBid: Boolean(hasBid),
    refetch,
  };
}
// Hook to get opening price for an auction
export function useAuctionOpeningPrice(auctionAddress?: string) {
  const { data: openingPrice } = useReadContract({
    address: auctionAddress as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'openingPrice',
  });

  return {
    openingPrice: openingPrice ? Number(openingPrice) : 0,
  };
}

// Hook to close auction (seller action)
export function useCloseAuction() {
  const { writeContract, isPending, error } = useWriteContract();

  const closeAuction = async (auctionAddress: string) => {
    writeContract({
      address: auctionAddress as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: 'closeAuction',
      gas: BigInt(3000000),
    });
  };

  return {
    closeAuction,
    isPending,
    error,
  };
}

// Hook to withdraw refund (buyer action)
export function useWithdrawRefund() {
  const { writeContract, isPending, error } = useWriteContract();

  const withdrawRefund = async (auctionAddress: string) => {
    writeContract({
      address: auctionAddress as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: 'withdrawRefund',
      gas: BigInt(3000000),
    });
  };

  return {
    withdrawRefund,
    isPending,
    error,
  };
}

// Hook to get statuses for multiple auctions at once
export function useAuctionStatuses(auctionAddresses: string[]) {
  const [statuses, setStatuses] = useState<Map<string, any>>(new Map());

  // Create contracts config for batch reading
  const contracts = auctionAddresses.flatMap(address => [
    {
      address: address as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: 'isAuctionActive' as const,
    },
    {
      address: address as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: 'getBidderCount' as const,
    },
    {
      address: address as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: 'getTimeRemaining' as const,
    },
    {
      address: address as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: 'getWinner' as const,
    },
    {
      address: address as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: 'auctionEnded' as const,
    },
  ]);

  const { data } = useReadContracts({ contracts });

  useEffect(() => {
    if (!data) return;

    const newStatuses = new Map();
    auctionAddresses.forEach((address, index) => {
      const baseIndex = index * 5;
      newStatuses.set(address, {
        isActive: Boolean(data[baseIndex]?.result),
        bidderCount: data[baseIndex + 1]?.result ? Number(data[baseIndex + 1].result) : 0,
        timeRemaining: data[baseIndex + 2]?.result ? Number(data[baseIndex + 2].result) : 0,
        winner: data[baseIndex + 3]?.result as string | undefined,
        hasEnded: Boolean(data[baseIndex + 4]?.result),
      });
    });
    setStatuses(newStatuses);
  }, [data, auctionAddresses]);

  return statuses;
}

// Hook to check if user has participated in auctions
export function useUserParticipation(userAddress: string | undefined, auctionAddresses: string[]) {
  const [participation, setParticipation] = useState<Map<string, boolean>>(new Map());

  const contracts = auctionAddresses.map(address => ({
    address: address as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'hasSubmittedBid' as const,
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  }));

  const { data } = useReadContracts({ contracts });

  useEffect(() => {
    if (!data) return;

    const newParticipation = new Map();
    auctionAddresses.forEach((address, index) => {
      newParticipation.set(address, Boolean(data[index]?.result));
    });
    setParticipation(newParticipation);
  }, [data, auctionAddresses]);

  return participation;
}




