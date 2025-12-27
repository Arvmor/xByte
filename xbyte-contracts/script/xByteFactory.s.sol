// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.33;

import {Script} from "forge-std/Script.sol";
import {xByteFactory} from "../src/xByteFactory.sol";

contract xByteFactoryScript is Script {
    xByteFactory public factory;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        factory = new xByteFactory(address(1337));

        vm.stopBroadcast();
    }
}
