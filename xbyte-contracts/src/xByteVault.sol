// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Vault} from "./xByteFactory.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract xByteVault is Ownable {
    address public factory;
    Vault public vault;

    event WithdrawNative(uint256 amount, uint256 fee, address indexed owner, address indexed factory);
    event Withdraw(uint256 amount, uint256 fee, address indexed owner, address indexed factory, address indexed token);

    constructor() Ownable(tx.origin) {
        vault = Vault({vaultAddress: address(this), owner: owner(), fee: 1});
        factory = msg.sender;
    }

    function withdraw() public {
        uint256 balance = address(this).balance;
        uint256 fee = (balance * vault.fee) / 100;
        uint256 amount = balance - fee;

        Address.sendValue(payable(factory), fee);
        Address.sendValue(payable(owner()), amount);

        emit WithdrawNative(amount, fee, owner(), factory);
    }

    function withdrawERC20(address _token) public {
        IERC20 token = IERC20(_token);

        uint256 balance = token.balanceOf(address(this));
        uint256 fee = (balance * vault.fee) / 100;
        uint256 amount = balance - fee;

        SafeERC20.safeTransfer(token, factory, fee);
        SafeERC20.safeTransfer(token, owner(), amount);

        emit Withdraw(amount, fee, owner(), factory, _token);
    }

    receive() external payable {}
}
