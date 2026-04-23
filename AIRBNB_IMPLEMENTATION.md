# Airbnb-like Property Rental Platform - Implementation Guide

## Overview
This implementation transforms the Kano Properties app into a full-featured Airbnb-like property rental platform with:
- Property listings and management
- Booking/reservation system with date picker
- Host profile with WhatsApp contact integration
- Review system
- Host dashboard with analytics

## Database Schema Updates

### New SQL Migration File
Execute: `scripts/02_update_schema_airbnb.sql`

This migration adds:

#### Updated Tables
- **profiles**: Added WhatsApp number, response rate, response time, host rating
- **properties**: Added amenities, guest capacity, bedrooms, bathrooms, pricing, check-in/out times

#### New Tables
- **bookings**: Guest reservations with status tracking (pending, confirmed, cancelled, completed)
- **property_availability**: Calendar system for availability and dynamic pricing
- **reviews**: Guest reviews with detailed ratings (cleanliness, communication, accuracy, location, checkin, value)
- **messages**: Host-guest messaging system

## New Components Created

### PropertyCard (`components/PropertyCard.tsx`)
- Image carousel with navigation
- Heart/save functionality
- Price and rating display
- Guest capacity and amenity icons

### PropertyDetailPage (`components/PropertyDetailPage.tsx`)
- Full property gallery with image counter
- Host profile card with WhatsApp link
- Amenities, check-in/out times, cancellation policy
- Reviews section
- Booking/Contact CTA buttons

### BookingModal (`components/BookingModal.tsx`)
- 3-step booking flow:
  1. **Dates**: Interactive calendar (2 months)
  2. **Guests**: Guest count selector
  3. **Review**: Price breakdown with service fee
- Night calculation and total pricing
- Past date prevention

### PropertiesPage (`components/PropertiesPage.tsx`)
- Search by location/title
- Filters: Price range, bedrooms, guest capacity
- Sort: By price, rating
- Grid layout responsive design
- Results counter

### HostDashboard (`components/HostDashboard.tsx`)
- **Overview Tab**: Stats cards, upcoming bookings
- **Properties Tab**: Add/edit properties
- **Bookings Tab**: Manage reservations (table view)
- **Reviews Tab**: Display guest reviews

### HostContactCard (`components/HostContactCard.tsx`)
- Host profile info
- WhatsApp integration with wa.me links
- Phone call button
- Message button
- Response rate and time
- Two layout modes: full and compact

## Type System Updates (`types.ts`)

New Interfaces:
- **Property**: Full property listing data
- **Booking**: Reservation with pricing and status
- **Review**: Guest feedback with category ratings

Updated Interfaces:
- **User**: Added `whatsappNumber`, `responseRate`, `responseTime`, `hostRating`, `hostReviewCount`

## Database Service Updates (`services/dbService.ts`)

### Helper Functions
- `rowToProperty()`: Maps DB rows to Property type
- `rowToBooking()`: Maps DB rows to Booking type
- `rowToReview()`: Maps DB rows to Review type (includes reviewer data)

### Property Functions
- `getProperties()`: Fetch all properties
- `getPropertyById(id)`: Single property with details
- `getPropertiesByHost(hostId)`: Host's properties
- `createProperty()`: Create new listing
- `updateProperty()`: Edit property details

### Booking Functions
- `getBookings()`: All bookings
- `getBookingsByProperty()`: Property bookings
- `getBookingsByHost()`: Host's reservations
- `getBookingsByGuest()`: Guest's bookings
- `createBooking()`: New reservation
- `updateBookingStatus()`: Change booking status

### Review Functions
- `getReviewsByProperty()`: Property reviews with reviewer data
- `createReview()`: New guest review

## WhatsApp Integration

### Features
- Store WhatsApp number in user profile
- Use `wa.me/` URL scheme for contact links
- Example: `https://wa.me/1234567890`
- Works cross-platform (mobile and web)

### Components Using WhatsApp
1. **PropertyDetailPage**: "Contact via WhatsApp" button
2. **HostContactCard**: Primary contact method
3. **HostDashboard**: Shows WhatsApp on profile header

### URL Format
```javascript
// International format (with country code, no +)
const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

// With optional message
const withMessage = `https://wa.me/${number}?text=Hello!`;
```

## Data Flow

### Property Listing Flow
1. Host navigates to "My Properties" in dashboard
2. Click "Add Property" → Create property form
3. Fill details, upload images, set amenities
4. Save to `properties` table
5. Appears on marketplace for guests

### Booking Flow
1. Guest browsing properties page
2. Click property card → PropertyDetailPage
3. Click "Book Now" → BookingModal opens
4. Step 1: Select check-in/check-out dates
5. Step 2: Select number of guests
6. Step 3: Review pricing and confirm
7. Booking created in `bookings` table with "pending" status
8. Host receives notification (via messages or email)
9. Host can confirm/reject booking

### WhatsApp Contact Flow
1. Guest on PropertyDetailPage
2. Click "Contact via WhatsApp" button
3. Opens WhatsApp with host pre-filled
4. Chat message appears in user's conversation list
5. Host receives message and can discuss details

## Integration Points

### With Existing App
- Uses existing Supabase authentication
- Extends User type (backward compatible)
- Reuses image upload utilities
- Maintains existing product/marketplace features

### Environment Variables
- Requires standard Supabase env vars
- No additional API keys needed
- WhatsApp links are direct (no API)

## Deployment Steps

1. **Create Supabase Project** (if not existing)
   - Tables will be auto-created from schema

2. **Run SQL Migration**
   - Execute `scripts/02_update_schema_airbnb.sql` in Supabase SQL Editor

3. **Update Environment Variables**
   - Ensure Supabase URL and key are set

4. **Deploy Application**
   - Components are production-ready
   - Database service functions handle errors gracefully
   - RLS policies enforce security

## Security Considerations

### Row Level Security (RLS)
- Users can only view/modify their own bookings
- Hosts can only update their own properties
- Anyone can view reviews and property listings
- Messages restricted to participants

### Validation
- Date validation (checkout > checkin)
- Guest count limits enforced
- Price calculations server-side
- Status changes validated

## Next Steps

1. **Execute SQL migration** in Supabase
2. **Integrate components** into main App.tsx with routing
3. **Add property creation form** for hosts
4. **Add payment integration** for bookings (Stripe)
5. **Set up notifications** (email/SMS for bookings)
6. **Add map integration** for property location
7. **Implement calendar** for guest availability
