// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {xByteFactory} from "../src/xByteFactory.sol";
import {xByteVault} from "../src/xByteVault.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {xByteRelay} from "../src/xByteRelay.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract xByteVaultTest is Test {
    xByteFactory public factory;
    xByteVault public vault;
    xByteRelay public vaultRelay;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    uint8 public constant COMMISSION_FEE = 1;

    event WithdrawNative(uint256 amount, uint256 fee, address indexed owner, address indexed factory);
    event Withdraw(uint256 amount, uint256 fee, address indexed owner, address indexed factory, address indexed token);

    function setUp() public {
        xByteVault _vault = new xByteVault();
        vaultRelay = new xByteRelay(address(_vault));
        factory = new xByteFactory(address(vaultRelay));
        vault = xByteVault(payable(factory.createVault()));
    }

    function test_createVault() public view {
        assertEq(vault.owner(), address(this));
        assertEq(vault.factory(), address(factory));
    }

    function test_initialize_revert_calledTwice() public {
        vm.expectRevert();
        vault.initialize(alice, address(factory));
    }

    function test_initialize_revert_onImplementation() public {
        xByteVault implementation = new xByteVault();
        vm.expectRevert();
        implementation.initialize(alice, address(factory));
    }

    function test_commissionFee() public view {
        assertEq(vault.COMMISSION_FEE(), 1);
    }

    function test_withdrawNative() public {
        uint256 vaultBefore = vault.owner().balance;
        uint256 factoryBefore = vault.factory().balance;

        vm.deal(address(vault), 100);
        vault.withdraw();

        uint256 vaultAfter = vault.owner().balance;
        uint256 factoryAfter = vault.factory().balance;

        assertEq(vaultAfter - vaultBefore, 99);
        assertEq(factoryAfter - factoryBefore, 1);
    }

    function test_withdrawNative_emitsEvent() public {
        vm.deal(address(vault), 100);
        uint256 expectedFee = 1;
        uint256 expectedAmount = 99;

        vm.expectEmit(true, true, true, true);
        emit WithdrawNative(expectedAmount, expectedFee, vault.owner(), vault.factory());

        vault.withdraw();
    }

    function test_withdrawNative_zeroBalance() public {
        uint256 ownerBefore = vault.owner().balance;
        uint256 factoryBefore = vault.factory().balance;

        vault.withdraw();

        assertEq(vault.owner().balance, ownerBefore);
        assertEq(vault.factory().balance, factoryBefore);
    }

    function test_withdrawNative_anyoneCanCall() public {
        vm.deal(address(vault), 100);
        uint256 ownerBefore = vault.owner().balance;
        uint256 factoryBefore = vault.factory().balance;

        vm.prank(alice);
        vault.withdraw();

        assertEq(vault.owner().balance - ownerBefore, 99);
        assertEq(vault.factory().balance - factoryBefore, 1);
    }

    function test_withdrawNative_largeAmount() public {
        uint256 largeAmount = 10000 ether;
        vm.deal(address(vault), largeAmount);

        uint256 expectedFee = (largeAmount * COMMISSION_FEE) / 100;
        uint256 expectedAmount = largeAmount - expectedFee;

        uint256 ownerBefore = vault.owner().balance;
        uint256 factoryBefore = vault.factory().balance;

        vault.withdraw();

        assertEq(vault.owner().balance - ownerBefore, expectedAmount);
        assertEq(vault.factory().balance - factoryBefore, expectedFee);
    }

    function test_withdrawNative_smallAmountNoFee() public {
        vm.deal(address(vault), 99);
        uint256 ownerBefore = vault.owner().balance;
        uint256 factoryBefore = vault.factory().balance;

        vault.withdraw();

        assertEq(vault.owner().balance - ownerBefore, 99);
        assertEq(vault.factory().balance - factoryBefore, 0);
    }

    function test_withdrawERC20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(vault), 100);

        vault.withdrawERC20(address(token));
        assertEq(token.balanceOf(vault.owner()), 99);
        assertEq(token.balanceOf(vault.factory()), 1);
    }

    function test_withdrawERC20_emitsEvent() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(vault), 100);

        uint256 expectedFee = 1;
        uint256 expectedAmount = 99;

        vm.expectEmit(true, true, true, true);
        emit Withdraw(expectedAmount, expectedFee, vault.owner(), vault.factory(), address(token));

        vault.withdrawERC20(address(token));
    }

    function test_withdrawERC20_zeroBalance() public {
        ERC20Mock token = new ERC20Mock();

        uint256 ownerBefore = token.balanceOf(vault.owner());
        uint256 factoryBefore = token.balanceOf(vault.factory());

        vault.withdrawERC20(address(token));

        assertEq(token.balanceOf(vault.owner()), ownerBefore);
        assertEq(token.balanceOf(vault.factory()), factoryBefore);
    }

    function test_withdrawERC20_anyoneCanCall() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(vault), 100);

        vm.prank(alice);
        vault.withdrawERC20(address(token));

        assertEq(token.balanceOf(vault.owner()), 99);
        assertEq(token.balanceOf(vault.factory()), 1);
    }

    function test_withdrawERC20_smallAmountNoFee() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(address(vault), 99);

        vault.withdrawERC20(address(token));

        assertEq(token.balanceOf(vault.owner()), 99);
        assertEq(token.balanceOf(vault.factory()), 0);
    }

    function test_withdrawERC20_multipleTokens() public {
        ERC20Mock token1 = new ERC20Mock();
        ERC20Mock token2 = new ERC20Mock();
        ERC20Mock token3 = new ERC20Mock();

        token1.mint(address(vault), 1000);
        token2.mint(address(vault), 2000);
        token3.mint(address(vault), 3000);

        vault.withdrawERC20(address(token1));
        vault.withdrawERC20(address(token2));
        vault.withdrawERC20(address(token3));

        assertEq(token1.balanceOf(vault.owner()), 990);
        assertEq(token1.balanceOf(vault.factory()), 10);

        assertEq(token2.balanceOf(vault.owner()), 1980);
        assertEq(token2.balanceOf(vault.factory()), 20);

        assertEq(token3.balanceOf(vault.owner()), 2970);
        assertEq(token3.balanceOf(vault.factory()), 30);
    }

    function test_receive_acceptsEther() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        (bool success,) = address(vault).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(vault).balance, 1 ether);
    }

    function test_multipleVaults_independentOwnership() public {
        vm.prank(alice);
        xByteVault aliceVault = xByteVault(payable(factory.createVault()));

        vm.prank(bob);
        xByteVault bobVault = xByteVault(payable(factory.createVault()));

        assertEq(aliceVault.owner(), alice);
        assertEq(bobVault.owner(), bob);
        assertEq(aliceVault.factory(), address(factory));
        assertEq(bobVault.factory(), address(factory));
    }

    function test_multipleVaults_independentWithdrawals() public {
        vm.prank(alice);
        xByteVault aliceVault = xByteVault(payable(factory.createVault()));

        vm.prank(bob);
        xByteVault bobVault = xByteVault(payable(factory.createVault()));

        vm.deal(address(aliceVault), 1000);
        vm.deal(address(bobVault), 2000);

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;
        uint256 factoryBefore = address(factory).balance;

        aliceVault.withdraw();
        bobVault.withdraw();

        assertEq(alice.balance - aliceBefore, 990);
        assertEq(bob.balance - bobBefore, 1980);
        assertEq(address(factory).balance - factoryBefore, 30);
    }

    function test_multipleVaults_crossVaultWithdrawal() public {
        vm.prank(alice);
        xByteVault aliceVault = xByteVault(payable(factory.createVault()));

        vm.deal(address(aliceVault), 1000);
        uint256 aliceBefore = alice.balance;

        vm.prank(bob);
        aliceVault.withdraw();

        assertEq(alice.balance - aliceBefore, 990);
    }

    function testFuzz_withdrawNative(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 100000 ether);

        vm.deal(address(vault), amount);
        uint256 expectedFee = (amount * COMMISSION_FEE) / 100;
        uint256 expectedAmount = amount - expectedFee;

        uint256 ownerBefore = vault.owner().balance;
        uint256 factoryBefore = vault.factory().balance;

        vault.withdraw();

        assertEq(vault.owner().balance - ownerBefore, expectedAmount);
        assertEq(vault.factory().balance - factoryBefore, expectedFee);
    }

    function testFuzz_withdrawERC20(uint256 amount) public {
        vm.assume(amount > 0 && amount <= type(uint128).max);

        ERC20Mock token = new ERC20Mock();
        token.mint(address(vault), amount);

        uint256 expectedFee = (amount * COMMISSION_FEE) / 100;
        uint256 expectedAmount = amount - expectedFee;

        vault.withdrawERC20(address(token));

        assertEq(token.balanceOf(vault.owner()), expectedAmount);
        assertEq(token.balanceOf(vault.factory()), expectedFee);
    }

    function testFuzz_commissionFeeCalculation(uint256 amount) public pure {
        vm.assume(amount <= type(uint256).max / 100);

        uint256 fee = (amount * COMMISSION_FEE) / 100;
        uint256 remaining = amount - fee;

        assertEq(fee + remaining, amount);
    }

    function test_withdraw_revert_reentrancy() public {
        ReentrantVaultAttacker attacker = new ReentrantVaultAttacker();

        xByteVault _vaultImpl = new xByteVault();
        xByteRelay _relay = new xByteRelay(address(_vaultImpl));
        xByteFactory _factory = new xByteFactory(address(_relay));

        vm.prank(address(attacker));
        xByteVault attackerVault = xByteVault(payable(_factory.createVault()));

        attacker.setVault(attackerVault);
        vm.deal(address(attackerVault), 1 ether);

        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        attacker.attack();
    }

    receive() external payable {}
}

contract ReentrantVaultAttacker {
    xByteVault public vault;

    function setVault(xByteVault vault_) external {
        vault = vault_;
    }

    function attack() external {
        vault.withdraw();
    }

    receive() external payable {
        vault.withdraw();
    }
}
