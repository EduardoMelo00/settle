# STLHarvest Deployment and Verification

This project includes the deployment, verification, and testing of the `STLTOKEN` and `STLHarvest` smart contracts on the Sepolia testnet.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js and npm installed
- Docker installed
- Hardhat installed (`npm install --save-dev hardhat`)
- Create a `.env` file in the project root with the following environment variables:

```plaintext
PROVIDER_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=YOUR_PRIVATE_KEY
ETHERSCAN_KEY=YOUR_ETHERSCAN_API_KEY
```

## Installation

1. Clone the repository:

```bash
git clone <repository_url>
cd <repository_directory>
```

2. Install dependencies:

```bash
npm install
```

## Configuration 
Ensure your hardhat.config.js is correctly set up:

```javascript
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
      chainId: 1337,
    },
    sepolia: {
      url: PROVIDER_URL || "",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY,
  },
};
```

## Docker Setup

To use Docker for setting up and running the project:

1. Create a Dockerfile in the project root:

# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port HardHat node will run on
EXPOSE 8545

# Command to run your HardHat node and deploy the contracts
CMD ["sh", "-c", "npx hardhat node & sleep 5 && npx hardhat run scripts/deployAndVerify.js --network localhost"]


2. Build and run the Docker container:
docker build -t my-hardhat-project .
docker run -p 8545:8545 my-hardhat-project

## Deployment

```bash
npx hardhat run scripts/deployAndVerify.js --network sepolia
```

## Testnet Addresses
STLTOKEN deployed to: 0xda3956348500ac99475CFF6a2413dC8baBb3Ae8C
STLHarvest deployed to: 0x77eDd80A1f2faB3a79686C543d5B6a04373cbDE1

## Testing

```bash
npx hardhat test
```

Test Cases
The test cases cover the following scenarios:

1. Deposit Functionality:
- Successful deposit.
- Failing deposit with zero amount.
2. Rewards Functionality:
- Successful reward distribution.
- Failing reward distribution if rewards are not deposited.
3. Role Management:
- Granting and checking the team role.
- Failing to revoke a role without proper permissions.


## Hardhat Tasks

This project includes a custom Hardhat task to query and display the total amount of STL tokens held in the STLHarvest contract.

```javascript
task("stl-balance", "Displays the total amount of STL tokens held in the contract")
  .addParam("contract", "The address of the STLHarvest contract")
  .setAction(async (taskArgs, hre) => {
    const contractAddress = taskArgs.contract;
    const STLHarvest = await hre.ethers.getContractFactory("STLHarvest");
    const stlHarvest = STLHarvest.attach(contractAddress);

    try {
      const balance = await stlHarvest.totalStaked();
      console.log(`Total STL tokens held in the contract: ${hre.ethers.utils.formatEther(balance)}`);
    } catch (error) {
      console.error("Error calling totalStaked:", error);
    }
  });

module.exports = {};
```

## Running the Custom Task
To run the custom task and query the total amount of STL tokens held in the contract:

```bash
npx hardhat stl-balance --contract <STLHarvest contract address> --network sepolia
```
Replace <STLHarvest contract address> with the actual contract address.



