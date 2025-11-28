import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface MarketplaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarketplaceSearch({
  value,
  onChange,
  placeholder = 'Search auctions by item name...',
}: MarketplaceSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div
        className={`relative flex items-center gap-3 px-4 py-3 bg-black/30 border rounded-lg transition-all ${
          isFocused
            ? 'border-zama-primary/60 ring-1 ring-zama-primary/20'
            : 'border-gray-700'
        }`}
      >
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
