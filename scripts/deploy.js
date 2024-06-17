// scripts/deploy.js

const hre = require("hardhat");

async function main() {
  const STLTOKEN = await hre.ethers.getContractFactory("STLTOKEN");
  const initialSupply = hre.ethers.utils.parseEther("10000");
  
  const stlToken = await STLTOKEN.deploy(initialSupply);

  await stlToken.deployed();

  console.log("STLTOKEN deployed to:", stlToken.address);

  const STLHarvest = await hre.ethers.getContractFactory("STLHarvest");
  const stlHarvest = await STLHarvest.deploy(stlToken.address);
  await stlHarvest.deployed();

  console.log("STLHarvest deployed to:", stlHarvest.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
