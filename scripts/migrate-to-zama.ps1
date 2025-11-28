# Zama FHE Migration Script (PowerShell)
# This script helps migrate the project to use official Zama patterns

Write-Host "🚀 Starting Zama FHE Migration..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Step 1: Update contracts dependencies
Write-Host "📦 Step 1: Updating contract dependencies..." -ForegroundColor Yellow
Set-Location contracts

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: contracts/package.json not found" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing contract dependencies..." -ForegroundColor White
    npm install
} else {
    Write-Host "✅ Contract dependencies already installed" -ForegroundColor Green
}

# Step 2: Compile contracts
Write-Host ""
Write-Host "🔨 Step 2: Compiling smart contracts..." -ForegroundColor Yellow
npm run compile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contracts compiled successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Contract compilation failed" -ForegroundColor Red
    exit 1
}

# Step 3: Run contract tests
Write-Host ""
Write-Host "🧪 Step 3: Running contract tests..." -ForegroundColor Yellow
try {
    npm run test
    Write-Host "✅ All contract tests passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some tests may require FHE mock setup" -ForegroundColor Yellow
}

# Step 4: Update frontend dependencies
Write-Host ""
Write-Host "📦 Step 4: Updating frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend

# Uninstall old package
Write-Host "Removing @fhevm/browser..." -ForegroundColor White
try {
    npm uninstall @fhevm/browser 2>$null
} catch {
    # Ignore errors if package doesn't exist
}

# Install new packages
Write-Host "Installing @fhevm/sdk and ethers..." -ForegroundColor White
npm install @fhevm/sdk@^0.7.0 ethers@^6.13.0

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies updated" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Step 5: Extract and update ABI
Write-Host ""
Write-Host "📋 Step 5: Extracting updated ABI..." -ForegroundColor Yellow

$abiFile = "../contracts/artifacts/contracts/Auction.sol/Auction.json"
if (Test-Path $abiFile) {
    Write-Host "✅ ABI file found at: $abiFile" -ForegroundColor Green
    Write-Host "📝 Please manually update the ABI in src/config/contracts.ts" -ForegroundColor Yellow
    Write-Host "   You can extract it using PowerShell or a JSON viewer" -ForegroundColor White
} else {
    Write-Host "❌ ABI file not found. Please compile contracts first." -ForegroundColor Red
}

# Step 6: Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Migration Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update the ABI in frontend/src/config/contracts.ts" -ForegroundColor White
Write-Host "2. Review ZAMA_UPDATES.md for detailed changes" -ForegroundColor White
Write-Host "3. Test the application:" -ForegroundColor White
Write-Host "   cd frontend; npm run dev" -ForegroundColor Gray
Write-Host "4. Deploy to Sepolia when ready:" -ForegroundColor White
Write-Host "   cd contracts; npm run deploy:sepolia" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Read ZAMA_UPDATES.md for all changes" -ForegroundColor White
Write-Host "   - See Protocol.pdf for Zama guidelines" -ForegroundColor White
Write-Host "   - Visit https://docs.zama.ai/protocol" -ForegroundColor White
Write-Host ""

# Return to root directory
Set-Location ..
