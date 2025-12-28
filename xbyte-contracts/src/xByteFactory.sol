// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

struct Vault {
    address vaultAddress;
    address owner;
    uint8 fee;
}

contract xByteFactory is Ownable {
    bytes public vaultImplementation;
    uint8 public constant COMMISSION_FEE = 1;

    mapping(address => Vault) public vaults;

    event VaultCreated(address indexed owner, address indexed vaultAddress);
    event WithdrawNative(uint256 amount, address indexed owner);
    event Withdraw(uint256 amount, address indexed owner, address indexed token);

    constructor(bytes memory _vaultImplementation) Ownable(msg.sender) {
        vaultImplementation = _vaultImplementation;
    }

    function createVault() public returns (address) {
        address owner = msg.sender;
        address vaultAddress = _deployVault(owner);

        vaults[owner] = Vault({vaultAddress: vaultAddress, owner: owner, fee: COMMISSION_FEE});

        emit VaultCreated(owner, vaultAddress);
        return vaultAddress;
    }

    function computeVaultAddress(address owner) public view returns (address) {
        bytes32 salt = bytes32(bytes20(owner));
        bytes memory implementation = vaultImplementation;

        bytes32 codehash;
        assembly {
            codehash := keccak256(add(implementation, 0x20), mload(implementation))
        }

        return Create2.computeAddress(salt, codehash);
    }

    function _deployVault(address owner) internal returns (address addr) {
        bytes32 salt = bytes32(bytes20(owner));
        return Create2.deploy(0, salt, vaultImplementation);
    }

    function withdraw() public {
        uint256 balance = address(this).balance;

        Address.sendValue(payable(owner()), balance);
        emit WithdrawNative(balance, owner());
    }

    function withdrawERC20(address _token) public {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));

        SafeERC20.safeTransfer(token, owner(), balance);
        emit Withdraw(balance, owner(), _token);
    }

    receive() external payable {}
}
