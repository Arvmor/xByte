// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract xByteVault is OwnableUpgradeable, ReentrancyGuard {
    address public factory;
    uint8 public constant COMMISSION_FEE = 1;

    event WithdrawNative(uint256 amount, uint256 fee, address indexed owner, address indexed factory);
    event Withdraw(uint256 amount, uint256 fee, address indexed owner, address indexed factory, address indexed token);

    constructor() {
        _disableInitializers();
    }

    function initialize(address owner_, address factory_) external initializer {
        __Ownable_init(owner_);
        factory = factory_;
    }

    function withdraw() public nonReentrant {
        uint256 balance = address(this).balance;
        uint256 fee = (balance * COMMISSION_FEE) / 100;
        uint256 amount = balance - fee;

        Address.sendValue(payable(factory), fee);
        Address.sendValue(payable(owner()), amount);

        emit WithdrawNative(amount, fee, owner(), factory);
    }

    function withdrawERC20(address _token) public nonReentrant {
        IERC20 token = IERC20(_token);

        uint256 balance = token.balanceOf(address(this));
        uint256 fee = (balance * COMMISSION_FEE) / 100;
        uint256 amount = balance - fee;

        SafeERC20.safeTransfer(token, factory, fee);
        SafeERC20.safeTransfer(token, owner(), amount);

        emit Withdraw(amount, fee, owner(), factory, _token);
    }

    receive() external payable {}
}
