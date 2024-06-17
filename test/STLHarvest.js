const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  describe("STLPool", function () {
    let stlToken;
    let accounts;
    let adminAddress;
    let depositAccount;
    let _contract;
    let deployedContract;
  
    beforeEach(async () => {
      [adminAddress, depositAccount, ...accounts] = await ethers.getSigners();
      const Token = await ethers.getContractFactory("STLTOKEN");
      stlToken = await Token.deploy(ethers.utils.parseEther("10000"));
  
      _contract = await ethers.getContractFactory("STLHarvest");
      deployedContract = await _contract.deploy(stlToken.address);
  
      await stlToken.mint(adminAddress.address, ethers.utils.parseEther("1000"));
      await stlToken.mint(depositAccount.address, ethers.utils.parseEther("1000"));
  
      await stlToken.approve(deployedContract.address, ethers.utils.parseEther("1000"));
      await stlToken.connect(depositAccount).approve(deployedContract.address, ethers.utils.parseEther("1000"));
    });
  
    describe("Deposit", function () {
      it("Should set the first deposit", async function () {
        await deployedContract.connect(adminAddress).deposit(ethers.utils.parseEther("1"));
        expect((await deployedContract.totalStaked()).toString()).to.equal(ethers.utils.parseEther("1").toString());
      });
  
      it("Should verify if totalStaked is greater than 0", async function () {
        await deployedContract.connect(adminAddress).deposit(ethers.utils.parseEther("1"));
        await deployedContract.connect(adminAddress).depositRewards(ethers.utils.parseEther("1"));
  
        const _reward = await deployedContract.calculateReward(adminAddress.address);
        expect(Number(_reward)).to.be.greaterThan(0);
      });
  
      it("Should revert if deposit amount is zero", async function () {
        await expect(deployedContract.connect(adminAddress).deposit(0)).to.be.revertedWith("Amount must be greater than zero");
      });
    });
  
    describe("Rewards", function () {
      it("Should balance of user be greater than initial after getting reward", async function () {
        await deployedContract.connect(adminAddress).deposit(ethers.utils.parseEther("1"));
        await deployedContract.connect(adminAddress).depositRewards(ethers.utils.parseEther("1"));
  
        const oldBalance = await stlToken.balanceOf(adminAddress.address);
        await deployedContract.getReward(adminAddress.address);
        const newBalance = await stlToken.balanceOf(adminAddress.address);
  
        expect(newBalance).to.be.above(oldBalance);
      });
  
      it("Should revert if rewards are not deposited", async function () {
        await deployedContract.connect(adminAddress).deposit(ethers.utils.parseEther("1"));
        await expect(deployedContract.getReward(adminAddress.address)).to.be.revertedWith("No rewards available yet to be collected");
      });
    });
  
    describe("root account Team Role", function () {
      const _role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'));
  
      it("Should account needs to have Team Role", async function () {
        const isTeam = await deployedContract.hasRole(_role, adminAddress.address);
        expect(isTeam).to.equal(true);
      });
    });
  
    describe("adding new account Team Role", function () {
      const _role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'));
  
      it("Should account needs to have Team Role", async function () {
        await deployedContract.grantRole(_role, depositAccount.address);
        const isTeam = await deployedContract.hasRole(_role, depositAccount.address);
        expect(isTeam).to.equal(true);
      });
  
      it('Should revert if the user does not have TEAM ROLE when using depositRewards', async function () {
        const role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'));
  
        await deployedContract.revokeRole(role, adminAddress.address);
  
        await expect(deployedContract.connect(adminAddress).depositRewards(ethers.utils.parseEther("1"))).to.be.revertedWith('Restricted to Team.');
      });
  
      it("Should revert if non-admin tries to revoke role", async function () {
        const role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'));
  
        await expect(deployedContract.connect(depositAccount).revokeRole(role, adminAddress.address)).to.be.revertedWith('AccessControlUnauthorizedAccount');
      });
    });
  });
  