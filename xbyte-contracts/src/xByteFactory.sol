// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

struct Vault {
    address vaultAddress;
    address owner;
    uint8 fee;
}

contract xByteFactory is Ownable {
    address public VAULT_IMPLEMENTATION;

    mapping(address => Vault) public vaults;

    constructor(address _vaultImplementation) Ownable(msg.sender) {
        VAULT_IMPLEMENTATION = _vaultImplementation;
    }

    function createVault() public {
        address owner = msg.sender;
        address vaultAddress = _deployVault(bytes32(bytes20(owner)));

        vaults[owner] = Vault({
            vaultAddress: vaultAddress,
            owner: owner,
            fee: 0
        });
    }

    function computeVaultAddress(address owner) public view returns (address) {
        bytes32 salt = bytes32(bytes20(owner));

        bytes32 initHash = keccak256(VAULT_IMPLEMENTATION.code);

        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, initHash)
        );

        // Convert the last 20 bytes of the hash to an address
        return address(uint160(uint256(hash)));
    }

    function _deployVault(bytes32 salt) internal returns (address addr) {
        // Get bytecode of the vault implementation
        bytes memory bytecode = VAULT_IMPLEMENTATION.code;

        // Deploy the vault implementation using CREATE2
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)

            if iszero(addr) {
                revert(0, 0)
            }
        }

        return addr;
    }
}
