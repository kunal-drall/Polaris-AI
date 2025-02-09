import { CdpWalletProvider } from "@coinbase/agentkit";

export interface Network {
  protocolFamily: "evm";
  chainId: string;
  networkId: string;
}

export interface RiskProfile {
  riskTolerance: 'low' | 'medium' | 'high' | 'ask';
  investmentHorizon: 'short' | 'medium' | 'long';
  investmentAmount: number;
  preferredStrategies: string[];
  needsRiskAssessment: boolean;
}

export interface PortfolioPosition {
  protocol: string;
  type: string;
  amount: number;
  asset: string;
  details: {
    healthFactor?: number;  // AAVE specific
    isInRange?: boolean;    // Uniswap specific
    unclaimedFees?: number; // Uniswap specific
  };
}

export interface UserPortfolio {
  riskProfile: RiskProfile;
  positions: Position[];
  totalValue: number;
}

export interface Position {
  protocol: string;
  type: string;
  asset: string;
  amount: number;
  details: Record<string, unknown>;
}

export interface AavePosition {
  healthFactor: number;
  totalCollateral: number;
  totalDebt: number;
  availableBorrowsBase: number;
  liquidationThreshold: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  protocol: string;
  expectedApy: string;
  isAvailable: boolean;
  requirements?: {
    minimumAmount?: number;
    token?: string;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  strategies?: Strategy[];
  portfolio?: UserPortfolio;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error?: string;
}

// Update the ExtendedCdpWalletProvider interface
export type ExtendedCdpWalletProvider = CdpWalletProvider & {
  getAddress(): string;
  getBalance(): Promise<bigint>;
  readContract(params: ContractParams): Promise<unknown>;
  sendTransaction(params: TransactionParams): Promise<string>;
  waitForTransactionReceipt(hash: string): Promise<TransactionReceipt | null>;
  networkId: string;
};

interface ContractParams {
  address: `0x${string}`;
  abi: ContractFunction[];
  functionName: string;
  args: unknown[];
}

interface ContractFunction {
  inputs: FunctionParameter[];
  name: string;
  outputs: FunctionParameter[];
  stateMutability: string;
  type: string;
}

interface FunctionParameter {
  name?: string;
  type: string;
}

interface TransactionParams {
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
}

interface TransactionReceipt {
  status: number;
}

// Protocol Types
export interface AaveReserveData {
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  baseLTVasCollateral: number;
  reserveLiquidationThreshold: number;
  reserveLiquidationBonus: number;
  reserveFactor: number;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  liquidityIndex: number;
  variableBorrowIndex: number;
  liquidityRate: number;
  variableBorrowRate: number;
  aTokenAddress: string;
  variableDebtTokenAddress: string;
  availableLiquidity: number;
  totalScaledVariableDebt: number;
  isPaused: boolean;
  borrowCap: number;
  supplyCap: number;
}

export interface AaveUserReserveData {
  underlyingAsset: string;
  scaledATokenBalance: number;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: number;
} 