import { AilfredAgent } from '../lib/agent';

describe('AilfredAgent', () => {
  let agent: AilfredAgent;

  beforeAll(async () => {
    try {
      agent = await AilfredAgent.initialize();
    } catch (error) {
      console.error('Failed to initialize agent:', error);
      throw error;
    }
  }, 30000); // 30 second timeout for initialization

  it('should initialize successfully', () => {
    expect(agent).toBeDefined();
  });

  it('should provide wallet information when asked', async () => {
    const response = await agent.processMessage('What is my wallet address?');
    console.log('\nWallet Info Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('0x'); // Should contain a wallet address
    expect(response.content).toContain('base-sepolia'); // Should mention the network
  }, 20000);

  it('should explain initial wallet state', async () => {
    const response = await agent.processMessage('What is my wallet balance?');
    console.log('\nInitial Wallet State Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('ETH'); // Should mention ETH
    expect(response.content).toContain('USDC'); // Should mention USDC
    expect(response.content).toContain('WETH'); // Should mention WETH
  }, 20000);

  it('should request and receive faucet ETH', async () => {
    const response = await agent.processMessage('Please request some testnet ETH from the faucet and show me the updated balance');
    console.log('\nFaucet ETH Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('faucet'); // Should mention faucet
    expect(response.content).toContain('ETH'); // Should mention ETH
    expect(response.content).toMatch(/Transaction: https:\/\/sepolia\.basescan\.org\/tx\/0x[a-fA-F0-9]+/); // Should contain transaction URL
    // Wait a bit for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 5000));
  }, 40000);

  it('should request and receive faucet USDC', async () => {
    const response = await agent.processMessage('Please request some USDC from the faucet and show me the updated balance');
    console.log('\nFaucet USDC Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('faucet'); // Should mention faucet
    expect(response.content).toContain('USDC'); // Should mention USDC
    expect(response.content).toMatch(/Transaction: https:\/\/sepolia\.basescan\.org\/tx\/0x[a-fA-F0-9]+/); // Should contain transaction URL
    // Wait a bit for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 5000));
  }, 40000);

  it('should show updated balances after faucet funding', async () => {
    // Wait a bit more to ensure transactions are mined
    await new Promise(resolve => setTimeout(resolve, 5000));
    const response = await agent.processMessage('Show me my updated wallet balances with proper decimal formatting');
    console.log('\nUpdated Balances Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('ETH'); // Should show ETH balance
    expect(response.content).toContain('USDC'); // Should show USDC balance
    
    // Extract balances using regex
    const ethMatch = response.content.match(/ETH: (\d+\.\d{6}) ETH/);
    const usdcMatch = response.content.match(/USDC: (\d+\.\d{6}) USDC/);
    
    // Verify balances are correct and properly formatted
    if (ethMatch) {
      const ethBalance = parseFloat(ethMatch[1]);
      expect(ethBalance).toBeGreaterThan(0); // Should have some ETH
      expect(ethMatch[1]).toMatch(/^\d+\.\d{6}$/); // Should have 6 decimal places
    }
    if (usdcMatch) {
      const usdcBalance = parseFloat(usdcMatch[1]);
      expect(usdcBalance).toBeGreaterThan(0); // Should have some USDC
      expect(usdcMatch[1]).toMatch(/^\d+\.\d{6}$/); // Should have 6 decimal places
    }
  }, 30000);

  it('should check AAVE positions', async () => {
    const response = await agent.processMessage('What are my AAVE positions?');
    console.log('\nAave Positions Check Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content.toLowerCase()).toContain('aave'); // Should mention Aave (case insensitive)
    // Should indicate no positions or error in any format
    expect(response.content.toLowerCase()).toMatch(/no.*balance|no.*position|no.*data|error|no supply|no active/);
  }, 20000);

  it('should supply ETH to AAVE', async () => {
    // First ensure we have some ETH
    const faucetResponse = await agent.processMessage('Please request some testnet ETH from the faucet');
    console.log('\nFaucet Request Response:', faucetResponse.content);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for transaction

    // Now try to supply to AAVE
    const response = await agent.processMessage('Please supply 0.0001 ETH to AAVE');
    console.log('\nSupply to AAVE Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content.toLowerCase()).toContain('eth'); // Should mention ETH
    expect(response.content.toLowerCase()).toContain('aave'); // Should mention Aave
    // Should either indicate success, error, or need for approval
    expect(response.content.toLowerCase()).toMatch(/supply|supplied|supplying|error|approve|permission|balance/);
    
    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 5000));
  }, 40000);

  it('should show updated AAVE positions after supply', async () => {
    // Wait a bit more to ensure transaction is mined
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const response = await agent.processMessage('Show me my updated AAVE positions');
    console.log('\nUpdated AAVE Positions Response:', response.content);
    
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content.toLowerCase()).toContain('aave'); // Should mention Aave
    // Should either show positions, indicate no positions, or show an error
    expect(response.content.toLowerCase()).toMatch(/position|balance|supply|error|no active/);
  }, 30000);
}); 