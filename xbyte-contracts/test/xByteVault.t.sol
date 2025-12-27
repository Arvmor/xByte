// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {xByteFactory} from "../src/xByteFactory.sol";
import {xByteVault} from "../src/xByteVault.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract xByteVaultTest is Test {
    xByteFactory public factory;
    xByteVault public vault;

    function setUp() public {
        // Deploy time bytecode of xByteVault
        bytes memory initCode = type(xByteVault).creationCode;
        factory = new xByteFactory(initCode);
        address vaultAddress = factory.createVault();
        vault = xByteVault(payable(vaultAddress));
    }

    function test_createVault() public {
        (address vaultAddress, address owner, uint8 fee) = vault.vault();
        assertEq(vaultAddress, address(vault));
        assertEq(owner, msg.sender);
        assertEq(fee, 1);
    }

    function test_withdrawERC20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(vault), 100);

        // Check the received amount
        vault.withdrawERC20(address(token));
        assertEq(token.balanceOf(vault.owner()), 99);
        assertEq(token.balanceOf(vault.factory()), 1);
    }
}
