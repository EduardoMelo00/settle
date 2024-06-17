// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract STLHarvest is AccessControl {
    bytes32 public constant ONLY_TEAM = keccak256("ONLY_TEAM");

    IERC20 public stlToken;

    uint256 public lastRun;
    uint256 public totalRewards;
    uint256 public totalStaked;
    bool public depositReward;
    uint256 public rewardInterval = 10 minutes; // 86400 = 1 day
    uint8 public rewardFactor = 1;
    uint256 public periodStake;

    struct userStake {
        uint256 amount;
        uint256 startTimestamp;
        uint256 lastAmountReward;
    }

    address[] public addresses;
    mapping(address => userStake) public userInfos;
    mapping(address => uint256) public rewards;

    constructor(address _stlTokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ONLY_TEAM, msg.sender);
        stlToken = IERC20(_stlTokenAddress);
        checkWeekTime();
    }

    modifier OnlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to Admins.");
        _;
    }

    modifier OnlyTeam() {
        require(isTeam(msg.sender), "Restricted to Team.");
        _;
    }

    function isAdmin(address account) public view virtual returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function isTeam(address account) public view virtual returns (bool) {
        return hasRole(ONLY_TEAM, account);
    }

    function addTeam(address account) public virtual OnlyAdmin {
        grantRole(ONLY_TEAM, account);
    }

    function deposit(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(
            stlToken.balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );

        stlToken.transferFrom(msg.sender, address(this), _amount);
        userInfos[msg.sender].amount += _amount;
        userInfos[msg.sender].startTimestamp = block.timestamp;
        totalStaked += _amount;
        addresses.push(msg.sender);
    }

    function depositRewards(uint256 _amount) public OnlyTeam {
        require(_amount > 0, "Amount must be greater than zero");
        require(
            stlToken.balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );

        stlToken.transferFrom(msg.sender, address(this), _amount);
        totalRewards += _amount;
        depositReward = true;
        periodStake = block.timestamp + 10 minutes;
    }

    function calculateReward(address _sender) public view returns (uint256) {
        uint256 withdrawRewardAmount;
        uint256 finalAmountReward;

        uint256 userInterval = block.timestamp -
            userInfos[_sender].startTimestamp;

        uint256 _total = rewardInterval - userInterval;

        uint256 rewardsPerToken = (totalRewards * 100) / totalStaked;

        withdrawRewardAmount =
            (((userInfos[_sender].amount * rewardsPerToken) / 100) /
                rewardInterval) *
            _total;

        finalAmountReward =
            (totalRewards - withdrawRewardAmount) -
            userInfos[_sender].lastAmountReward;

        return finalAmountReward;
    }

    function getReward(address _sender) public {
        require(depositReward, "No rewards available yet to be collected");
        require(calculateReward(_sender) > 0, "There are no rewards yet");
        uint256 returnReward = calculateReward(_sender);
        userInfos[_sender].lastAmountReward += returnReward;
        stlToken.transfer(_sender, returnReward);
    }

    function withdrawAmountAndReward(address _sender) public {
        require(depositReward, "The rewards isn't deposited yet.");
        require(calculateReward(_sender) > 0, "There are no rewards yet");
        require(
            userInfos[_sender].amount > 0,
            "There is no amount for withdrawal"
        );
        uint256 totalRewardStake = calculateReward(_sender);
        uint256 total = userInfos[_sender].amount + totalRewardStake;
        userInfos[_sender].amount = 0;
        userInfos[_sender].startTimestamp = 0;
        userInfos[_sender].lastAmountReward = 0;

        stlToken.transfer(_sender, total);
    }

    function withdrawAmount(address _sender) public {
        require(
            userInfos[_sender].amount > 0,
            "Amount must be greater than zero"
        );
        uint256 total = userInfos[_sender].amount;
        totalStaked -= total;
        userInfos[_sender].amount = 0;
        userInfos[_sender].startTimestamp = 0;
        userInfos[_sender].lastAmountReward = 0;

        stlToken.transfer(_sender, total);
    }

    function checkWeekTime() public {
        require(
            block.timestamp - lastRun > rewardInterval,
            "Need to wait 10 minutes"
        );
        lastRun = block.timestamp;
    }

    function distributeRewards() public {
        checkWeekTime();
        for (uint256 i = 0; i < addresses.length; i++) {
            getReward(addresses[i]);
        }

        depositReward = false;
        delete addresses;
    }
}
