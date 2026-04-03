require("@nomicfoundation/hardhat-toolbox");

// NEVER commit real private keys. Use environment variables.
// Set these in your shell or .env file:
//   DEPLOYER_KEY=0x...   (from Ledger or secure wallet)
//   POLYGONSCAN_KEY=...  (for contract verification)

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    // Polygon Amoy testnet (replaces Mumbai, deprecated 2024)
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : []
    },
    // Polygon mainnet
    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_KEY || ""
    }
  }
};
