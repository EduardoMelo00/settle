// tasks/stl-balance.js

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
