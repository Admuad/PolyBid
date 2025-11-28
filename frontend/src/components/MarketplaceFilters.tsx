import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface FilterOptions {
  timeRange: 'all' | '1h' | '24h' | '7d' | '30d';
  priceRange: {
    min: number;
    max: number;
  };
  category: string[];
  status: 'all' | 'active' | 'past';
}

interface MarketplaceFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const CATEGORIES = [
  'Art & Collectibles',
  'Electronics',
  'Jewelry & Watches',
  'Antiques',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Luxury Goods',
  'Rare Items',
  'Other',
];

const TIME_RANGES = [
  { value: '1h', label: 'Ending in 1 hour' },
  { value: '24h', label: 'Ending in 24 hours' },
  { value: '7d', label: 'Ending in 7 days' },
  { value: '30d', label: 'Ending in 30 days' },
  { value: 'all', label: 'All auctions' },
];

export function MarketplaceFilters({ filters, onFilterChange }: MarketplaceFiltersProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleTimeChange = (value: string) => {
    onFilterChange({
      ...filters,
      timeRange: value as FilterOptions['timeRange'],
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      priceRange: { min, max },
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter((c) => c !== category)
      : [...filters.category, category];
    onFilterChange({
      ...filters,
      category: newCategories,
    });
  };

  const handleStatusChange = (status: FilterOptions['status']) => {
    onFilterChange({
      ...filters,
      status,
    });
  };

  const resetFilters = () => {
    onFilterChange({
      timeRange: 'all',
      priceRange: { min: 0, max: 1000000 },
      category: [],
      status: 'all',
    });
  };

  const activeFiltersCount =
    (filters.timeRange !== 'all' ? 1 : 0) +
    filters.category.length +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.priceRange.min > 0 || filters.priceRange.max < 1000000 ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Header with reset button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-zama-primary text-black px-2 py-1 rounded-full text-xs font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-zama-primary hover:text-white transition-colors flex items-center gap-1 cursor-target"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="card-zama">
        <button
          onClick={() => setExpandedSection(expandedSection === 'status' ? null : 'status')}
          className="w-full flex items-center justify-between text-left cursor-target"
        >
          <h4 className="font-semibold text-white">Auction Status</h4>
          <ChevronDown
            className={`w-5 h-5 text-zama-primary transition-transform ${
              expandedSection === 'status' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSection === 'status' && (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-700">
            {['all', 'active', 'past'].map((status) => (
              <label key={status} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={filters.status === status}
                  onChange={(e) => handleStatusChange(e.target.value as FilterOptions['status'])}
                  className="w-4 h-4 cursor-pointer accent-zama-primary"
                />
                <span className="text-gray-300 text-sm capitalize">{status === 'all' ? 'All Auctions' : `${status} Auctions`}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Time Range Filter */}
      <div className="card-zama">
        <button
          onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
          className="w-full flex items-center justify-between text-left cursor-target"
        >
          <h4 className="font-semibold text-white">Ending Time</h4>
          <ChevronDown
            className={`w-5 h-5 text-zama-primary transition-transform ${
              expandedSection === 'time' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSection === 'time' && (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-700">
            {TIME_RANGES.map((range) => (
              <label key={range.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="timeRange"
                  value={range.value}
                  checked={filters.timeRange === range.value}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-4 h-4 cursor-pointer accent-zama-primary"
                />
                <span className="text-gray-300 text-sm">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="card-zama">
        <button
          onClick={() => setExpandedSection(expandedSection === 'price' ? null : 'price')}
          className="w-full flex items-center justify-between text-left cursor-target"
        >
          <h4 className="font-semibold text-white">Price Range</h4>
          <ChevronDown
            className={`w-5 h-5 text-zama-primary transition-transform ${
              expandedSection === 'price' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSection === 'price' && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Min Price (ETH)</label>
              <input
                type="number"
                min="0"
                value={filters.priceRange.min}
                onChange={(e) =>
                  handlePriceChange(Number(e.target.value), filters.priceRange.max)
                }
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zama-primary"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Max Price (ETH)</label>
              <input
                type="number"
                min="0"
                value={filters.priceRange.max}
                onChange={(e) =>
                  handlePriceChange(filters.priceRange.min, Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zama-primary"
                placeholder="1000000"
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="card-zama">
        <button
          onClick={() => setExpandedSection(expandedSection === 'category' ? null : 'category')}
          className="w-full flex items-center justify-between text-left cursor-target"
        >
          <h4 className="font-semibold text-white">Category</h4>
          <ChevronDown
            className={`w-5 h-5 text-zama-primary transition-transform ${
              expandedSection === 'category' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSection === 'category' && (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-700 max-h-64 overflow-y-auto">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 cursor-pointer accent-zama-primary"
                />
                <span className="text-gray-300 text-sm">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Badge */}
      <div className="card-zama bg-zama-primary/10 border-zama-primary/30">
        <p className="text-xs text-gray-300 mb-2">🔐 All auctions on this platform are protected with Fully Homomorphic Encryption for complete bid privacy.</p>
        <p className="text-xs text-zama-primary font-semibold">Your bids are encrypted end-to-end</p>
      </div>
    </div>
  );
}
