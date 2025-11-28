import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import ethers directly
import { ethers, getDefaultProvider, JsonRpcProvider, Wallet } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  console.log("🚀 Starting deployment of Private Auction FHE contract...");

  // Create provider and signer
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Missing SEPOLIA_RPC_URL or SEPOLIA_PRIVATE_KEY in .env");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const deployerAddress = signer.address;

  console.log("📝 Deploying with account:", deployerAddress);

  // Get account balance
  const balance = await provider.getBalance(deployerAddress);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Read contract artifact
  const contractPath = path.join(__dirname, "../artifacts/contracts/AuctionSimple.sol/AuctionSimple.json");
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract artifact not found at ${contractPath}. Run 'npm run compile' first.`);
  }

  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
  const abi = contractArtifact.abi;
  const bytecode = contractArtifact.bytecode;

  // Create contract factory and deploy
  console.log("\n📦 Deploying AuctionSimple contract...");
  const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);
  const auction = await ContractFactory.deploy();

  const deploymentTx = auction.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error("No deployment transaction found");
  }

  const receipt = await deploymentTx.wait();
  if (!receipt) {
    throw new Error("Deployment failed: no receipt");
  }

  const auctionAddress = await auction.getAddress();

  console.log("✅ AuctionSimple contract deployed to:", auctionAddress);
  console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${auctionAddress}`);

  // Get network info
  const networkInfo = await provider.getNetwork();

  console.log("\n📊 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract: Auction");
  console.log("Address:", auctionAddress);
  console.log("Deployer:", deployerAddress);
  console.log("Network:", networkInfo.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save deployment info
  const deploymentInfo = {
    contract: "Auction",
    address: auctionAddress,
    deployer: deployerAddress,
    network: networkInfo.name,
    chainId: networkInfo.chainId.toString(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Deployment info:", JSON.stringify(deploymentInfo, null, 2));

  return auctionAddress;
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  });