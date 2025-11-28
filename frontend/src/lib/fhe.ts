/**
 * FHE (Fully Homomorphic Encryption) Utilities
 * Handles encryption and decryption of auction bids using Zama's FHE SDK
 */

import { ethers } from 'ethers';
import { initSDK, createInstance } from '@zama-fhe/relayer-sdk/web';

// Type definitions for FHE instance
type FhevmInstance = any;

// Encrypted input types
export interface EncryptedBid {
  handle: string;
  proof: Uint8Array; // Keep as Uint8Array to match Zama SDK behavior
  value: bigint;
}

/**
 * Initialize FHE instance for the application
 * This must be called once before encrypting any data
 * Uses Zama's @zama-fhe/relayer-sdk v0.3.0-5 for production FHE encryption
 */
export async function initializeFHE(): Promise<FhevmInstance | null> {
  try {
    console.log('Initializing FHE SDK with Sepolia configuration...');

    // Initialize the fhEVM runtime
    await initSDK();

    // Manually define Sepolia configuration with correct addresses
    // The SDK's built-in config seems to be outdated or incorrect
    const CustomSepoliaConfig = {
      aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
      kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
      inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
      verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
      verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      chainId: 11155111,
      gatewayChainId: 10901,
      network: 'https://ethereum-sepolia-rpc.publicnode.com',
      relayerUrl: 'https://relayer.testnet.zama.org'
    };

    console.log('Using Custom SepoliaConfig:', JSON.stringify(CustomSepoliaConfig, null, 2));
    const instance = await createInstance(CustomSepoliaConfig);

    console.log('FHE SDK initialized successfully');
    return instance;
  } catch (error) {
    console.error('❌ FAILED TO INITIALIZE FHE SDK:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Fallback to mock for development/testing if SDK fails
    console.warn('⚠️ Falling back to MOCK FHE instance. Transactions WILL FAIL on chain.');
    return createMockFHEInstance();
  }
}

/**
 * Mock FHE instance for development fallback
 * Used when the real SDK is unavailable (e.g., during development)
 * WARNING: This should ONLY be used for testing, NOT production
 */
function createMockFHEInstance(): FhevmInstance {
  console.warn('⚠️  WARNING: Using mock FHE instance. This is NOT suitable for production.');
  return {
    createEncryptedInput: (_contractAddress: string, _userAddress: string) => ({
      add64: function (value: number | bigint) {
        (this as any)._value = BigInt(value);
        return this;
      },
      encrypt: async function () {
        console.log('Generating MOCK encrypted data...');
        // Generate random 32 bytes for handle
        const handle = new Uint8Array(32);
        crypto.getRandomValues(handle);

        // Generate random bytes for proof
        const proof = new Uint8Array(128);
        crypto.getRandomValues(proof);

        return {
          handles: [handle],
          inputProof: proof,
        };
      },
    }),
    getPublicKey: async (_contractAddress: string) => {
      // Mock public key for development
      return '0x' + Array(128).fill(0).map(() =>
        Math.floor(Math.random() * 16).toString(16)).join('');
    },
  };
}

/**
 * Convert Uint8Array to hex string
 */
function toHexString(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}



/**
 * Encrypt a bid value using FHE
 * @param instance FHEVM instance
 * @param contractAddress Contract address
 * @param userAddress User's wallet address
 * @param bidValue Bid amount in wei
 */
export async function encryptBid(
  instance: FhevmInstance | null,
  contractAddress: string,
  userAddress: string,
  bidValue: bigint
): Promise<EncryptedBid | null> {
  if (!instance) {
    console.error('FHE instance not initialized');
    return null;
  }

  try {
    // Canonicalize addresses to ensure checksum format matches what the contract expects
    const canonicalContractAddress = ethers.getAddress(contractAddress);
    const canonicalUserAddress = ethers.getAddress(userAddress);

    console.log('Canonical Contract:', canonicalContractAddress);
    console.log('Canonical User:', canonicalUserAddress);

    // Create encrypted input for the contract
    const input = instance.createEncryptedInput(canonicalContractAddress, canonicalUserAddress);

    // Add the bid value as euint64
    input.add64(bidValue);

    // Encrypt and get the handle + proof
    const encryptedData = await input.encrypt();
    const rawHandle = encryptedData.handles[0];

    let handleHex: string;
    if (rawHandle instanceof Uint8Array) {
      handleHex = toHexString(rawHandle);
    } else if (typeof rawHandle === 'string') {
      handleHex = rawHandle; // Already hex string
    } else {
      console.error('Unknown handle type:', typeof rawHandle, rawHandle);
      throw new Error('Invalid handle type returned from SDK');
    }

    console.log('Handle length:', handleHex.length, 'chars');
    console.log('Handle (hex):', handleHex);

    // Keep proof as Uint8Array - wagmi/viem will handle the encoding
    const proof = encryptedData.inputProof instanceof Uint8Array
      ? encryptedData.inputProof
      : new Uint8Array(0); // Fallback

    console.log('Proof length:', proof.length, 'bytes');

    return {
      handle: handleHex,
      proof: proof, // Return as Uint8Array
      value: bidValue,
    };
  } catch (error) {
    console.error('Failed to encrypt bid:', error);
    return null;
  }
}

/**
 * Encrypt a small value using euint8 for testing
 * @param instance FHEVM instance
 * @param contractAddress Contract address
 * @param userAddress User's wallet address
 * @param value Small number (1-255)
 */
export async function encryptSmallValue(
  instance: FhevmInstance | null,
  contractAddress: string,
  userAddress: string,
  value: number
): Promise<EncryptedBid | null> {
  if (!instance) {
    console.error('FHE instance not initialized');
    return null;
  }

  try {
    const canonicalContract = ethers.getAddress(contractAddress);
    const canonicalUser = ethers.getAddress(userAddress);

    console.log('Encrypting small value (euint8):', value);
    console.log('Contract:', canonicalContract);
    console.log('User:', canonicalUser);

    const input = instance.createEncryptedInput(canonicalContract, canonicalUser);

    // Use add8 for euint8 instead of add64
    input.add8(value);

    const encryptedData = await input.encrypt();
    const rawHandle = encryptedData.handles[0];

    let handleHex: string;
    if (rawHandle instanceof Uint8Array) {
      handleHex = toHexString(rawHandle);
    } else if (typeof rawHandle === 'string') {
      handleHex = rawHandle;
    } else {
      throw new Error('Invalid handle type');
    }

    const proof = encryptedData.inputProof instanceof Uint8Array
      ? encryptedData.inputProof
      : new Uint8Array(0);

    console.log('Handle:', handleHex);
    console.log('Proof length:', proof.length, 'bytes');

    return {
      handle: handleHex,
      proof: proof,
      value: BigInt(value),
    };
  } catch (error) {
    console.error('Failed to encrypt small value:', error);
    return null;
  }
}

/**
 * Get the public FHE key for a contract
 */
export async function getPublicKey(
  instance: FhevmInstance | null,
  contractAddress: string
): Promise<string | null> {
  if (!instance) {
    console.error('FHE instance not initialized');
    return null;
  }

  try {
    const publicKey = await instance.getPublicKey(contractAddress);
    return publicKey;
  } catch (error) {
    console.error('Failed to get public key:', error);
    return null;
  }
}

/**
 * Format encrypted data for display
 */
export function formatEncryptedData(data: string): string {
  if (!data || data.length < 10) return data;
  return `${data.slice(0, 6)}...${data.slice(-4)}`;
}

/**
 * Validate bid value
 */
export function validateBidValue(value: string): { valid: boolean; error?: string; parsed?: bigint } {
  try {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return { valid: false, error: 'Invalid number' };
    }

    if (numValue <= 0) {
      return { valid: false, error: 'Bid must be greater than 0' };
    }

    if (numValue > Number.MAX_SAFE_INTEGER) {
      return { valid: false, error: 'Bid value too large' };
    }

    // Convert to wei (assuming ETH input)
    const weiValue = BigInt(Math.floor(numValue * 1e18));

    return { valid: true, parsed: weiValue };
  } catch (error) {
    return { valid: false, error: 'Invalid input' };
  }
}


/**
 * Format wei to ETH
 */
export function formatWeiToEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(6);
}

/**
 * Format ETH to display
 */
export function formatEthDisplay(eth: string): string {
  const num = parseFloat(eth);
  if (isNaN(num)) return '0';
  return num.toFixed(4);
}

/**
 * Check if current user is the winner (returns decrypted boolean)
 * This function enables privacy-preserving winner reveal - only the caller learns their result!
 * 
 * @param instance - FhevmInstance from initializeFHE()
 * @param auctionAddress - Address of the auction contract
 * @param userAddress - Address of the user checking (usually connected wallet)
 * @param signer - Ethers signer (for EIP-712 signature)
 * @returns Promise<boolean> - true if winner, false if loser
 */
export async function checkIfWinner(
  instance: FhevmInstance,
  auctionAddress: string,
  userAddress: string,
  signer: any
): Promise<boolean> {
  try {
    console.log('Checking win status for:', userAddress, 'at auction:', auctionAddress);

    const auctionABI = [
      {
        inputs: [],
        name: 'amITheWinner',
        outputs: [{ internalType: 'ebool', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const contract = new ethers.Contract(auctionAddress, auctionABI, signer);

    console.log('Reading pre-computed win status...');
    const encryptedHandle = await contract.amITheWinner();
    console.log('Got encrypted handle:', encryptedHandle);

    if (encryptedHandle === 0n || encryptedHandle.toString() === '0') {
      console.warn('Encrypted handle is 0. Auction might not be closed yet.');
      throw new Error('Win status not available. Auction may not be closed.');
    }

    console.log('Requesting re-encryption from KMS...');
    const keypair = instance.generateKeypair();

    // Convert BigInt handle to hex string (0x-prefixed)
    const handleHex = '0x' + encryptedHandle.toString(16).padStart(64, '0');
    console.log('Converted handle to hex string:', handleHex);

    // Prepare handleContractPairs as per official Zama documentation
    const handleContractPairs = [
      {
        handle: handleHex,
        contractAddress: auctionAddress,
      },
    ];

    // Prepare timestamp and duration
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10'; // 10 days validity
    const contractAddresses = [auctionAddress];

    // Create EIP-712 signature request
    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    console.log('EIP-712 structure created');

    // Sign the EIP-712 message
    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );

    console.log('Calling userDecrypt with official API signature...');
    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );

    // The result is an object with handle as key
    const decryptedValue = result[handleHex];

    console.log('Decrypted win status value:', decryptedValue);

    const isWinner = decryptedValue === 1n || decryptedValue === true || decryptedValue === '1' || decryptedValue === 1;

    console.log(`Result: ${isWinner ? '🎉 Winner!' : '❌ Not winner'}`);
    return isWinner;
  } catch (error) {
    console.error('Failed to check winner status:', error);
    throw new Error(`Win status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
