import { useState, useRef, useEffect } from 'react';
import { X, Plus, Clock, FileText, Package, Image, Upload } from 'lucide-react';
import gsap from 'gsap';
import { useScrollableContainer } from '@/hooks/useScrollableContainer';
import { createPreviewDataURI, uploadImageToIPFS, compressImageForIPFS } from '@/lib/ipfs';
import { showErrorToast } from '@/lib/errorHandler';

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemName: string, description: string, duration: number, openingPrice: string, ipfsHash?: string) => void;
  isPending?: boolean;
}

export function CreateAuctionModal({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: CreateAuctionModalProps) {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [durationValue, setDurationValue] = useState<number | ''>('');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [openingPrice, setOpeningPrice] = useState<string>(''); // Opening price in ETH

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ipfsHash, setIPFSHash] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useScrollableContainer();

  // Modal entrance animation and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Disable Lenis scroll and lock overflow
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

      // Try to disable Lenis if it exists globally
      if (typeof window !== 'undefined' && (window as any).lenisInstance) {
        (window as any).lenisInstance.stop();
      }

      if (modalRef.current && overlayRef.current) {
        const tl = gsap.timeline();

        // Overlay fade in
        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 }
        );

        // Modal slide up and scale
        tl.fromTo(
          modalRef.current,
          {
            y: 50,
            scale: 0.9,
            opacity: 0,
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: 'back.out(1.7)',
          },
          '-=0.1'
        );
      }
    } else {
      // Unlock body and html scroll - ensure full restoration
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';

      // Re-enable Lenis if it exists globally
      if (typeof window !== 'undefined' && (window as any).lenisInstance) {
        (window as any).lenisInstance.start();
      }
    }

    // Cleanup: restore scroll when component unmounts
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
    // Don't close if form is being submitted
    if (isPending) return;

    if (modalRef.current && overlayRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          // Restore scroll BEFORE calling onClose
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.documentElement.style.overflow = '';
          document.documentElement.style.paddingRight = '';

          // Re-enable Lenis
          if (typeof window !== 'undefined' && (window as any).lenisInstance) {
            (window as any).lenisInstance.start();
          }

          onClose();
          // Reset form
          setItemName('');
          setDescription('');
          setDurationValue('');
          setDurationUnit('minutes');
          setOpeningPrice('');

          setImagePreview(null);
        },
      });

      tl.to(modalRef.current, {
        y: 50,
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });

      tl.to(
        overlayRef.current,
        { opacity: 0, duration: 0.2 },
        '-=0.1'
      );
    } else {
      // Fallback if refs not available
      onClose();
      setItemName('');
      setDescription('');
      setDurationValue(30);
      setDurationUnit('minutes');
      setOpeningPrice('');

      setImagePreview(null);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB original)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }



    try {
      // Create preview from original file
      const preview = await createPreviewDataURI(file);
      setImagePreview(preview);

      // Compress and upload to IPFS in background
      setIsUploadingImage(true);
      const compressedBlob = await compressImageForIPFS(file);
      const tempFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

      // Upload to IPFS (this would be real in production with Pinata API key)
      const hash = await uploadImageToIPFS(tempFile);
      setIPFSHash(hash);
      setIsUploadingImage(false);
    } catch (error) {
      showErrorToast(error, 'transaction');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('Pinata') || errorMsg.includes('not configured')) {
        alert('⚠️ Image upload failed: Please check your Pinata API keys in .env.local\n\nYou can still create the auction without an image.');
      } else {
        alert('Failed to process image. Try a different file.');
      }
      // Don't clear the image preview on Pinata key error - let user retry
      setImagePreview(null);
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {

    setImagePreview(null);
    setIPFSHash('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = itemName.trim();
    const trimmedDesc = description.trim();

    // Ensure duration has a valid value
    const finalDurationValue = durationValue === '' ? 0 : durationValue;

    if (trimmedName && trimmedDesc && finalDurationValue > 0) {
      // Convert duration to seconds based on selected unit
      let durationSeconds = finalDurationValue;
      if (durationUnit === 'minutes') {
        durationSeconds = finalDurationValue * 60;
      } else if (durationUnit === 'hours') {
        durationSeconds = finalDurationValue * 60 * 60;
      } else if (durationUnit === 'days') {
        durationSeconds = finalDurationValue * 24 * 60 * 60;
      }

      onSubmit(trimmedName, trimmedDesc, durationSeconds, openingPrice, ipfsHash || undefined);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-gradient-to-br from-gray-900 to-black border border-zama-primary/30 rounded-2xl shadow-2xl max-w-2xl w-full h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-black border-b border-gray-700 p-6 flex items-center justify-between z-20">
          <h2 className="text-2xl font-bold text-gradient-zama flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Create New Auction
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors cursor-target"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-hide p-6 pointer-events-auto"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', minHeight: '0' }}
          data-lenis-prevent
        >
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-zama-primary" />
                Item Name
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Rare Digital Art NFT"
                className="w-full px-4 py-3 bg-black/50 border border-zama-primary/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zama-primary focus:ring-2 focus:ring-zama-primary/20 transition-all"
                required
                disabled={isPending}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{itemName.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-zama-primary" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                rows={4}
                className="w-full px-4 py-3 bg-black/50 border border-zama-primary/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zama-primary focus:ring-2 focus:ring-zama-primary/20 transition-all resize-none"
                required
                disabled={isPending}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Image className="w-4 h-4 text-zama-primary" />
                Auction Image (Optional - Stored on IPFS)
              </label>
              <p className="text-xs text-gray-500 mb-3">Images are uploaded to IPFS (like OpenSea uses). This keeps blockchain transactions small and efficient.</p>

              {isUploadingImage && (
                <div className="mb-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-xs">
                  ⏳ Uploading image to IPFS...
                </div>
              )}

              {!imagePreview ? (
                <div
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  className={`w-full h-40 border-2 border-dashed border-zama-primary/30 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer cursor-target hover:border-zama-primary/60 hover:bg-zama-primary/5 transition-all ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-8 h-8 text-zama-primary/50" />
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF - auto-uploaded to IPFS</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-40 border border-zama-primary/30 rounded-lg overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3 py-2 bg-zama-primary hover:bg-zama-primary/80 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors cursor-target"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isUploadingImage}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors cursor-target"
                    >
                      Remove
                    </button>
                  </div>
                  {ipfsHash && !isUploadingImage && (
                    <div className="absolute bottom-2 left-2 bg-green-500/20 border border-green-500/50 rounded px-2 py-1 text-xs text-green-300">
                      ✓ IPFS Ready
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isPending || isUploadingImage}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-zama-primary" />
                Auction Duration
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={durationValue}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value));
                    setDurationValue(val === '' ? '' : Number(val));
                  }}
                  placeholder="Enter duration"
                  min="1"
                  className="flex-1 px-4 py-3 bg-black/50 border border-zama-primary/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zama-primary focus:ring-2 focus:ring-zama-primary/20 transition-all"
                  required
                  disabled={isPending}
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                  className="px-4 py-3 bg-black/50 border border-zama-primary/30 rounded-lg text-white focus:outline-none focus:border-zama-primary focus:ring-2 focus:ring-zama-primary/20 transition-all cursor-pointer cursor-target"
                  disabled={isPending}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {durationValue === '' ? (
                  <span className="italic">Please enter a duration</span>
                ) : (
                  <>
                    Auction will run for {durationValue} {durationUnit === 'minutes' ? 'minute' : durationUnit === 'hours' ? 'hour' : 'day'}{durationValue !== 1 ? 's' : ''}
                    {durationUnit === 'minutes' && durationValue >= 60 && ` (${Math.floor(durationValue / 60)}h ${durationValue % 60}m)`}
                  </>
                )}
              </p>
            </div>

            {/* Opening Price (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-zama-primary" />
                Opening Price (Optional)
              </label>
              <input
                type="number"
                value={openingPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  // Validate max 4 decimal places
                  if (val === '' || /^\d*\.?\d{0,4}$/.test(val)) {
                    setOpeningPrice(val);
                  }
                }}
                placeholder="0.0000"
                step="0.0001"
                min="0"
                className="w-full px-4 py-3 bg-black/50 border border-zama-primary/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zama-primary focus:ring-2 focus:ring-zama-primary/20 transition-all"
                disabled={isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                {openingPrice ? `Minimum bid: ${openingPrice} ETH` : 'Leave empty for no minimum bid'}
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-zama-primary/10 border border-zama-primary/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <span className="text-zama-primary font-semibold">Note:</span> A new PolyBid contract will be deployed.
                All bids will be encrypted using FHE for complete privacy.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-target"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isUploadingImage || !itemName.trim() || !description.trim()}
                className="flex-1 btn-zama disabled:opacity-50 disabled:cursor-not-allowed cursor-target"
              >
                {isPending ? 'Creating...' : isUploadingImage ? 'Uploading Image...' : 'Create Auction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

