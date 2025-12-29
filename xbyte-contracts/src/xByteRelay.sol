// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/// @title xByteRelay
/// @author xByte Team
/// @notice Beacon contract for managing xByteVault implementation upgrades
/// @dev All vault proxies created by xByteFactory point to this beacon for their implementation
contract xByteRelay is UpgradeableBeacon {
    /// @notice Initializes the beacon with the vault implementation address
    /// @dev Sets the deployer as the beacon owner who can upgrade the implementation
    /// @param implementation_ The initial xByteVault implementation contract address
    constructor(address implementation_) UpgradeableBeacon(implementation_, msg.sender) {}
}
