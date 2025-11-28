# Zama FHE Protocol Updates

This document outlines the updates made to align with **Zama's official FHE Solidity documentation** and best practices.

## 📚 Reference Documentation

The updates are based on the official Zama Protocol documentation:
- **Encrypted Inputs**: https://docs.zama.ai/protocol/solidity-guides/smart-contract/inputs
- **Operations on Encrypted Types**: https://docs.zama.ai/protocol/solidity-guides/smart-contract/operations
- **Casting and Trivial Encryption**: https://docs.zama.ai/protocol/solidity-guides/smart-contract/operations/casting
- **fhevmjs SDK**: npm package `@fhevm/sdk`

---

## 🔧 Smart Contract Updates

### File: `contracts/contracts/Auction.sol`

#### **Change 1: Function Signature for `submitBid`**

**Before:**
```solidity
function submitBid(bytes32 inputHandle, bytes calldata inputProof) external auctionActive {
    euint64 bid = FHE.fromExternal(externalEuint64.wrap(inputHandle), inputProof);
    // ...
}
```

**After:**
```solidity
function submitBid(externalEuint64 encryptedAmount, bytes calldata inputProof) external auctionActive {
    euint64 bid = FHE.fromExternal(encryptedAmount, inputProof);
    // ...
}
```

**Why:** 
- According to Zama docs, encrypted inputs should use the `externalEuintXX` type directly as a function parameter
- `FHE.fromExternal()` validates the encrypted input and converts it to `euintXX` type
- No need to manually wrap with `externalEuint64.wrap()`

#### **Change 2: Function Signature for `updateBid`**

**Before:**
```solidity
function updateBid(bytes32 inputHandle, bytes calldata inputProof) external auctionActive {
    euint64 newBid = FHE.fromExternal(externalEuint64.wrap(inputHandle), inputProof);
    // ...
}
```

**After:**
```solidity
function updateBid(externalEuint64 encryptedAmount, bytes calldata inputProof) external auctionActive {
    euint64 newBid = FHE.fromExternal(encryptedAmount, inputProof);
    // ...
}
```

**Why:** Same reasoning as `submitBid` - follows Zama's official pattern for encrypted inputs.

---

## 🎨 Frontend Updates

### File: `frontend/package.json`

#### **Change: Updated FHE SDK Package**

**Before:**
```json
"@fhevm/browser": "^0.1.0"
```

**After:**
```json
"@fhevm/sdk": "^0.7.0",
"ethers": "^6.13.0"
```

**Why:** 
- `@fhevm/sdk` is the official package for browser-based FHE operations
- Requires `ethers` v6 as a peer dependency

---

### File: `frontend/src/lib/fhe.ts`

#### **Complete Rewrite to Use Official SDK**

**Key Changes:**

1. **Import Official SDK:**
```typescript
import { initFhevm, createInstance, FhevmInstance } from '@fhevm/sdk';
```

2. **Proper Initialization:**
```typescript
export async function initializeFHE(provider: BrowserProvider): Promise<FhevmInstance | null> {
  await initFhevm();  // Initialize the FHEVM library
  
  const instance = await createInstance({
    provider,
    network: 11155111, // Sepolia chain ID
  });
  
  return instance;
}
```

3. **Correct Encryption Pattern:**
```typescript
export async function encryptBid(
  instance: FhevmInstance | null,
  contractAddress: string,
  userAddress: string,
  bidValue: bigint
): Promise<EncryptedBid | null> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(bidValue);  // Add as euint64
  
  const encryptedData = await input.encrypt();
  
  return {
    handle: encryptedData.handles[0],    // This is externalEuint64
    proof: encryptedData.inputProof,     // ZKPoK proof
    value: bidValue,
  };
}
```

4. **Removed Mock Implementation:**
- Replaced all mock code with real SDK integration
- Added proper error handling
- Added public key retrieval function

---

### File: `frontend/src/config/contracts.ts`

#### **Updated ABI to Match New Function Signatures**

**Before:**
```typescript
{
  inputs: [
    { internalType: 'bytes32', name: 'inputHandle', type: 'bytes32' },
    { internalType: 'bytes', name: 'inputProof', type: 'bytes' }
  ],
  name: 'submitBid',
  // ...
}
```

**After:**
```typescript
{
  inputs: [
    { internalType: 'externalEuint64', name: 'encryptedAmount', type: 'bytes32' },
    { internalType: 'bytes', name: 'inputProof', type: 'bytes' }
  ],
  name: 'submitBid',
  // ...
}
```

**Why:** ABI must match the updated Solidity function signatures.

---

## 📋 Required Actions

### 1. Install Updated Dependencies

```bash
cd frontend
npm install @fhevm/sdk@^0.7.0 ethers@^6.13.0
npm uninstall @fhevm/browser
```

### 2. Recompile Smart Contracts

```bash
cd contracts
npm run compile
```

This will generate the updated ABI with the correct function signatures.

### 3. Update Frontend ABI

After compilation, copy the new ABI from `contracts/artifacts/contracts/Auction.sol/Auction.json` to `frontend/src/config/contracts.ts`.

Or regenerate it using:
```bash
cd contracts
npx hardhat compile
# The ABI will be in artifacts/contracts/Auction.sol/Auction.json
```

---

## 🔑 Key Concepts from Zama Documentation

### 1. **Encrypted Inputs**

Encrypted inputs are values submitted by users in ciphertext form, accompanied by Zero-Knowledge Proofs of Knowledge (ZKPoKs).

**Parameters:**
- `externalEuintXX`: The encrypted input handle (index in the proof)
- `bytes`: Contains the ciphertext and ZKPoK

**Validation:**
```solidity
euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
```

### 2. **Creating Encrypted Inputs (Frontend)**

```typescript
const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
input.add64(bidValue);  // For euint64
input.add32(value32);   // For euint32
input.addBool(flag);    // For ebool

const encrypted = await input.encrypt();
// encrypted.handles[0] = externalEuint64 for first input
// encrypted.inputProof = ZKPoK proof
```

### 3. **Homomorphic Operations**

All operations remain the same:
```solidity
ebool isGreater = FHE.gt(bid, currentHighest);
currentHighest = FHE.select(isGreater, bid, currentHighest);
```

---

## ✅ Benefits of These Updates

1. **Standards Compliance**: Code now follows official Zama patterns
2. **Better Type Safety**: Using proper `externalEuintXX` types
3. **Cleaner Code**: No manual wrapping required
4. **Real FHE Integration**: Replaced mock implementation with actual SDK
5. **Production Ready**: Uses official, maintained packages
6. **Better Documentation**: Parameter names reflect their purpose (`encryptedAmount` vs `inputHandle`)

---

## 🚀 Next Steps

1. ✅ Smart contracts updated to use `externalEuint64` directly
2. ✅ Frontend updated to use `@fhevm/sdk`
3. ⏳ Install new dependencies: `npm install`
4. ⏳ Recompile contracts: `npm run compile`
5. ⏳ Update ABI in frontend config
6. ⏳ Test the complete flow on Sepolia

---

## 📝 Testing Checklist

After applying updates, verify:

- [ ] Smart contracts compile without errors
- [ ] Tests pass with new function signatures
- [ ] Frontend FHE initialization works
- [ ] Bid encryption produces valid `externalEuint64` handles
- [ ] Transaction submission succeeds on Sepolia
- [ ] Encrypted bids are stored correctly
- [ ] Auction closing works with homomorphic comparison
- [ ] Winner declaration functions properly

---

## 📖 Additional Resources

- **Zama Documentation**: https://docs.zama.ai/protocol
- **fhEVM GitHub**: https://github.com/zama-ai/fhevm-solidity
- **Example dApps**: https://github.com/zama-ai/fhevm-hardhat-template
- **Community Support**: https://community.zama.org

---

**Last Updated**: Based on Protocol.pdf and official Zama documentation
**Version**: Aligned with `@fhevm/sdk` v0.7.0 and fhevm-solidity v0.9.0
