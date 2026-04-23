# Usage Examples - Airbnb-like Platform

## Displaying Properties

### Load and display all properties:
```typescript
import { PropertiesPage } from './components/PropertiesPage';
import * as db from './services/dbService';

const MyApp = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      const props = await db.getProperties();
      setProperties(props);
      
      if (currentUser) {
        const saved = await db.getSavedProductIds(currentUser.id);
        setSavedIds(saved);
      }
    };
    loadData();
  }, []);

  return (
    <PropertiesPage 
      properties={properties}
      savedPropertyIds={savedIds}
      onPropertySelect={(property) => {
        setSelectedProperty(property);
        setActivePage('property-detail');
      }}
      onSaveProperty={(propertyId) => {
        // Toggle save status
        setSavedIds(prev => {
          const updated = new Set(prev);
          if (updated.has(propertyId)) {
            updated.delete(propertyId);
          } else {
            updated.add(propertyId);
          }
          return updated;
        });
      }}
    />
  );
};
```

## Creating a Property

### Upload property with images:
```typescript
const createNewProperty = async (formData: {
  title: string;
  description: string;
  location: string;
  images: File[];
  price: number;
  bedrooms: number;
  bathrooms: number;
  guestCapacity: number;
  amenities: string[];
}) => {
  try {
    // Upload images
    const imageUrls = await Promise.all(
      formData.images.map(file => db.uploadImage(file, 'products'))
    );

    // Create property
    const property = await db.createProperty({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      images: imageUrls.filter(Boolean) as string[],
      pricePerNight: formData.price,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      guestCapacity: formData.guestCapacity,
      amenities: formData.amenities,
      hostId: currentUser.id,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'moderate',
      rating: 0,
      reviewCount: 0,
    });

    console.log('Property created:', property);
  } catch (error) {
    console.error('Failed to create property:', error);
  }
};
```

## Booking a Property

### Handle booking confirmation:
```typescript
const handleBookingConfirm = async (
  checkIn: string,
  checkOut: string,
  guests: number,
  property: Property
) => {
  if (!currentUser) {
    showToast('Please log in to book');
    return;
  }

  try {
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const totalPrice = nights * property.pricePerNight;

    const booking = await db.createBooking({
      propertyId: property.id,
      guestId: currentUser.id,
      hostId: property.hostId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: guests,
      totalPrice,
      status: 'pending',
    });

    if (booking) {
      showToast('Booking created! Awaiting host confirmation.');
      setShowBookingModal(false);
      // Navigate to bookings page or confirmation
    }
  } catch (error) {
    showToast('Failed to create booking');
  }
};
```

## Managing Host Profile

### Update user with WhatsApp number:
```typescript
const updateHostProfile = async (updates: {
  whatsappNumber?: string;
  responseTime?: string;
  bio?: string;
}) => {
  try {
    // Update in your database
    const updatedUser: User = {
      ...currentUser,
      whatsappNumber: updates.whatsappNumber,
      responseTime: updates.responseTime,
      bio: updates.bio,
    };

    // Save to Supabase
    const { error } = await supabase
      .from('users')
      .update({
        whatsapp_number: updates.whatsappNumber,
        response_time: updates.responseTime,
        bio: updates.bio,
      })
      .eq('id', currentUser.id);

    if (error) throw error;

    setCurrentUser(updatedUser);
    showToast('Profile updated!');
  } catch (error) {
    showToast('Failed to update profile');
  }
};
```

## Contact Host via WhatsApp

### Generate WhatsApp link:
```typescript
const createWhatsAppLink = (phoneNumber: string, message?: string) => {
  // Remove all non-digit characters except leading +
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  let url = `https://wa.me/${cleanNumber}`;
  
  if (message) {
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    url += `?text=${encodedMessage}`;
  }
  
  return url;
};

// Usage in component
const whatsappLink = createWhatsAppLink(
  host.whatsappNumber,
  `Hi ${host.name}, I'm interested in booking your property!`
);

// In JSX:
<a href={whatsappLink} target="_blank" rel="noopener noreferrer">
  Contact via WhatsApp
</a>
```

## Host Dashboard Usage

### Load host data:
```typescript
const loadHostDashboard = async (hostId: string) => {
  try {
    const [properties, bookings, reviews] = await Promise.all([
      db.getPropertiesByHost(hostId),
      db.getBookingsByHost(hostId),
      // Get all reviews for host's properties
      db.getReviewsByProperty(properties[0]?.id || ''), // Simplified
    ]);

    setHostData({
      properties,
      bookings,
      reviews,
    });
  } catch (error) {
    console.error('Failed to load host dashboard:', error);
  }
};

// Render dashboard
{activePage === 'host-dashboard' && currentUser && (
  <HostDashboard 
    host={currentUser}
    properties={hostData.properties}
    bookings={hostData.bookings}
    reviews={hostData.reviews}
    onAddProperty={() => setShowAddPropertyModal(true)}
    onEditProperty={(prop) => editProperty(prop)}
  />
)}
```

## Review a Property

### Submit review after stay:
```typescript
const submitReview = async (
  bookingId: string,
  propertyId: string,
  ratings: {
    overall: number;
    cleanliness: number;
    communication: number;
    accuracy: number;
    location: number;
    checkin: number;
    value: number;
  },
  comment: string
) => {
  if (!currentUser) return;

  try {
    const review = await db.createReview({
      bookingId,
      propertyId,
      reviewerId: currentUser.id,
      rating: ratings.overall,
      cleanliness: ratings.cleanliness,
      communication: ratings.communication,
      accuracy: ratings.accuracy,
      location: ratings.location,
      checkin: ratings.checkin,
      value: ratings.value,
      comment,
    });

    if (review) {
      showToast('Thank you for your review!');
      // Refresh property details
    }
  } catch (error) {
    showToast('Failed to submit review');
  }
};
```

## Filter Properties

### Complex filtering example:
```typescript
const filterProperties = (
  properties: Property[],
  filters: {
    location?: string;
    priceMin?: number;
    priceMax?: number;
    minBedrooms?: number;
    minGuests?: number;
    minRating?: number;
    amenities?: string[];
  }
) => {
  return properties.filter(prop => {
    // Location
    if (filters.location && 
        !prop.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Price range
    if (filters.priceMin && prop.pricePerNight < filters.priceMin) return false;
    if (filters.priceMax && prop.pricePerNight > filters.priceMax) return false;

    // Bedrooms
    if (filters.minBedrooms && prop.bedrooms < filters.minBedrooms) return false;

    // Guest capacity
    if (filters.minGuests && prop.guestCapacity < filters.minGuests) return false;

    // Rating
    if (filters.minRating && prop.rating < filters.minRating) return false;

    // Amenities (must have all selected)
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity =>
        prop.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });
};

// Usage
const filtered = filterProperties(properties, {
  location: 'New York',
  priceMin: 100,
  priceMax: 500,
  minBedrooms: 2,
  minGuests: 4,
});
```

## Calculate Stay Duration and Price

### Duration and pricing helper:
```typescript
const calculateBookingPrice = (
  checkInDate: string,
  checkOutDate: string,
  pricePerNight: number,
  serviceFeePercent: number = 0.10
) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * serviceFeePercent);
  const total = subtotal + serviceFee;
  
  return {
    nights,
    subtotal,
    serviceFee,
    total,
  };
};

// Usage
const pricing = calculateBookingPrice(
  '2024-06-01',
  '2024-06-07',
  150
);
console.log(`${pricing.nights} nights: $${pricing.total}`); // "6 nights: $990"
```

## Handle Booking Status Changes

### Update booking status:
```typescript
const updateBookingStatus = async (
  bookingId: string,
  newStatus: 'confirmed' | 'cancelled' | 'completed'
) => {
  try {
    const updated = await db.updateBookingStatus(bookingId, newStatus);
    
    if (updated) {
      showToast(`Booking ${newStatus}!`);
      
      // Optionally send notification
      if (newStatus === 'confirmed') {
        // Send notification to guest
        await notifyGuest(updated.guestId, 'Your booking is confirmed!');
      }
      
      // Refresh data
      loadHostDashboard(currentUser.id);
    }
  } catch (error) {
    showToast('Failed to update booking');
  }
};
```

## Get Property Details with Host

### Load full property view:
```typescript
const loadPropertyDetails = async (propertyId: string) => {
  try {
    const [property, host, reviews] = await Promise.all([
      db.getPropertyById(propertyId),
      // Get host info
      db.getUsers().then(users => 
        users.find(u => u.id === property?.hostId)
      ),
      // Get reviews
      property ? db.getReviewsByProperty(property.id) : Promise.resolve([]),
    ]);

    setPropertyDetails({
      property,
      host,
      reviews,
    });
  } catch (error) {
    console.error('Failed to load property:', error);
  }
};
```

## Error Handling Pattern

### Consistent error handling:
```typescript
const safeAsyncAction = async <T>(
  action: () => Promise<T>,
  errorMessage: string = 'Something went wrong'
): Promise<T | null> => {
  try {
    return await action();
  } catch (error) {
    console.error(errorMessage, error);
    showToast(errorMessage);
    return null;
  }
};

// Usage
const result = await safeAsyncAction(
  () => db.createProperty(propertyData),
  'Failed to create property'
);

if (result) {
  showToast('Property created successfully!');
}
```

---

**For more information, see:**
- `AIRBNB_IMPLEMENTATION.md` - Technical details
- `SETUP_INSTRUCTIONS.md` - Setup guide
- `BUILD_SUMMARY.md` - Feature overview
