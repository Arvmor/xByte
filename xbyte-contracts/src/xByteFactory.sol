// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

struct Vault {
    address vaultAddress;
    address owner;
    uint8 fee;
}

contract xByteFactory is Ownable {
    address public vaultImplementation;
    uint8 public constant COMMISSION_FEE = 1;

    mapping(address => Vault) public vaults;

    constructor(address _vaultImplementation) Ownable(msg.sender) {
        vaultImplementation = _vaultImplementation;
    }

    function createVault() public returns (address) {
        address owner = msg.sender;
        address vaultAddress = _deployVault(owner);

        vaults[owner] = Vault({
            vaultAddress: vaultAddress,
            owner: owner,
            fee: COMMISSION_FEE
        });

        return vaultAddress;
    }

    function computeVaultAddress(address owner) public view returns (address) {
        bytes32 salt = bytes32(bytes20(owner));
        return Create2.computeAddress(salt, vaultImplementation.codehash);
    }

    function _deployVault(address owner) internal returns (address addr) {
        bytes32 salt = bytes32(bytes20(owner));
        return Create2.deploy(0, salt, vaultImplementation.code);
    }
}
