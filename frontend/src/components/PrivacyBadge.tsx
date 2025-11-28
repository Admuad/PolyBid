import { Lock, CheckCircle, Eye, TrendingUp } from 'lucide-react';

interface PrivacyBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'card';
}

export function PrivacyBadge({ size = 'md', variant = 'inline' }: PrivacyBadgeProps) {
  if (variant === 'card') {
    return (
      <div className="bg-zama-primary/10 border border-zama-primary/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-zama-primary" />
          <span className="text-sm font-semibold text-white">FHE Privacy Verified</span>
        </div>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Fully encrypted bids</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Zero front-running protection</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>On-chain verifiable</span>
          </li>
        </ul>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 bg-zama-primary/20 text-zama-primary rounded-full font-semibold whitespace-nowrap ${sizeClasses[size]}`}
    >
      <Lock className={size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} />
      FHE Protected
    </span>
  );
}

export function TrendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 rounded-full text-sm px-3 py-1.5 font-semibold whitespace-nowrap">
      <TrendingUp className="w-4 h-4" />
      Trending
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm px-3 py-1.5 font-semibold whitespace-nowrap">
      ⭐ Featured
    </span>
  );
}

export function AnonymousBidgeBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 rounded-full text-sm px-3 py-1.5 font-semibold whitespace-nowrap">
      <Eye className="w-4 h-4" />
      Anonymous Bidding
    </span>
  );
}
