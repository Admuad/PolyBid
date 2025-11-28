import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface AuctionSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  variant?: 'default' | 'featured';
}

export function AuctionSection({
  title,
  description,
  icon,
  children,
  isEmpty = false,
  emptyMessage = 'No auctions found',
  variant = 'default',
}: AuctionSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {icon && <div className="text-zama-primary">{icon}</div>}
            <h2 className={`${variant === 'featured' ? 'text-3xl' : 'text-2xl'} font-bold text-white`}>
              {title}
            </h2>
          </div>
          {description && (
            <p className="text-sm text-gray-400 ml-0">{description}</p>
          )}
        </div>
        <ChevronRight className="w-6 h-6 text-gray-600 mt-2" />
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className={`text-center py-12 ${variant === 'featured' ? 'bg-zama-primary/5 rounded-2xl border border-zama-primary/20' : 'card-zama'}`}>
          <p className="text-gray-400 text-lg mb-2">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      )}
    </div>
  );
}
