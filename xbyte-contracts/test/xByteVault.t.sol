// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {xByteFactory} from "../src/xByteFactory.sol";
import {xByteVault} from "../src/xByteVault.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {xByteRelay} from "../src/xByteRelay.sol";

contract xByteVaultTest is Test {
    xByteFactory public factory;
    xByteVault public vault;
    xByteRelay public vaultRelay;

    function setUp() public {
        xByteVault _vault = new xByteVault();
        vaultRelay = new xByteRelay(address(_vault));
        factory = new xByteFactory(address(vaultRelay));
        vault = xByteVault(payable(factory.createVault()));
    }

    function test_createVault() public {
        assertEq(vault.owner(), address(this));
        assertEq(vault.factory(), address(factory));
    }

    function test_withdrawNative() public {
        // Before Withdraw
        uint256 vaultBefore = vault.owner().balance;
        uint256 factoryBefore = vault.factory().balance;

        // Check the received amount
        vm.deal(address(vault), 100);
        vault.withdraw();

        // After Withdraw
        uint256 vaultAfter = vault.owner().balance;
        uint256 factoryAfter = vault.factory().balance;

        assertEq(vaultAfter - vaultBefore, 99);
        assertEq(factoryAfter - factoryBefore, 1);
    }

    function test_withdrawERC20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(vault), 100);

        // Check the received amount
        vault.withdrawERC20(address(token));
        assertEq(token.balanceOf(vault.owner()), 99);
        assertEq(token.balanceOf(vault.factory()), 1);
    }

    receive() external payable {}
}
