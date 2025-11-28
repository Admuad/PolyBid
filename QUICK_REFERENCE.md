# 🚀 Quick Reference Card - Zama FHE Auction

## 📋 TL;DR

**What Changed**: Updated to official Zama FHE patterns  
**Why**: To match Protocol.pdf and production standards  
**Status**: ✅ Ready to test and deploy  

---

## ⚡ Quick Commands

### Windows (PowerShell)
```powershell
# Run migration (all-in-one)
.\scripts\migrate-to-zama.ps1

# Manual steps
cd contracts; npm install; npm run compile; npm run test
cd ../frontend; npm install @fhevm/sdk@^0.7.0 ethers@^6.13.0
```

### Linux/Mac (Bash)
```bash
# Run migration (all-in-one)
chmod +x scripts/migrate-to-zama.sh
./scripts/migrate-to-zama.sh

# Manual steps
cd contracts && npm install && npm run compile && npm run test
cd ../frontend && npm install @fhevm/sdk@^0.7.0 ethers@^6.13.0
```

---

## 🔧 Key Code Changes

### Smart Contract (Solidity)

```solidity
// ❌ OLD - Don't use
function submitBid(bytes32 inputHandle, bytes calldata inputProof) {
    euint64 bid = FHE.fromExternal(externalEuint64.wrap(inputHandle), inputProof);
}

// ✅ NEW - Use this
function submitBid(externalEuint64 encryptedAmount, bytes calldata inputProof) {
    euint64 bid = FHE.fromExternal(encryptedAmount, inputProof);
}
```

### Frontend (TypeScript)

```typescript
// ❌ OLD - Mock implementation
import { BrowserProvider } from 'ethers';
// ... mock code

// ✅ NEW - Real SDK
import { initFhevm, createInstance, FhevmInstance } from '@fhevm/sdk';

// Initialize
await initFhevm();
const instance = await createInstance({ provider, network: 11155111 });

// Encrypt
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(bidValue);
const encrypted = await input.encrypt();

// Submit
await contract.submitBid(encrypted.handles[0], encrypted.inputProof);
```

---

## 📦 Package Updates

```json
// ❌ Remove
"@fhevm/browser": "^0.1.0"

// ✅ Add
"@fhevm/sdk": "^0.7.0",
"ethers": "^6.13.0"
```

---

## 📂 Files Modified

| File | Change | Status |
|------|--------|--------|
| `contracts/contracts/Auction.sol` | Updated function signatures | ✅ Done |
| `frontend/package.json` | New SDK dependencies | ✅ Done |
| `frontend/src/lib/fhe.ts` | Real FHE implementation | ✅ Done |
| `frontend/src/config/contracts.ts` | Updated ABI | ⏳ After compile |

---

## 📚 New Documentation

| File | Purpose |
|------|---------|
| `SUMMARY.md` | Overview of all changes |
| `ZAMA_UPDATES.md` | Detailed technical explanation |
| `docs/MIGRATION_DIAGRAM.md` | Visual flow diagrams |
| `QUICK_REFERENCE.md` | This file - quick lookup |
| `scripts/migrate-to-zama.ps1` | Windows migration script |
| `scripts/migrate-to-zama.sh` | Linux/Mac migration script |

---

## 🎯 Next Steps (In Order)

1. **Run Migration Script** ⏱️ 2-3 minutes
   ```bash
   .\scripts\migrate-to-zama.ps1  # Windows
   ./scripts/migrate-to-zama.sh   # Linux/Mac
   ```

2. **Verify Compilation** ⏱️ 1 minute
   ```bash
   cd contracts && npm run compile
   ```

3. **Extract New ABI** ⏱️ 1 minute
   - Location: `contracts/artifacts/contracts/Auction.sol/Auction.json`
   - Copy `abi` field to `frontend/src/config/contracts.ts`

4. **Test Frontend** ⏱️ 1 minute
   ```bash
   cd frontend && npm run dev
   ```

5. **Deploy to Sepolia** ⏱️ 2-3 minutes
   ```bash
   cd contracts && npm run deploy:sepolia
   ```

**Total Time**: ~10 minutes

---

## 🔍 Troubleshooting

### Issue: "Cannot find module '@fhevm/sdk'"
**Solution**: 
```bash
cd frontend
npm install @fhevm/sdk@^0.7.0 ethers@^6.13.0
```

### Issue: "Function signature mismatch"
**Solution**: Recompile contracts and update ABI
```bash
cd contracts && npm run compile
# Copy new ABI to frontend/src/config/contracts.ts
```

### Issue: "Encryption fails"
**Solution**: Ensure FHE is initialized before encrypting
```typescript
const instance = await initializeFHE(provider);
if (!instance) throw new Error('FHE not initialized');
```

### Issue: "Transaction reverts"
**Solution**: Check that encrypted input matches contract expectations
- Handle must be from `encrypted.handles[0]`
- Proof must be from `encrypted.inputProof`

---

## 🧪 Testing Checklist

Quick validation before deployment:

```bash
# 1. Contracts compile
cd contracts && npm run compile
# Expected: ✅ Compiled successfully

# 2. Tests pass
npm run test
# Expected: ✅ All tests passing

# 3. Frontend builds
cd ../frontend && npm run build
# Expected: ✅ Build successful

# 4. Types check
npm run build
# Expected: ✅ No TypeScript errors
```

---

## 📖 Official Resources

- **Zama Docs**: https://docs.zama.ai/protocol
- **SDK Docs**: https://docs.zama.ai/protocol/solidity-guides
- **GitHub**: https://github.com/zama-ai/fhevm-solidity
- **Community**: https://community.zama.org

---

## 💡 Pro Tips

1. **Always initialize FHE first**
   ```typescript
   await initFhevm();  // Must be called once
   const instance = await createInstance({ ... });
   ```

2. **Use correct network ID**
   ```typescript
   network: 11155111  // Sepolia chain ID
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     const encrypted = await encryptBid(...);
     if (!encrypted) throw new Error('Encryption failed');
   } catch (error) {
     console.error('FHE error:', error);
   }
   ```

4. **Test with small values first**
   ```typescript
   // Start with 0.01 ETH for testing
   const testBid = parseEther('0.01');
   ```

---

## 🎉 Success Indicators

You know it's working when:

- ✅ No TypeScript errors in IDE
- ✅ Contracts compile without warnings
- ✅ All tests pass (green checkmarks)
- ✅ Frontend loads without console errors
- ✅ Can connect wallet
- ✅ FHE initializes successfully
- ✅ Bid encryption returns valid handles
- ✅ Transaction submits to Sepolia
- ✅ Can view encrypted bids on-chain
- ✅ Auction closes and winner is declared

---

## 🆘 Need Help?

1. **Check Documentation**: Start with `SUMMARY.md`
2. **Read Details**: See `ZAMA_UPDATES.md` for explanations
3. **View Diagrams**: Check `docs/MIGRATION_DIAGRAM.md`
4. **Official Docs**: Visit https://docs.zama.ai
5. **Community**: Ask at https://community.zama.org

---

**Created**: November 2025  
**Updated**: Based on Protocol.pdf  
**Version**: Aligned with @fhevm/sdk v0.7.0
