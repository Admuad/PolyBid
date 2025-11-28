/**
 * IPFS/Pinata Upload Utility
 * Follows OpenSea's approach: store images off-chain on IPFS
 * This prevents oversized transaction errors
 */

// Using a public IPFS gateway approach (no API keys required for basic usage)
// For production, use: https://docs.pinata.cloud/api-documentation/api-keys

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const IPFS_UPLOAD_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Upload image to IPFS via Pinata API
 * Returns IPFS hash for storing on-chain
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    const pinataJwt = import.meta.env.VITE_PINATA_JWT_TOKEN;
    
    if (!pinataJwt) {
      console.warn('⚠️ Pinata JWT token not configured in .env.local. Images will not be uploaded.');
      console.warn('Please add VITE_PINATA_JWT_TOKEN to your .env.local file.');
      throw new Error('Pinata API keys not configured');
    }
    
    console.log('📤 Uploading image to IPFS via Pinata:', file.name, file.size);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Use nativeFetch if available (protected against wallet extensions), fall back to fetch
    const fetchFn = (window as any).nativeFetch || fetch;
    
    // Upload to Pinata
    const response = await fetchFn(IPFS_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata upload failed:', error);
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    
    console.log('✅ Image uploaded to IPFS successfully:', ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error('❌ IPFS upload error:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL from hash
 * Format: ipfs://QmXxx or https://gateway.pinata.cloud/ipfs/QmXxx
 */
export function getIPFSUrl(ipfsHash: string): string {
  if (!ipfsHash) return '';
  
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '');
  
  // Return gateway URL for display
  return `${IPFS_GATEWAY}${hash}`;
}

/**
 * Validate and compress image before upload
 */
export async function compressImageForIPFS(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down to max 1000x1000 for IPFS
        const maxSize = 1000;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with JPEG quality 0.8 (80%)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Create a data URI for local preview (not for on-chain storage)
 */
export async function createPreviewDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Parse IPFS URL/hash
 */
export function parseIPFSHash(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  if (url.includes('gateway.pinata.cloud/ipfs/')) {
    return url.split('gateway.pinata.cloud/ipfs/')[1];
  }
  return url;
}
