// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.31;

import {Script} from "forge-std/Script.sol";
import {xByteVault} from "../src/xByteVault.sol";
import {xByteFactory} from "../src/xByteFactory.sol";
import {xByteRelay} from "../src/xByteRelay.sol";

contract xByteFactoryScript is Script {
    xByteFactory public factory;
    xByteRelay public vaultRelay;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        xByteVault vault = new xByteVault();
        vaultRelay = new xByteRelay(address(vault));
        factory = new xByteFactory(address(vaultRelay));

        vm.stopBroadcast();
    }
}
