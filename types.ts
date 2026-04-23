// Property types
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  images: string[];
  pricePerNight: number;
  guestCapacity: number;
  bedrooms: number;
  bathrooms: number;
  hostId: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  houseRules?: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

// Booking types
export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guestMessage?: string;
  createdAt: string;
}

// Review types
export interface Review {
  id: string;
  bookingId: string;
  propertyId: string;
  reviewerId: string;
  rating: number;
  cleanliness: number;
  communication: number;
  accuracy: number;
  location: number;
  checkin: number;
  value: number;
  comment?: string;
  createdAt: string;
  reviewer?: User;
}

// Legacy product type (kept for compatibility)
export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
  location: string;
  date: string;
  description: string;
  sellerId: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
  phone?: string;
  whatsappNumber?: string;
  bio?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  isBoosted?: boolean;
  boostedUntil?: string | null;
  responseRate?: number;
  responseTime?: string;
  hostRating?: number;
  hostReviewCount?: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface MessageThread {
  id: string;
  productId: string;
  productTitle: string;
  participants: [string, string];
  messages: Message[];
  lastMessageTimestamp: number;
}

export type Page = 'home' | 'saved' | 'messages' | 'profile' | 'edit-profile' | 'admin' | 'properties' | 'property-detail' | 'bookings' | 'host-dashboard';
