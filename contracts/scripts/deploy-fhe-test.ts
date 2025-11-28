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

async function deployFHETest() {
    console.log("🚀 Starting deployment of FHETest contract...");

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
    const contractPath = path.join(__dirname, "../artifacts/contracts/FHETest.sol/FHETest.json");
    if (!fs.existsSync(contractPath)) {
        throw new Error(`Contract artifact not found at ${contractPath}. Run 'npm run compile' first.`);
    }

    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
    const abi = contractArtifact.abi;
    const bytecode = contractArtifact.bytecode;

    // Create contract factory and deploy
    console.log("\n📦 Deploying FHETest contract...");
    const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);
    const fheTest = await ContractFactory.deploy();

    const deploymentTx = fheTest.deploymentTransaction();
    if (!deploymentTx) {
        throw new Error("No deployment transaction found");
    }

    const receipt = await deploymentTx.wait();
    if (!receipt) {
        throw new Error("Deployment failed: no receipt");
    }

    const fheTestAddress = await fheTest.getAddress();

    console.log("✅ FHETest contract deployed to:", fheTestAddress);
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${fheTestAddress}`);

    // Save deployment info
    const deploymentInfo = {
        contract: "FHETest",
        address: fheTestAddress,
        deployer: deployerAddress,
        network: "sepolia",
        chainId: (await provider.getNetwork()).chainId.toString(),
        timestamp: new Date().toISOString(),
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentsDir, "fhe-test.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("💾 Deployment info saved to:", deploymentPath);
    console.log("\nTest this contract by:");
    console.log("1. Encrypting a small value (1-10) using euint8");
    console.log("2. Calling testEncryption() with the encrypted value and proof");
    console.log("3. Check if transaction succeeds or reverts");
}

deployFHETest()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
