import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { MapPin, Filter, ChevronDown } from 'lucide-react';

interface PropertiesPageProps {
  properties: Property[];
  savedPropertyIds?: Set<string>;
  onPropertySelect?: (property: Property) => void;
  onSaveProperty?: (propertyId: string) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  properties,
  savedPropertyIds = new Set(),
  onPropertySelect,
  onSaveProperty,
}) => {
  const [searchLocation, setSearchLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [guestCapacity, setGuestCapacity] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('price-low');

  const filteredAndSorted = useMemo(() => {
    let filtered = properties.filter((prop) => {
      const matchesLocation =
        !searchLocation ||
        prop.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        prop.title.toLowerCase().includes(searchLocation.toLowerCase());

      const matchesPrice = prop.pricePerNight >= priceRange[0] && prop.pricePerNight <= priceRange[1];

      const matchesBedrooms = bedrooms === null || prop.bedrooms === bedrooms;

      const matchesGuests = guestCapacity === null || prop.guestCapacity >= guestCapacity;

      return matchesLocation && matchesPrice && matchesBedrooms && matchesGuests;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerNight - b.pricePerNight;
      if (sortBy === 'price-high') return b.pricePerNight - a.pricePerNight;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

    return filtered;
  }, [properties, searchLocation, priceRange, bedrooms, guestCapacity, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 p-4 space-y-4">
        <h1 className="text-2xl font-bold">Properties</h1>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by location or title..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-semibold"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Price per Night: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-semibold mb-3">Bedrooms</label>
              <div className="flex gap-2">
                {[null, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBedrooms(num)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      bedrooms === num
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {num === null ? 'Any' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Capacity */}
            <div>
              <label className="block text-sm font-semibold mb-3">Guests</label>
              <div className="flex gap-2">
                {[null, 1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setGuestCapacity(num)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      guestCapacity === num
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {num === null ? 'Any' : num}+
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold mb-3">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchLocation('');
                setPriceRange([0, 5000]);
                setBedrooms(null);
                setGuestCapacity(null);
                setSortBy('price-low');
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-900 font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          {filteredAndSorted.length} propert{filteredAndSorted.length === 1 ? 'y' : 'ies'} found
        </p>

        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSorted.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isSaved={savedPropertyIds.has(property.id)}
                onSave={onSaveProperty}
                onClick={() => onPropertySelect?.(property)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
