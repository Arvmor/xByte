// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Represents a user's vault with its address and owner
/// @param vaultAddress The deployed vault contract address
/// @param owner The owner of the vault
struct Vault {
    address vaultAddress;
    address owner;
}

/// @title xByteFactory
/// @author xByte Team
/// @notice Factory contract for deploying deterministic xByteVault proxies using CREATE2
/// @dev Uses the beacon proxy pattern to enable upgradeable vaults via xByteRelay
contract xByteFactory is Ownable, ReentrancyGuard {
    /// @notice The beacon relay contract address used for vault proxy upgrades
    address public vaultRelay;

    /// @notice Mapping from owner address to their vault information
    mapping(address => Vault) public vaults;

    /// @notice Emitted when a new vault is created
    /// @param owner The owner of the newly created vault
    /// @param vaultAddress The address of the deployed vault proxy
    event VaultCreated(address indexed owner, address indexed vaultAddress);

    /// @notice Emitted when native tokens are withdrawn from the factory
    /// @param amount The amount of native tokens withdrawn
    /// @param owner The recipient of the withdrawal
    event WithdrawNative(uint256 amount, address indexed owner);

    /// @notice Emitted when ERC20 tokens are withdrawn from the factory
    /// @param amount The amount of tokens withdrawn
    /// @param owner The recipient of the withdrawal
    /// @param token The ERC20 token address
    event Withdraw(uint256 amount, address indexed owner, address indexed token);

    /// @notice Initializes the factory with the vault relay beacon address
    /// @param vaultRelay_ The address of the xByteRelay beacon contract
    constructor(address vaultRelay_) Ownable(msg.sender) {
        vaultRelay = vaultRelay_;
    }

    /// @notice Creates a new vault for the caller using CREATE2
    /// @dev Each address can only have one vault; uses owner address as salt
    /// @return vaultAddress The address of the newly deployed vault proxy
    function createVault() public returns (address vaultAddress) {
        address owner = msg.sender;
        vaultAddress = _deployVault(owner);

        vaults[owner] = Vault({vaultAddress: vaultAddress, owner: owner});
    }

    /// @notice Computes the deterministic vault address for a given owner
    /// @dev Uses CREATE2 with the owner address as salt for address derivation
    /// @param owner The address to compute the vault address for
    /// @return vaultAddress The computed vault address (may or may not be deployed)
    function computeVaultAddress(address owner) public view returns (address vaultAddress) {
        bytes32 codehash;
        (bytes32 salt, bytes memory initData) = _deployParameters(owner);

        bytes memory implementation = abi.encodePacked(type(BeaconProxy).creationCode, abi.encode(vaultRelay, initData));
        assembly {
            codehash := keccak256(add(implementation, 0x20), mload(implementation))
        }

        return Create2.computeAddress(salt, codehash);
    }

    /// @notice Deploys a new vault proxy for the specified owner
    /// @param owner The owner address for the new vault
    /// @return vaultAddress The address of the deployed vault proxy
    function _deployVault(address owner) internal returns (address vaultAddress) {
        (bytes32 salt, bytes memory initData) = _deployParameters(owner);
        BeaconProxy proxy = new BeaconProxy{salt: salt}(vaultRelay, initData);
        vaultAddress = address(proxy);
        emit VaultCreated(owner, vaultAddress);
    }

    /// @notice Generates deployment parameters for a vault proxy
    /// @param owner The owner address used for salt and initialization
    /// @return salt The CREATE2 salt derived from the owner address
    /// @return initData The encoded initialization calldata for the vault
    function _deployParameters(address owner) internal view returns (bytes32 salt, bytes memory initData) {
        initData = abi.encodeWithSignature("initialize(address,address)", owner, address(this));
        salt = bytes32(bytes20(owner));
    }

    /// @notice Withdraws all native tokens from the factory to the owner
    /// @dev Protected against reentrancy; sends entire balance to contract owner
    function withdraw() public nonReentrant {
        uint256 balance = address(this).balance;

        Address.sendValue(payable(owner()), balance);
        emit WithdrawNative(balance, owner());
    }

    /// @notice Withdraws all ERC20 tokens of a specific type from the factory
    /// @dev Protected against reentrancy; uses SafeERC20 for secure transfers
    /// @param _token The address of the ERC20 token to withdraw
    function withdrawERC20(address _token) public nonReentrant {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));

        SafeERC20.safeTransfer(token, owner(), balance);
        emit Withdraw(balance, owner(), _token);
    }

    /// @notice Allows the factory to receive native tokens (commission fees from vaults)
    receive() external payable {}
}
