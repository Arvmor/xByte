import { Abi, Address, createPublicClient, encodeFunctionData, getContract, http } from "viem";
import { XBYTE_FACTORY_ABI, XBYTE_FACTORY_ADDRESS, ERC20_ABI, XBYTE_VAULT_ABI } from "./abi";
import { baseSepolia } from "viem/chains";

/**
 * The default RPC URL for the Base Sepolia chain
 */
const DEFAULT_RPC_URL = "https://sepolia.base.org";

/**
 * The client for the xByte EVM contracts
 */
export class xByteEvmClient {
    /**
     * The public client for the Base Sepolia chain
     */
    private readonly publicClient;

    /**
     * The contract for the xByteFactory
     */
    private readonly xByteFactory;

    /**
     * Create a new xByteClient
     * @param rpcUrl The URL of the RPC
     */
    constructor(rpcUrl?: string) {
        this.publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(rpcUrl ?? DEFAULT_RPC_URL),
        });
        this.xByteFactory = this.getContract({
            address: XBYTE_FACTORY_ADDRESS,
            abi: XBYTE_FACTORY_ABI,
        });
    }

    /**
     * Get a contract instance
     * @param address The address of the contract
     * @param abi The ABI of the contract
     * @returns The contract instance
     */
    private getContract({ address, abi }: { address: Address; abi: Abi }) {
        const client = this.publicClient;
        return getContract({ address, abi, client });
    }

    /**
     * Get a signature for a function
     * @param abi The ABI of the contract
     * @param functionName The name of the function
     * @param args The arguments of the function
     * @returns The signature of the function
     */
    private getSignature({
        abi,
        functionName,
        args,
    }: {
        abi: Abi;
        functionName: string;
        args?: any[];
    }) {
        return encodeFunctionData({
            abi,
            functionName,
            args,
        });
    }

    /**
     * Get a signature for the create vault function
     * @returns The signature for the create vault function
     */
    signatureCreateVault() {
        return this.getSignature({
            abi: XBYTE_FACTORY_ABI,
            functionName: "createVault",
        });
    }

    /**
     * Get a signature for the withdraw function
     * @returns The signature for the withdraw function
     */
    signatureWithdraw() {
        return this.getSignature({
            abi: XBYTE_FACTORY_ABI,
            functionName: "withdraw",
        });
    }

    /**
     * Get a signature for the withdraw ERC20 function
     * @returns The signature for the withdraw ERC20 function
     */
    signatureWithdrawERC20(tokenAddress: Address) {
        return this.getSignature({
            abi: XBYTE_FACTORY_ABI,
            functionName: "withdrawERC20",
            args: [tokenAddress],
        });
    }

    /**
     * Get the owner of the xByteFactory
     * @returns The owner of the xByteFactory
     */
    async getOwner(): Promise<Address> {
        const result = await this.xByteFactory.read.owner();
        return result as Address;
    }

    /**
     * Get the vault relay of the xByteFactory
     * @returns The vault relay of the xByteFactory
     */
    async getVaultRelay(): Promise<Address> {
        const result = await this.xByteFactory.read.vaultRelay();
        return result as Address;
    }

    /**
     * Get the vault of the owner
     * @param owner The owner of the vault
     * @returns The vault of the owner
     */
    async getVault(owner: Address): Promise<Address[]> {
        const result = await this.xByteFactory.read.vaults([owner]);
        return result as Address[];
    }

    /**
     * Get the computed vault address for the owner
     * @param owner The owner of the vault
     * @returns The computed vault address for the owner
     */
    async getComputeVaultAddress(owner: Address): Promise<Address> {
        const result = await this.xByteFactory.read.computeVaultAddress([owner]);
        return result as Address;
    }

    /**
     * Get the native balance of a vault
     * @param vaultAddress The address of the vault
     * @returns The native balance of the vault in wei
     */
    async getVaultBalance(vaultAddress: Address): Promise<bigint> {
        return await this.publicClient.getBalance({ address: vaultAddress });
    }

    /**
     * Get the ERC20 token balance of a vault
     * @param vaultAddress The address of the vault
     * @param tokenAddress The address of the ERC20 token
     * @returns The ERC20 token balance of the vault
     */
    async getVaultERC20Balance(vaultAddress: Address, tokenAddress: Address): Promise<bigint> {
        const tokenContract = this.getContract({
            address: tokenAddress,
            abi: ERC20_ABI,
        });
        const result = await tokenContract.read.balanceOf([vaultAddress]);
        return result as bigint;
    }

    /**
     * Get vault events (WithdrawNative and Withdraw)
     * @param vaultAddress The address of the vault
     * @param fromBlock The block number to start from
     * @returns Array of vault events
     */
    async getVaultEvents(address: Address, fromBlock?: bigint, toBlock?: bigint) {
        if (!fromBlock && !toBlock) {
            const latestBlock = await this.publicClient.getBlockNumber();
            toBlock = latestBlock;
            fromBlock = latestBlock - 100000n;
        }

        const withdrawNativeEvents = await this.publicClient.getLogs({
            address,
            event: XBYTE_VAULT_ABI.find((e) => e.type === "event" && e.name === "WithdrawNative"),
            fromBlock,
            toBlock,
        });

        const withdrawEvents = await this.publicClient.getLogs({
            address,
            event: XBYTE_VAULT_ABI.find((e) => e.type === "event" && e.name === "Withdraw"),
            fromBlock,
            toBlock,
        });

        return [...withdrawNativeEvents, ...withdrawEvents];
    }
}
