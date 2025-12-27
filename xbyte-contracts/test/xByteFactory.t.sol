// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.33;

import {Test} from "forge-std/Test.sol";
import {xByteFactory, Vault} from "../src/xByteFactory.sol";

contract xByteFactoryTest is Test {
    xByteFactory public factory;

    function setUp() public {
        vm.etch(address(1337), bytes("test"));
        factory = new xByteFactory(address(1337));
    }

    function test_createVault() public {
        address vaultAddress = factory.createVault();
        address expectedVaultAddress = factory.computeVaultAddress(msg.sender);

        assertEq(vaultAddress, expectedVaultAddress);
    }
}
