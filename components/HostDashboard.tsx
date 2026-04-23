import React, { useState } from 'react';
import { Property, Booking, Review, User } from '../types';
import { BarChart3, Calendar, MessageSquare, Star, Users, DollarSign, Edit2, Plus } from 'lucide-react';

interface HostDashboardProps {
  host: User;
  properties: Property[];
  bookings: Booking[];
  reviews: Review[];
  onEditProperty?: (property: Property) => void;
  onAddProperty?: () => void;
  onManageBooking?: (booking: Booking) => void;
  onUpdateProfile?: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  host,
  properties,
  bookings,
  reviews,
  onEditProperty,
  onAddProperty,
  onManageBooking,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings' | 'reviews'>('overview');

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalEarnings = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={host.profilePicture || '/placeholder.svg'}
                alt={host.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold">{host.name}</h1>
                <p className="text-gray-600">@{host.username}</p>
                {host.hostRating && (
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="fill-gray-900" size={18} />
                    <span className="font-semibold">
                      {host.hostRating.toFixed(1)} ({host.hostReviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onUpdateProfile}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              <Edit2 size={20} />
              Edit Profile
            </button>
          </div>

          {/* Host Stats */}
          {host.whatsappNumber && (
            <div className="text-sm text-gray-600 mb-4">
              WhatsApp: <a href={`https://wa.me/${host.whatsappNumber.replace(/\D/g, '')}`} 
                target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                {host.whatsappNumber}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {[
            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { id: 'properties' as const, label: 'Properties', icon: Users },
            { id: 'bookings' as const, label: 'Bookings', icon: Calendar },
            { id: 'reviews' as const, label: 'Reviews', icon: Star },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === id
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Bookings</p>
                    <p className="text-3xl font-bold">{confirmedBookings.length}</p>
                  </div>
                  <Calendar className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Earnings</p>
                    <p className="text-3xl font-bold">${totalEarnings.toLocaleString()}</p>
                  </div>
                  <DollarSign className="text-green-500" size={32} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Properties</p>
                    <p className="text-3xl font-bold">{properties.length}</p>
                  </div>
                  <Users className="text-purple-500" size={32} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg. Rating</p>
                    <p className="text-3xl font-bold">{averageRating}</p>
                  </div>
                  <Star className="text-yellow-500 fill-yellow-500" size={32} />
                </div>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
              {confirmedBookings.length === 0 ? (
                <p className="text-gray-600">No upcoming bookings</p>
              ) : (
                <div className="space-y-3">
                  {confirmedBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-semibold">{booking.checkInDate}</p>
                        <p className="text-sm text-gray-600">{booking.numberOfGuests} guest(s)</p>
                      </div>
                      <button
                        onClick={() => onManageBooking?.(booking)}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">My Properties</h2>
              <button
                onClick={onAddProperty}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                <Plus size={20} />
                Add Property
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="bg-white p-12 rounded-lg text-center">
                <p className="text-gray-600 mb-4">You haven&apos;t listed any properties yet.</p>
                <button
                  onClick={onAddProperty}
                  className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  List Your First Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white p-4 rounded-lg border hover:shadow-lg transition-shadow">
                    <img
                      src={property.images[0] || '/placeholder.svg'}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{property.location}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">${property.pricePerNight}</p>
                        <p className="text-gray-600 text-sm">per night</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="fill-gray-900" size={18} />
                        <span className="font-semibold">{property.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onEditProperty?.(property)}
                      className="w-full mt-4 border-2 border-gray-900 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Bookings</h2>
            {bookings.length === 0 ? (
              <div className="bg-white p-12 rounded-lg text-center">
                <p className="text-gray-600">No bookings yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Guest</th>
                      <th className="px-6 py-3 text-left font-semibold">Check-in</th>
                      <th className="px-6 py-3 text-left font-semibold">Check-out</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                      <th className="px-6 py-3 text-left font-semibold">Price</th>
                      <th className="px-6 py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold">Guest #{booking.guestId.slice(0, 8)}</td>
                        <td className="px-6 py-4">{booking.checkInDate}</td>
                        <td className="px-6 py-4">{booking.checkOutDate}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">${booking.totalPrice}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => onManageBooking?.(booking)}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Guest Reviews</h2>
            {reviews.length === 0 ? (
              <div className="bg-white p-12 rounded-lg text-center">
                <p className="text-gray-600">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{review.reviewer?.name || 'Guest'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
