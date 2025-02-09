// lib/agent/baseProvider.ts
import { ethers } from 'ethers';
import { ExtendedCdpWalletProvider } from './types';
import { COMMON_TOKENS, AAVE_CONSTANTS } from './constants';

export class BaseProvider implements ExtendedCdpWalletProvider {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  public networkId: string;

  constructor(privateKey: string, networkId: string = 'base-sepolia') {
    this.networkId = networkId;
    const rpcUrl = networkId === 'base-mainnet' 
      ? 'https://mainnet.base.org'
      : 'https://sepolia.base.org';
    
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  public getAddress(): string {
    return this.wallet.address;
  }

  public async getBalance(): Promise<bigint> {
    const balance = await this.wallet.getBalance();
    return BigInt(balance.toString());
  }

  public async readContract(params: {
    address: `0x${string}`;
    abi: any[];
    functionName: string;
    args: unknown[];
  }): Promise<unknown> {
    const contract = new ethers.Contract(params.address, params.abi, this.provider);
    return await contract[params.functionName](...params.args);
  }

  public async sendTransaction(params: {
    to: `0x${string}`;
    value?: bigint;
    data?: `0x${string}`;
  }): Promise<`0x${string}`> {
    const tx = await this.wallet.sendTransaction({
      to: params.to,
      value: params.value ? ethers.BigNumber.from(params.value.toString()) : undefined,
      data: params.data
    });
    return tx.hash as `0x${string}`;
  }

  public async waitForTransactionReceipt(hash: string): Promise<{ status: number } | null> {
    const receipt = await this.provider.waitForTransaction(hash);
    return receipt ? { status: receipt.status ? 1 : 0 } : null;
  }

  // CDP Wallet Provider specific methods
  public async exportWallet(): Promise<string> {
    return JSON.stringify({
      address: this.getAddress(),
      networkId: this.networkId
    });
  }

  // Helper methods for common operations
  public async getTokenBalance(tokenAddress: string, decimals: number): Promise<number> {
    const balance = await this.readContract({
      address: tokenAddress as `0x${string}`,
      abi: [{
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function"
      }],
      functionName: "balanceOf",
      args: [this.getAddress()]
    }) as bigint;

    return Number(balance) / Math.pow(10, decimals);
  }

  public async getAavePoolData() {
    const constants = this.networkId === 'base-mainnet' 
      ? AAVE_CONSTANTS.BASE_MAINNET 
      : AAVE_CONSTANTS.BASE_SEPOLIA;

    return {
      poolAddress: constants.POOL_ADDRESS,
      dataProvider: constants.POOL_DATA_PROVIDER,
      addressesProvider: constants.POOL_ADDRESSES_PROVIDER
    };
  }

  // Static helper for initialization
  public static async initialize(config: {
    privateKey: string;
    networkId?: string;
  }): Promise<BaseProvider> {
    return new BaseProvider(
      config.privateKey,
      config.networkId || 'base-sepolia'
    );
  }
}