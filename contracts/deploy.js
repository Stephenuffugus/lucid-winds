// Hardhat deployment script for LucidWindsPlant
// Usage: npx hardhat run deploy.js --network amoy    (testnet)
//        npx hardhat run deploy.js --network polygon  (mainnet)

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "POL");

  // CONFIGURE THESE BEFORE DEPLOYING:
  //
  // signerAddress: The server wallet that signs mint vouchers.
  //   Generate a NEW wallet for this — it only signs, never holds funds.
  //   Store the private key in Firebase Functions config.
  //
  // royaltyReceiver: Where OpenSea royalties go. Use your main wallet.
  //
  // royaltyBps: 500 = 5%. Range: 0-1000 (0-10%).

  const signerAddress    = process.env.SIGNER_ADDRESS || deployer.address;
  const royaltyReceiver  = deployer.address;
  const royaltyBps       = 500; // 5%

  console.log("Signer:", signerAddress);
  console.log("Royalty receiver:", royaltyReceiver, "at", royaltyBps / 100 + "%");

  const LWP = await hre.ethers.getContractFactory("LucidWindsPlant");
  const lwp = await LWP.deploy(signerAddress, royaltyReceiver, royaltyBps);
  await lwp.waitForDeployment();

  const addr = await lwp.getAddress();
  console.log("\n========================================");
  console.log("LucidWindsPlant deployed to:", addr);
  console.log("========================================");
  console.log("\nNext steps:");
  console.log("1. Verify on PolygonScan:");
  console.log("   npx hardhat verify --network " + hre.network.name + " " + addr + " " + signerAddress + " " + royaltyReceiver + " " + royaltyBps);
  console.log("2. Add contract address to your game config");
  console.log("3. Test a mint on testnet before going to mainnet");
}

main().catch(function(err) {
  console.error(err);
  process.exitCode = 1;
});
