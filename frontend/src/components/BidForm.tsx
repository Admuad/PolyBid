import { useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { useWriteContract, useAccount } from 'wagmi';
import { showErrorToast } from '@/lib/errorHandler';
import { AUCTION_ABI } from '@/config/contracts';
import { AUCTION_CONTRACT_ADDRESS } from '@/config/contracts';
import { initializeFHE, encryptBid } from '@/lib/fhe';
import { useAuctionOpeningPrice } from '@/hooks/useAuction';
import { formatEther } from 'viem';

interface BidFormProps {
  auctionAddress?: string;
  onSuccess: () => void;
  onBidStatus?: (status: 'pending' | 'success' | 'error', message: string) => void;
  onCancel?: () => void;
}

export function BidForm({ auctionAddress, onSuccess, onBidStatus, onCancel }: BidFormProps) {
  const [bidValue, setBidValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { writeContract, isPending } = useWriteContract();
  const { address, isConnected } = useAccount();
  const { openingPrice } = useAuctionOpeningPrice(auctionAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bidValue || parseFloat(bidValue) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    // Validate max 4 decimal places
    const decimalPlaces = bidValue.split('.')[1]?.length || 0;
    if (decimalPlaces > 4) {
      setError('Bid amount can have maximum 4 decimal places (e.g., 0.0001)');
      return;
    }

    // Validate against opening price
    if (openingPrice > 0) {
      const bidInEth = parseFloat(bidValue);
      const openingPriceInEth = parseFloat(formatEther(BigInt(openingPrice)));
      if (bidInEth < openingPriceInEth) {
        setError(`Bid must be at least ${openingPriceInEth} ETH (opening price)`);
        return;
      }
    }

    if (!isConnected || !address) {
      setError('Wallet not connected');
      onBidStatus?.('error', '❌ Please connect your wallet first');
      return;
    }

    try {
      setIsEncrypting(true);
      onBidStatus?.('pending', '🔐 Encrypting bid using FHE...');

      // Convert bid to wei
      const bidInWei = BigInt(Math.floor(parseFloat(bidValue) * 1e18));

      // Initialize FHE (SDK uses window.ethereum automatically)
      const fheInstance = await initializeFHE();

      if (!fheInstance) {
        throw new Error('Failed to initialize FHE SDK');
      }

      // Encrypt the bid using FHE
      console.log('Encrypting bid value:', bidValue, 'ETH');
      const encryptedData = await encryptBid(
        fheInstance,
        auctionAddress || AUCTION_CONTRACT_ADDRESS,
        address,
        bidInWei
      );

      if (!encryptedData) {
        throw new Error('Failed to encrypt bid');
      }
      console.log('Submitting encrypted bid to contract...');
      console.log('Auction address:', auctionAddress || AUCTION_CONTRACT_ADDRESS);
      console.log('User address:', address);
      // Convert proof Uint8Array to hex string for wagmi
      const proofHex = `0x${Array.from(encryptedData.proof).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;

      writeContract({
        address: (auctionAddress || AUCTION_CONTRACT_ADDRESS) as `0x${string}`,
        abi: AUCTION_ABI,
        functionName: 'submitBid',
        args: [encryptedData.handle as `0x${string}`, proofHex],
        value: bidInWei,
        // Increase gas limit for FHE operations (safe overestimate)
        gas: BigInt(3000000),
      },
        {
          onSuccess: (hash) => {
            console.log('Bid transaction sent:', hash);
            onBidStatus?.('success', '✅ Encrypted bid placed successfully! Waiting for confirmation...');
            setBidValue('');
            onSuccess();
          },
          onError: (err) => {
            showErrorToast(err, 'transaction');
            const errorMsg = err.message || 'Unknown error';
            onBidStatus?.('error', `❌ Bid failed: ${errorMsg}`);
            setError(`Transaction failed: ${errorMsg}`);
          },
        }
      );
    } catch (err) {
      setIsEncrypting(false);
      showErrorToast(err, 'fhe');
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Encryption failed: ${errorMsg}`);
      onBidStatus?.('error', `❌ Encryption failed: ${errorMsg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-zama space-y-4 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
        <Lock className="w-4 sm:w-5 h-4 sm:h-5 text-zama-primary flex-shrink-0" />
        <span className="truncate">Place Your Encrypted Bid</span>
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 sm:gap-3">
          <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-500 break-words">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm text-gray-400 mb-2">Bid Amount (ETH)</label>
        <input
          type="number"
          value={bidValue}
          onChange={(e) => {
            const val = e.target.value;
            // Validate max 4 decimal places
            if (val === '' || /^\d*\.?\d{0,4}$/.test(val)) {
              setBidValue(val);
            }
          }}
          placeholder="0.0001"
          step="0.0001"
          min="0"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-zama-primary"
          disabled={isPending || isEncrypting}
        />
        {openingPrice > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Minimum bid: {formatEther(BigInt(openingPrice))} ETH
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="submit"
          disabled={isPending || !bidValue || isEncrypting}
          className="flex-1 bg-zama-primary hover:bg-zama-primary/90 disabled:bg-gray-600 text-black font-semibold py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-target text-sm sm:text-base"
        >
          <Lock className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
          <span className="truncate">
            {isEncrypting ? 'Encrypting...' : isPending ? 'Submitting...' : 'Submit Bid'}
          </span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending || isEncrypting}
            className="sm:w-auto px-4 sm:px-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors cursor-target text-sm sm:text-base"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your bid is encrypted using Zama FHE before being sent to the blockchain
      </p>
    </form>
  );
}
