// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract xByteRelay is UpgradeableBeacon {
    constructor(address implementation_) UpgradeableBeacon(implementation_, msg.sender) {}
}
