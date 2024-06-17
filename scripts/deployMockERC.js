const { ethers } = require("hardhat");
    async function main() {
        const mockToken = await ethers.getContractFactory("STLTOKEN");
        console.log("Deploying Mock...");
    const exampleNFT = await mockToken.deploy(100000);
    console.log("Contract deployed to address:", exampleNFT.address);
     }
     
     main();