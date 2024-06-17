require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("./tasks/stl-balance");


const { PROVIDER_URL, PRIVATE_KEY, ETHERSCAN_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 421614
    },
    sepolia: {
      url: PROVIDER_URL || "",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY
  }
};
