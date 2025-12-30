/**
 * The address of the xByteFactory contract
 */
export const XBYTE_FACTORY_ADDRESS = "0x7cf0AeaC2E17fca480bc3A39c425E8Bef0324019";

/**
 * The ABI of the xByteFactory contract
 */
export const XBYTE_FACTORY_ABI = [
    {
        inputs: [{ internalType: "address", name: "vaultRelay_", type: "address" }],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    { inputs: [], name: "FailedCall", type: "error" },
    {
        inputs: [
            { internalType: "uint256", name: "balance", type: "uint256" },
            { internalType: "uint256", name: "needed", type: "uint256" },
        ],
        name: "InsufficientBalance",
        type: "error",
    },
    {
        inputs: [{ internalType: "address", name: "owner", type: "address" }],
        name: "OwnableInvalidOwner",
        type: "error",
    },
    {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "OwnableUnauthorizedAccount",
        type: "error",
    },
    {
        inputs: [{ internalType: "address", name: "token", type: "address" }],
        name: "SafeERC20FailedOperation",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
            { indexed: true, internalType: "address", name: "newOwner", type: "address" },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "owner", type: "address" },
            { indexed: true, internalType: "address", name: "vaultAddress", type: "address" },
        ],
        name: "VaultCreated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: true, internalType: "address", name: "owner", type: "address" },
            { indexed: true, internalType: "address", name: "token", type: "address" },
        ],
        name: "Withdraw",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: true, internalType: "address", name: "owner", type: "address" },
        ],
        name: "WithdrawNative",
        type: "event",
    },
    {
        inputs: [{ internalType: "address", name: "owner", type: "address" }],
        name: "computeVaultAddress",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "createVault",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "vaultRelay",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "vaults",
        outputs: [
            { internalType: "address", name: "vaultAddress", type: "address" },
            { internalType: "address", name: "owner", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
    },
    { inputs: [], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
    {
        inputs: [{ internalType: "address", name: "_token", type: "address" }],
        name: "withdrawERC20",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    { stateMutability: "payable", type: "receive" },
] as const;
