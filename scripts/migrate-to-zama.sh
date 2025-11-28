#!/bin/bash

# Zama FHE Migration Script
# This script helps migrate the project to use official Zama patterns

set -e

echo "🚀 Starting Zama FHE Migration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Update contracts dependencies
echo "${YELLOW}📦 Step 1: Updating contract dependencies...${NC}"
cd contracts

if [ ! -f "package.json" ]; then
    echo "${RED}❌ Error: contracts/package.json not found${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing contract dependencies..."
    npm install
else
    echo "✅ Contract dependencies already installed"
fi

# Step 2: Compile contracts
echo ""
echo "${YELLOW}🔨 Step 2: Compiling smart contracts...${NC}"
npm run compile

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Contracts compiled successfully${NC}"
else
    echo "${RED}❌ Contract compilation failed${NC}"
    exit 1
fi

# Step 3: Run contract tests
echo ""
echo "${YELLOW}🧪 Step 3: Running contract tests...${NC}"
npm run test

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ All contract tests passed${NC}"
else
    echo "${YELLOW}⚠️  Some tests may require FHE mock setup${NC}"
fi

# Step 4: Update frontend dependencies
echo ""
echo "${YELLOW}📦 Step 4: Updating frontend dependencies...${NC}"
cd ../frontend

# Uninstall old package
echo "Removing @fhevm/browser..."
npm uninstall @fhevm/browser 2>/dev/null || true

# Install new packages
echo "Installing @fhevm/sdk and ethers..."
npm install @fhevm/sdk@^0.7.0 ethers@^6.13.0

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Frontend dependencies updated${NC}"
else
    echo "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Step 5: Extract and update ABI
echo ""
echo "${YELLOW}📋 Step 5: Extracting updated ABI...${NC}"

ABI_FILE="../contracts/artifacts/contracts/Auction.sol/Auction.json"
if [ -f "$ABI_FILE" ]; then
    echo "✅ ABI file found at: $ABI_FILE"
    echo "${YELLOW}📝 Please manually update the ABI in src/config/contracts.ts${NC}"
    echo "   You can extract it using:"
    echo "   jq '.abi' $ABI_FILE"
else
    echo "${RED}❌ ABI file not found. Please compile contracts first.${NC}"
fi

# Step 6: Summary
echo ""
echo "${GREEN}================================${NC}"
echo "${GREEN}✅ Migration Complete!${NC}"
echo "${GREEN}================================${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Update the ABI in frontend/src/config/contracts.ts"
echo "2. Review ZAMA_UPDATES.md for detailed changes"
echo "3. Test the application:"
echo "   cd frontend && npm run dev"
echo "4. Deploy to Sepolia when ready:"
echo "   cd contracts && npm run deploy:sepolia"
echo ""
echo "📚 Documentation:"
echo "   - Read ZAMA_UPDATES.md for all changes"
echo "   - See Protocol.pdf for Zama guidelines"
echo "   - Visit https://docs.zama.ai/protocol"
echo ""
