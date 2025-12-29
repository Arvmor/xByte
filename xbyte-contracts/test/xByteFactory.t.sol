// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {xByteFactory} from "../src/xByteFactory.sol";
import {xByteVault} from "../src/xByteVault.sol";
import {xByteRelay} from "../src/xByteRelay.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract xByteFactoryTest is Test {
    xByteFactory public factory;
    xByteRelay public vaultRelay;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    event VaultCreated(address indexed owner, address indexed vaultAddress);
    event WithdrawNative(uint256 amount, address indexed owner);
    event Withdraw(uint256 amount, address indexed owner, address indexed token);

    function setUp() public {
        xByteVault vault = new xByteVault();
        vaultRelay = new xByteRelay(address(vault));
        factory = new xByteFactory(address(vaultRelay));
    }

    function test_constructor() public view {
        assertEq(factory.owner(), address(this));
        assertEq(factory.vaultRelay(), address(vaultRelay));
    }

    function test_deploy_address() public {
        address vaultAddress = factory.createVault();
        address computedAddress = factory.computeVaultAddress(address(this));
        assertEq(vaultAddress, computedAddress);
    }

    function test_createVault_emitsEvent() public {
        address expectedAddress = factory.computeVaultAddress(alice);

        vm.expectEmit(true, true, false, false);
        emit VaultCreated(alice, expectedAddress);

        vm.prank(alice);
        factory.createVault();
    }

    function test_createVault_multipleUsers() public {
        vm.prank(alice);
        address aliceVault = factory.createVault();

        vm.prank(bob);
        address bobVault = factory.createVault();

        vm.prank(charlie);
        address charlieVault = factory.createVault();

        assertEq(aliceVault, factory.computeVaultAddress(alice));
        assertEq(bobVault, factory.computeVaultAddress(bob));
        assertEq(charlieVault, factory.computeVaultAddress(charlie));

        assertNotEq(aliceVault, bobVault);
        assertNotEq(bobVault, charlieVault);
        assertNotEq(aliceVault, charlieVault);
    }

    function test_createVault_storesVaultMapping() public {
        vm.prank(alice);
        address vaultAddress = factory.createVault();

        (address storedVaultAddress, address storedOwner) = factory.vaults(alice);
        assertEq(storedVaultAddress, vaultAddress);
        assertEq(storedOwner, alice);
    }

    function test_createVault_revert_duplicateVault() public {
        vm.prank(alice);
        factory.createVault();

        vm.prank(alice);
        vm.expectRevert();
        factory.createVault();
    }

    function test_computeVaultAddress_deterministicAcrossCalls() public view {
        address computed1 = factory.computeVaultAddress(alice);
        address computed2 = factory.computeVaultAddress(alice);
        assertEq(computed1, computed2);
    }

    function test_computeVaultAddress_differentPerUser() public view {
        address aliceComputed = factory.computeVaultAddress(alice);
        address bobComputed = factory.computeVaultAddress(bob);
        assertNotEq(aliceComputed, bobComputed);
    }

    function test_withdrawNative() public {
        uint256 beforeFactory = address(factory).balance;
        uint256 beforeOwner = factory.owner().balance;

        vm.deal(address(factory), 100);
        factory.withdraw();

        uint256 afterFactory = address(factory).balance;
        uint256 afterOwner = factory.owner().balance;

        assertEq(afterFactory - beforeFactory, 0);
        assertEq(afterOwner - beforeOwner, 100);
    }

    function test_withdrawNative_emitsEvent() public {
        vm.deal(address(factory), 100);

        vm.expectEmit(true, true, false, true);
        emit WithdrawNative(100, factory.owner());

        factory.withdraw();
    }

    function test_withdrawNative_zeroBalance() public {
        uint256 beforeOwner = factory.owner().balance;
        factory.withdraw();
        uint256 afterOwner = factory.owner().balance;

        assertEq(afterOwner, beforeOwner);
    }

    function test_withdrawNative_anyoneCanCall() public {
        vm.deal(address(factory), 100);
        uint256 beforeOwner = factory.owner().balance;

        vm.prank(alice);
        factory.withdraw();

        uint256 afterOwner = factory.owner().balance;
        assertEq(afterOwner - beforeOwner, 100);
    }

    function test_withdrawNative_largeAmount() public {
        uint256 largeAmount = 1000 ether;
        vm.deal(address(factory), largeAmount);

        uint256 beforeOwner = factory.owner().balance;
        factory.withdraw();
        uint256 afterOwner = factory.owner().balance;

        assertEq(afterOwner - beforeOwner, largeAmount);
    }

    function test_withdrawERC20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(factory), 100);

        uint256 beforeOwner = token.balanceOf(factory.owner());
        factory.withdrawERC20(address(token));
        uint256 afterOwner = token.balanceOf(factory.owner());

        assertEq(afterOwner - beforeOwner, 100);
        assertEq(token.balanceOf(address(factory)), 0);
    }

    function test_withdrawERC20_emitsEvent() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(factory), 100);

        vm.expectEmit(true, true, true, true);
        emit Withdraw(100, factory.owner(), address(token));

        factory.withdrawERC20(address(token));
    }

    function test_withdrawERC20_zeroBalance() public {
        ERC20Mock token = new ERC20Mock();

        uint256 beforeOwner = token.balanceOf(factory.owner());
        factory.withdrawERC20(address(token));
        uint256 afterOwner = token.balanceOf(factory.owner());

        assertEq(afterOwner, beforeOwner);
    }

    function test_withdrawERC20_anyoneCanCall() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(factory), 100);

        uint256 beforeOwner = token.balanceOf(factory.owner());

        vm.prank(alice);
        factory.withdrawERC20(address(token));

        uint256 afterOwner = token.balanceOf(factory.owner());
        assertEq(afterOwner - beforeOwner, 100);
    }

    function test_withdrawERC20_multipleTokens() public {
        ERC20Mock token1 = new ERC20Mock();
        ERC20Mock token2 = new ERC20Mock();

        token1.mint(address(factory), 100);
        token2.mint(address(factory), 200);

        factory.withdrawERC20(address(token1));
        factory.withdrawERC20(address(token2));

        assertEq(token1.balanceOf(factory.owner()), 100);
        assertEq(token2.balanceOf(factory.owner()), 200);
    }

    function test_receive_acceptsEther() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        (bool success,) = address(factory).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(factory).balance, 1 ether);
    }

    function testFuzz_createVault_differentUsers(address user) public {
        vm.assume(user != address(0));
        vm.assume(user.code.length == 0);

        address computedAddress = factory.computeVaultAddress(user);

        vm.prank(user);
        address vaultAddress = factory.createVault();

        assertEq(vaultAddress, computedAddress);

        (address storedVaultAddress, address storedOwner) = factory.vaults(user);
        assertEq(storedVaultAddress, vaultAddress);
        assertEq(storedOwner, user);
    }

    function testFuzz_withdrawNative(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 100000 ether);

        vm.deal(address(factory), amount);
        uint256 beforeOwner = factory.owner().balance;

        factory.withdraw();

        uint256 afterOwner = factory.owner().balance;
        assertEq(afterOwner - beforeOwner, amount);
    }

    function testFuzz_withdrawERC20(uint256 amount) public {
        vm.assume(amount > 0 && amount <= type(uint128).max);

        ERC20Mock token = new ERC20Mock();
        token.mint(address(factory), amount);

        uint256 beforeOwner = token.balanceOf(factory.owner());
        factory.withdrawERC20(address(token));
        uint256 afterOwner = token.balanceOf(factory.owner());

        assertEq(afterOwner - beforeOwner, amount);
    }

    function test_withdraw_revert_reentrancy() public {
        ReentrantFactoryAttacker attacker = new ReentrantFactoryAttacker();
        xByteVault _vault = new xByteVault();
        xByteRelay _relay = new xByteRelay(address(_vault));
        xByteFactory attackerFactory = new xByteFactory(address(_relay));

        attackerFactory.transferOwnership(address(attacker));
        attacker.setFactory(attackerFactory);

        vm.deal(address(attackerFactory), 1 ether);

        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        attacker.attack();
    }

    receive() external payable {}
}

contract ReentrantFactoryAttacker {
    xByteFactory public factory;

    function setFactory(xByteFactory factory_) external {
        factory = factory_;
    }

    function attack() external {
        factory.withdraw();
    }

    receive() external payable {
        factory.withdraw();
    }
}
