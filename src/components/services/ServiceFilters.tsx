import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface ServiceFiltersProps {
  categories: any[];
  onFilterChange: (filters: any) => void;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({ categories, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 5000 },
    deliveryTime: '',
    rating: 0,
    level: '',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceRange: { min: 0, max: 5000 },
      deliveryTime: '',
      rating: 0,
      level: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4 space-y-6`}>
        {/* Clear Filters */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span>Clear all</span>
          </button>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min || ''}
              onChange={(e) => handleFilterChange('priceRange', {
                ...filters.priceRange,
                min: parseInt(e.target.value) || 0
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max || ''}
              onChange={(e) => handleFilterChange('priceRange', {
                ...filters.priceRange,
                max: parseInt(e.target.value) || 5000
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Delivery Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Time
          </label>
          <select
            value={filters.deliveryTime}
            onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lng focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Time</option>
            <option value="1">Express 24H</option>
            <option value="3">Up to 3 days</option>
            <option value="7">Up to 7 days</option>
            <option value="14">Up to 14 days</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seller Rating
          </label>
          <div className="space-y-2">
            {[4.5, 4, 3.5, 3].map((rating) => (
              <label key={rating} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{rating}+ stars</span>
              </label>
            ))}
          </div>
        </div>

        {/* Seller Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seller Level
          </label>
          <div className="space-y-2">
            {['Top Rated', 'Level 2', 'Level 1', 'New Seller'].map((level) => (
              <label key={level} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="level"
                  value={level}
                  checked={filters.level === level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;