# Setup Instructions for Airbnb-like Property Rental Platform

## Step 1: Database Schema Migration

### In Supabase Dashboard:

1. Go to **SQL Editor** in your Supabase project
2. Create a new query
3. Copy the entire contents of `scripts/02_update_schema_airbnb.sql`
4. Paste into the SQL editor
5. Click **Run** button
6. Wait for completion (should take < 30 seconds)

### What the migration does:
- ✅ Adds WhatsApp and contact fields to profiles table
- ✅ Creates `bookings` table for reservations
- ✅ Creates `property_availability` table for calendar system
- ✅ Creates `reviews` table for guest feedback
- ✅ Creates `messages` table for host-guest chat
- ✅ Updates `properties` table with Airbnb-style fields
- ✅ Sets up Row Level Security (RLS) policies

## Step 2: Update Your App Component

Import the new components in your `App.tsx`:

```typescript
import { PropertiesPage } from './components/PropertiesPage';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { BookingModal } from './components/BookingModal';
import { HostDashboard } from './components/HostDashboard';
import { HostContactCard } from './components/HostContactCard';
```

Add pages to your router:
```typescript
case 'properties':
  return <PropertiesPage 
    properties={properties}
    onPropertySelect={setSelectedProperty}
    onSaveProperty={handleSaveProperty}
  />;

case 'property-detail':
  return selectedProperty && <PropertyDetailPage 
    property={selectedProperty}
    host={getHostForProperty(selectedProperty.hostId)}
    reviews={getPropertyReviews(selectedProperty.id)}
    onBooking={() => setShowBookingModal(true)}
    onContact={() => setShowContactModal(true)}
    onClose={() => setSelectedProperty(null)}
  />;

case 'host-dashboard':
  return currentUser && <HostDashboard 
    host={currentUser}
    properties={userProperties}
    bookings={userBookings}
    reviews={userReviews}
  />;
```

## Step 3: Enable WhatsApp Integration

Users can add their WhatsApp number in their profile:

1. Go to **Edit Profile** page
2. Add field for WhatsApp number
3. Example format: `+1 (555) 123-4567` or `+15551234567`

The app automatically converts to `wa.me/` links:
```javascript
const whatsappNumber = '+15551234567';
const chatLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
// Result: https://wa.me/15551234567
```

## Step 4: Test the Features

### Test Property Listing:
1. Create a property as a host user
2. Visit Properties page
3. Should see property card with images, price, ratings

### Test Booking:
1. Click on a property
2. Click "Book Now"
3. Select dates in calendar
4. Choose number of guests
5. Review pricing and confirm

### Test WhatsApp:
1. Add a WhatsApp number to your profile
2. View PropertyDetailPage
3. Click "Contact via WhatsApp"
4. Should open WhatsApp chat (web or mobile app)

### Test Host Dashboard:
1. Log in as a host
2. Navigate to "Host Dashboard"
3. See overview stats, manage properties and bookings

## Step 5: Customization Options

### Customize Amenities List:
Edit amenity options in `PropertiesPage.tsx` or create a constants file:
```typescript
const AMENITIES = [
  'WiFi',
  'Kitchen',
  'AC',
  'Heating',
  'Washer',
  'Dryer',
  'Pool',
  'Gym',
  'Parking',
  'TV',
];
```

### Customize Price Display:
Update currency formatting in components:
```typescript
// In PropertyCard.tsx
const priceDisplay = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(property.pricePerNight);
```

### Customize Service Fee:
In `BookingModal.tsx`:
```typescript
const serviceFee = Math.round(totalPrice * 0.10); // 10% fee
```

## Step 6: Add Property Creation Form

Create `AddPropertyModal.tsx`:
```typescript
interface AddPropertyModalProps {
  onClose: () => void;
  onSave: (property: Property) => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, onSave }) => {
  // Form with fields:
  // - Title, description
  // - Location, latitude/longitude
  // - Images upload
  // - Price per night
  // - Bedrooms, bathrooms, guest capacity
  // - Amenities checkboxes
  // - Check-in/out times
  // - House rules, cancellation policy
};
```

## Step 7: Add Payment Integration (Optional)

For real bookings, integrate Stripe:

```typescript
// In BookingModal.tsx, after confirmation
const handlePayment = async (booking: Booking) => {
  const stripe = await loadStripe('pk_test_...');
  
  const { sessionId } = await createCheckoutSession({
    propertyId: property.id,
    bookingId: booking.id,
    amount: booking.totalPrice,
  });
  
  await stripe?.redirectToCheckout({ sessionId });
};
```

## Troubleshooting

### "Properties table not found"
- ✅ Run the SQL migration from Step 1
- ✅ Check Supabase project is connected
- ✅ Verify table appears in Supabase > Tables

### "WhatsApp link not working"
- ✅ Ensure number includes country code
- ✅ Remove all non-digit characters except leading +
- ✅ Test: `https://wa.me/15551234567` (US example)

### "Bookings not saving"
- ✅ Check RLS policies are enabled
- ✅ Verify user is authenticated
- ✅ Check Supabase logs for SQL errors

### "Images not uploading"
- ✅ Ensure `products` and `profiles` buckets exist in Supabase Storage
- ✅ Set buckets to public if images should be viewable
- ✅ Check file size limits

## Support

For detailed implementation, see `AIRBNB_IMPLEMENTATION.md`

For database schema details, see `scripts/02_update_schema_airbnb.sql`
