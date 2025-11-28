import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import ethers directly
import { ethers, JsonRpcProvider, Wallet } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployFactory() {
  console.log("🚀 Starting deployment of AuctionFactory contract...");

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
  const contractPath = path.join(__dirname, "../artifacts/contracts/AuctionFactory.sol/AuctionFactory.json");
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract artifact not found at ${contractPath}. Run 'npm run compile' first.`);
  }

  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
  const abi = contractArtifact.abi;
  const bytecode = contractArtifact.bytecode;

  // Create contract factory and deploy
  console.log("\n📦 Deploying AuctionFactory contract...");
  const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);
  const factory = await ContractFactory.deploy();

  const deploymentTx = factory.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error("No deployment transaction found");
  }

  const receipt = await deploymentTx.wait();
  if (!receipt) {
    throw new Error("Deployment failed: no receipt");
  }

  const factoryAddress = await factory.getAddress();

  console.log("✅ AuctionFactory contract deployed to:", factoryAddress);
  console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${factoryAddress}`);

  // Get network info
  const networkInfo = await provider.getNetwork();

  console.log("\n📊 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract: AuctionFactory");
  console.log("Address:", factoryAddress);
  console.log("Deployer:", deployerAddress);
  console.log("Network:", networkInfo.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save deployment info
  const deploymentInfo = {
    contract: "AuctionFactory",
    address: factoryAddress,
    deployer: deployerAddress,
    network: networkInfo.name,
    chainId: networkInfo.chainId.toString(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Deployment info:", JSON.stringify(deploymentInfo, null, 2));

  // Save to a JSON file for reference
  const deploymentPath = path.join(__dirname, "../deployments/auction-factory.json");
  const deploymentsDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment details saved to:", deploymentPath);

  console.log("\n🔧 Next steps:");
  console.log("1. Update frontend/.env with:");
  console.log(`   VITE_AUCTION_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("2. Test the factory by creating an auction");

  return factoryAddress;
}

deployFactory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  });
