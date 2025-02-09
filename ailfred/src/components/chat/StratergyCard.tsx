import { Strategy } from '@/lib/agent/types';

interface StrategyCardProps {
  strategy: Strategy;
}

export default function StrategyCard({ strategy }: StrategyCardProps) {
  const riskColors = {
    low: 'bg-green-900/20 text-green-400',
    medium: 'bg-yellow-900/20 text-yellow-400',
    high: 'bg-red-900/20 text-red-400'
  };

  return (
    <div className={`
      p-3 
      rounded-sm 
      bg-chat-dark 
      border 
      border-chat
      hover:border-gray-700 
      transition-colors 
      duration-200
      ${!strategy.isAvailable && 'opacity-50'}
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-medium">
          {strategy.name}
        </h3>
        <span className={`
          px-2 
          py-0.5 
          text-xs 
          rounded-sm
          ${riskColors[strategy.riskLevel]}
        `}>
          {strategy.riskLevel.charAt(0).toUpperCase() + strategy.riskLevel.slice(1)} Risk
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-xs mb-3">
        {strategy.description}
      </p>

      {/* Details */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Expected APY</span>
          <span className="text-gray-300">{strategy.expectedApy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Protocol</span>
          <span className="text-gray-300">{strategy.protocol}</span>
        </div>
        {strategy.requirements?.minimumAmount && (
          <div className="flex justify-between">
            <span className="text-gray-500">Minimum</span>
            <span className="text-gray-300">
              {strategy.requirements.minimumAmount} {strategy.requirements.token || 'USD'}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        disabled={!strategy.isAvailable}
        className={`
          w-full
          mt-3
          px-3
          py-1.5
          text-sm
          bg-white
          text-black
          rounded-sm
          hover:bg-gray-200
          transition-colors
          duration-200
          disabled:opacity-50
          disabled:cursor-not-allowed
        `}
      >
        {strategy.isAvailable ? 'Execute Strategy' : 'Coming Soon'}
      </button>
    </div>
  );
} 