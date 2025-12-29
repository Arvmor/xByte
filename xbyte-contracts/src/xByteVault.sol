// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title xByteVault
/// @author xByte Team
/// @notice Upgradeable vault contract for storing and withdrawing user funds
/// @dev Deployed as a beacon proxy via xByteFactory; applies a 1% commission on withdrawals
contract xByteVault is OwnableUpgradeable, ReentrancyGuard {
    /// @notice The factory contract address that receives commission fees
    address public factory;

    /// @notice Commission fee percentage applied to all withdrawals (1%)
    uint8 public constant COMMISSION_FEE = 1;

    /// @notice Emitted when native tokens are withdrawn from the vault
    /// @param amount The net amount sent to the owner after fee deduction
    /// @param fee The commission fee sent to the factory
    /// @param owner The vault owner receiving the withdrawal
    /// @param factory The factory receiving the commission fee
    event WithdrawNative(uint256 amount, uint256 fee, address indexed owner, address indexed factory);

    /// @notice Emitted when ERC20 tokens are withdrawn from the vault
    /// @param amount The net amount sent to the owner after fee deduction
    /// @param fee The commission fee sent to the factory
    /// @param owner The vault owner receiving the withdrawal
    /// @param factory The factory receiving the commission fee
    /// @param token The ERC20 token address being withdrawn
    event Withdraw(uint256 amount, uint256 fee, address indexed owner, address indexed factory, address indexed token);

    /// @notice Disables initializers on the implementation contract
    /// @dev Prevents direct initialization of the implementation; only proxies can be initialized
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the vault proxy with owner and factory addresses
    /// @dev Called once during proxy deployment via the factory
    /// @param owner_ The address that will own this vault
    /// @param factory_ The factory contract address for commission collection
    function initialize(address owner_, address factory_) external initializer {
        __Ownable_init(owner_);
        factory = factory_;
    }

    /// @notice Withdraws all native tokens from the vault to the owner
    /// @dev Applies 1% commission fee; protected against reentrancy
    function withdraw() public nonReentrant {
        uint256 balance = address(this).balance;
        uint256 fee = (balance * COMMISSION_FEE) / 100;
        uint256 amount = balance - fee;

        Address.sendValue(payable(factory), fee);
        Address.sendValue(payable(owner()), amount);

        emit WithdrawNative(amount, fee, owner(), factory);
    }

    /// @notice Withdraws all ERC20 tokens of a specific type from the vault
    /// @dev Applies 1% commission fee; uses SafeERC20 for secure transfers
    /// @param _token The address of the ERC20 token to withdraw
    function withdrawERC20(address _token) public nonReentrant {
        IERC20 token = IERC20(_token);

        uint256 balance = token.balanceOf(address(this));
        uint256 fee = (balance * COMMISSION_FEE) / 100;
        uint256 amount = balance - fee;

        SafeERC20.safeTransfer(token, factory, fee);
        SafeERC20.safeTransfer(token, owner(), amount);

        emit Withdraw(amount, fee, owner(), factory, _token);
    }

    /// @notice Allows the vault to receive native token deposits
    receive() external payable {}
}
