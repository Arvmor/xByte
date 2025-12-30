import { Abi, Address, createPublicClient, encodeFunctionData, getContract, http } from "viem";
import { XBYTE_FACTORY_ABI, XBYTE_FACTORY_ADDRESS } from "./abi";
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
    signatureWithdrawERC20() {
        return this.getSignature({
            abi: XBYTE_FACTORY_ABI,
            functionName: "withdrawERC20",
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
}
