// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

struct Vault {
    address vaultAddress;
    address owner;
}

contract xByteFactory is Ownable {
    address public vaultRelay;

    mapping(address => Vault) public vaults;

    event VaultCreated(address indexed owner, address indexed vaultAddress);
    event WithdrawNative(uint256 amount, address indexed owner);
    event Withdraw(uint256 amount, address indexed owner, address indexed token);

    constructor(address vaultRelay_) Ownable(msg.sender) {
        vaultRelay = vaultRelay_;
    }

    function createVault() public returns (address) {
        address owner = msg.sender;
        address vaultAddress = _deployVault(owner);

        vaults[owner] = Vault({vaultAddress: vaultAddress, owner: owner});
        return vaultAddress;
    }

    function computeVaultAddress(address owner) public view returns (address) {
        bytes32 codehash;

        bytes memory implementation = abi.encodePacked(type(BeaconProxy).creationCode, abi.encode(vaultRelay, ""));
        assembly {
            codehash := keccak256(add(implementation, 0x20), mload(implementation))
        }

        bytes32 salt = bytes32(bytes20(owner));
        return Create2.computeAddress(salt, codehash);
    }

    function _deployVault(address owner) internal returns (address) {
        bytes memory initData = abi.encodeWithSignature("initialize(address,address)", owner, address(this));

        bytes32 salt = bytes32(bytes20(owner));
        BeaconProxy proxy = new BeaconProxy{salt: salt}(vaultRelay, initData);

        emit VaultCreated(owner, address(proxy));
        return address(proxy);
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
