import { UserPortfolio } from '@/lib/agent/types';

interface PortfolioViewProps {
  portfolio: UserPortfolio;
}

export default function PortfolioView({ portfolio }: PortfolioViewProps) {
  // Group positions by protocol
  const groupedPositions = portfolio.positions.reduce((acc, pos) => {
    if (!acc[pos.protocol]) acc[pos.protocol] = [];
    acc[pos.protocol].push(pos);
    return acc;
  }, {} as Record<string, typeof portfolio.positions>);

  return (
    <div className="bg-chat-dark rounded-sm p-3 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">
          Portfolio Overview
        </h3>
        <span className="text-gray-400 text-sm">
          Total Value: ${portfolio.totalValue.toLocaleString()}
        </span>
      </div>

      {/* Risk Profile */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-chat-darker rounded-sm text-sm">
        <div>
          <span className="text-gray-500 text-xs">Risk Tolerance</span>
          <p className="text-gray-300 capitalize">{portfolio.riskProfile.riskTolerance}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Investment Horizon</span>
          <p className="text-gray-300 capitalize">{portfolio.riskProfile.investmentHorizon}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Investment Amount</span>
          <p className="text-gray-300">${portfolio.riskProfile.investmentAmount.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Preferred Strategies</span>
          <p className="text-gray-300 text-xs">
            {portfolio.riskProfile.preferredStrategies.length 
              ? portfolio.riskProfile.preferredStrategies.join(', ') 
              : 'None specified'}
          </p>
        </div>
      </div>

      {/* Positions by Protocol */}
      <div className="space-y-3">
        {Object.entries(groupedPositions).map(([protocol, positions]) => (
          <div key={protocol} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">
              {protocol} Positions
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {positions.map((position, index) => (
                <div 
                  key={`${position.asset}-${index}`}
                  className="p-3 bg-chat-darker rounded-sm space-y-1.5"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{position.type}</span>
                    <span className="text-gray-300">
                      {position.amount} {position.asset}
                    </span>
                  </div>
                  {/* Protocol-specific details */}
                  {protocol === 'AAVE' && typeof position.details.healthFactor === 'number' && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Health Factor</span>
                      <span className="text-gray-300">{position.details.healthFactor}</span>
                    </div>
                  )}
                  {protocol === 'Uniswap' && (
                    <>
                      {typeof position.details.isInRange === 'boolean' && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">In Range</span>
                          <span className={position.details.isInRange ? 'text-green-400' : 'text-red-400'}>
                            {position.details.isInRange ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      {typeof position.details.unclaimedFees === 'number' && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Unclaimed Fees</span>
                          <span className="text-gray-300">
                            ${position.details.unclaimedFees.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 