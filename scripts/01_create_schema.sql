-- ============================================================================
-- KANO PROPERTIES - DATABASE SCHEMA
-- ============================================================================

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone_number TEXT,
  account_type TEXT CHECK (account_type IN ('agent', 'buyer', 'seller', 'investor')) DEFAULT 'buyer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'land', 'condo', 'townhouse', 'apartment')) NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  price DECIMAL(12, 2) NOT NULL,
  price_per_sqft DECIMAL(8, 2),
  listing_type TEXT CHECK (listing_type IN ('for_sale', 'for_rent', 'coming_soon')) NOT NULL,
  status TEXT CHECK (status IN ('available', 'pending', 'sold', 'rented', 'inactive')) DEFAULT 'available',
  year_built INTEGER,
  lot_size DECIMAL(10, 2),
  parking_spaces INTEGER,
  has_pool BOOLEAN DEFAULT FALSE,
  has_garage BOOLEAN DEFAULT FALSE,
  has_garden BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT price_positive CHECK (price > 0)
);

-- Create property images table
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_cover BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews/ratings table
CREATE TABLE IF NOT EXISTS property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(property_id, reviewer_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id)
);

-- Create inquiries/contact requests table
CREATE TABLE IF NOT EXISTS property_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  inquirer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  inquirer_email TEXT NOT NULL,
  inquirer_name TEXT NOT NULL,
  inquirer_phone TEXT,
  message TEXT,
  inquiry_type TEXT CHECK (inquiry_type IN ('general', 'viewing_request', 'offer')) DEFAULT 'general',
  status TEXT CHECK (status IN ('new', 'contacted', 'resolved')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB, -- Store search criteria as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_featured ON properties(featured);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_cover ON property_images(property_id, is_cover);

CREATE INDEX idx_property_reviews_property_id ON property_reviews(property_id);
CREATE INDEX idx_property_reviews_reviewer_id ON property_reviews(reviewer_id);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);

CREATE INDEX idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_inquirer_id ON property_inquiries(inquirer_id);
CREATE INDEX idx_property_inquiries_status ON property_inquiries(status);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Properties: Everyone can read, but only owner can insert/update/delete
CREATE POLICY "Properties are viewable by everyone" 
  ON properties FOR SELECT USING (true);

CREATE POLICY "Users can insert their own properties" 
  ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Property owners can update their properties" 
  ON properties FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Property owners can delete their properties" 
  ON properties FOR DELETE USING (auth.uid() = owner_id);

-- Property Images: Everyone can read, owners can manage
CREATE POLICY "Property images are viewable by everyone" 
  ON property_images FOR SELECT USING (true);

CREATE POLICY "Property owners can insert images" 
  ON property_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Property owners can delete images" 
  ON property_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
  );

-- Reviews: Everyone can read and insert, authors can update/delete
CREATE POLICY "Reviews are viewable by everyone" 
  ON property_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" 
  ON property_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
  ON property_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" 
  ON property_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Favorites: Users can only see/manage their own
CREATE POLICY "Users can only see their own favorites" 
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to favorites" 
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from favorites" 
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Inquiries: Property owners can see inquiries, inquirers can see their own
CREATE POLICY "Property owners can see inquiries" 
  ON property_inquiries FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    OR (inquirer_id IS NOT NULL AND auth.uid() = inquirer_id)
  );

CREATE POLICY "Users can create inquiries" 
  ON property_inquiries FOR INSERT WITH CHECK (true);

-- Saved Searches: Users can only see/manage their own
CREATE POLICY "Users can only see their own saved searches" 
  ON saved_searches FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved searches" 
  ON saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved searches" 
  ON saved_searches FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved searches" 
  ON saved_searches FOR DELETE USING (auth.uid() = user_id);
