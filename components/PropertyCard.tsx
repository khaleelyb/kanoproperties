import React, { useState } from 'react';
import { Property } from '../types';
import { Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onSave?: (propertyId: string) => void;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved = false,
  onSave,
  onClick,
}) => {
  const [imageIndex, setImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(property.id);
  };

  const priceDisplay = `$${property.pricePerNight}`;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Carousel */}
      <div className="relative w-full h-64 bg-gray-200 overflow-hidden group">
        <img
          src={property.images[imageIndex] || '/placeholder.svg'}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Image Navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {/* Image Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {property.images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                idx === imageIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          aria-label="Save property"
        >
          <Heart
            size={20}
            className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}
          />
        </button>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">
          {property.title}
        </h3>

        {/* Location */}
        <p className="text-gray-600 text-sm mt-1">{property.location}</p>

        {/* Property Features */}
        <div className="flex gap-3 mt-3 text-sm text-gray-600">
          <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{property.bathrooms} bath</span>
          <span>•</span>
          <span>{property.guestCapacity} guest{property.guestCapacity !== 1 ? 's' : ''}</span>
        </div>

        {/* Rating */}
        {property.rating > 0 && (
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="font-semibold">★ {property.rating.toFixed(1)}</span>
            <span className="text-gray-600">({property.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex justify-between items-baseline">
          <span className="text-xl font-bold text-gray-900">{priceDisplay}</span>
          <span className="text-gray-600 text-sm">per night</span>
        </div>
      </div>
    </div>
  );
};
