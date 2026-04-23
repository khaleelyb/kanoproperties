import React, { useState } from 'react';
import { Property, User, Review } from '../types';
import { Star, MapPin, Users, Bed, Bath, Wifi, Coffee, Wind, X, MessageCircle } from 'lucide-react';

interface PropertyDetailPageProps {
  property: Property;
  host: User | null;
  reviews: Review[];
  onBooking?: () => void;
  onContact?: () => void;
  onClose?: () => void;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={20} />,
  kitchen: <Coffee size={20} />,
  ac: <Wind size={20} />,
};

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  host,
  reviews = [],
  onBooking,
  onContact,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const displayedAmenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="bg-white min-h-screen max-w-3xl mx-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4 z-10">
          <h1 className="text-xl font-semibold">Property Details</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image Gallery */}
        <div className="relative w-full bg-gray-200">
          <div className="aspect-video overflow-hidden">
            <img
              src={property.images[selectedImageIndex] || '/placeholder.svg'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev === 0 ? property.images.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev === property.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {property.images.length}
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b">
          {property.images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                idx === selectedImageIndex ? 'border-gray-900' : 'border-gray-300'
              }`}
            >
              <img src={image} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Title and Rating */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="fill-gray-900" size={20} />
                <span className="font-semibold">
                  {property.rating.toFixed(1)} ({property.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={20} />
                {property.location}
              </div>
            </div>
          </div>

          {/* Host Info */}
          {host && (
            <div className="border-t border-b py-4">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={host.profilePicture || '/placeholder.svg'}
                  alt={host.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{host.name}</h3>
                  <p className="text-gray-600 text-sm">Superhost</p>
                  {host.responseRate && (
                    <p className="text-gray-600 text-sm">
                      {Math.round(host.responseRate * 100)}% Response Rate
                    </p>
                  )}
                </div>
              </div>
              {host.whatsappNumber && (
                <a
                  href={`https://wa.me/${host.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle size={18} />
                  Contact via WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Property Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Bed size={24} className="text-gray-600" />
              <div>
                <p className="text-gray-600 text-sm">Bedrooms</p>
                <p className="font-semibold">{property.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bath size={24} className="text-gray-600" />
              <div>
                <p className="text-gray-600 text-sm">Bathrooms</p>
                <p className="font-semibold">{property.bathrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={24} className="text-gray-600" />
              <div>
                <p className="text-gray-600 text-sm">Guests</p>
                <p className="font-semibold">{property.guestCapacity}</p>
              </div>
            </div>
          </div>

          {/* Check-in/Check-out */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Check-in & Check-out</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Check-in after</p>
                <p className="font-semibold">{property.checkInTime}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Check-out by</p>
                <p className="font-semibold">{property.checkOutTime}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xl font-semibold mb-3">About this place</h4>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="text-xl font-semibold mb-3">Amenities</h4>
            <div className="grid grid-cols-2 gap-3">
              {displayedAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  {amenityIcons[amenity.toLowerCase()] || <span>•</span>}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
            {property.amenities.length > 5 && !showAllAmenities && (
              <button
                onClick={() => setShowAllAmenities(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Show all amenities
              </button>
            )}
          </div>

          {/* House Rules */}
          {property.houseRules && (
            <div>
              <h4 className="text-xl font-semibold mb-3">House Rules</h4>
              <p className="text-gray-700">{property.houseRules}</p>
            </div>
          )}

          {/* Cancellation Policy */}
          <div>
            <h4 className="text-xl font-semibold mb-3">Cancellation Policy</h4>
            <p className="text-gray-700 capitalize">{property.cancellationPolicy}</p>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold mb-3">Reviews</h4>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{review.reviewer?.name || 'Guest'}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="fill-gray-900" size={16} />
                          {review.rating}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button
            onClick={onContact}
            className="flex-1 border-2 border-gray-900 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Contact Host
          </button>
          <button
            onClick={onBooking}
            className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
