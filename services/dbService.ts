import { supabase } from './supabase_client';
import { Product, User, MessageThread, Message, Theme, Property, Booking, Review } from '../types';

// ── Theme ─────────────────────────────────────────────────────────────────────
export const getTheme = (): Theme => {
    try { return (localStorage.getItem('kano-theme') as Theme) || 'system'; } catch { return 'system'; }
};
export const saveTheme = (theme: Theme): void => {
    try { localStorage.setItem('kano-theme', theme); } catch (e) { console.error(e); }
};

// ── Session user ──────────────────────────────────────────────────────────────
export const getCurrentUser = (): User | null => {
    try { const s = localStorage.getItem('kano-currentUser'); return s ? JSON.parse(s) : null; } catch { return null; }
};
export const saveCurrentUser = (user: User): void => {
    try { localStorage.setItem('kano-currentUser', JSON.stringify(user)); } catch (e) { console.error(e); }
};
export const clearCurrentUser = (): void => { localStorage.removeItem('kano-currentUser'); };

// ── Helper: map DB row → User ─────────────────────────────────────────────────
const rowToUser = (u: any): User => ({
    id: u.id,
    name: u.name,
    username: u.username,
    profilePicture: u.profile_picture,
    phone: u.phone ?? undefined,
    whatsappNumber: u.whatsapp_number ?? undefined,
    bio: u.bio ?? undefined,
    isVerified: u.is_verified ?? false,
    isBoosted: u.is_boosted ?? false,
    boostedUntil: u.boosted_until ?? null,
    responseRate: u.response_rate ?? undefined,
    responseTime: u.response_time ?? undefined,
    hostRating: u.host_rating ?? undefined,
    hostReviewCount: u.host_review_count ?? undefined,
});

// ── Helper: map DB row → Property ──────────────────────────────────────────────
const rowToProperty = (p: any): Property => ({
    id: p.id,
    title: p.title,
    description: p.description,
    location: p.location,
    images: p.images || [],
    pricePerNight: p.price_per_night,
    guestCapacity: p.guest_capacity,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    hostId: p.host_id,
    amenities: p.amenities || [],
    checkInTime: p.check_in_time || '15:00',
    checkOutTime: p.check_out_time || '11:00',
    houseRules: p.house_rules ?? undefined,
    cancellationPolicy: p.cancellation_policy || 'moderate',
    rating: p.rating || 0,
    reviewCount: p.review_count || 0,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    createdAt: p.created_at,
});

// ── Helper: map DB row → Booking ───────────────────────────────────────────────
const rowToBooking = (b: any): Booking => ({
    id: b.id,
    propertyId: b.property_id,
    guestId: b.guest_id,
    hostId: b.host_id,
    checkInDate: b.check_in_date,
    checkOutDate: b.check_out_date,
    numberOfGuests: b.number_of_guests,
    totalPrice: b.total_price,
    status: b.status,
    guestMessage: b.guest_message ?? undefined,
    createdAt: b.created_at,
});

// ── Helper: map DB row → Review ────────────────────────────────────────────────
const rowToReview = (r: any): Review => ({
    id: r.id,
    bookingId: r.booking_id,
    propertyId: r.property_id,
    reviewerId: r.reviewer_id,
    rating: r.rating,
    cleanliness: r.cleanliness_rating,
    communication: r.communication_rating,
    accuracy: r.accuracy_rating,
    location: r.location_rating,
    checkin: r.checkin_rating,
    value: r.value_rating,
    comment: r.comment ?? undefined,
    createdAt: r.created_at,
});

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = async (): Promise<User[]> => {
    try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(rowToUser);
    } catch (e) { console.error('getUsers:', e); return []; }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert({ name: user.name, username: user.username, profile_picture: user.profilePicture, phone: user.phone ?? null })
            .select().single();
        if (error) throw error;
        return rowToUser(data);
    } catch (e) { console.error('createUser:', e); return null; }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
        const payload: Record<string, unknown> = {};
        if (updates.name !== undefined)            payload.name = updates.name;
        if (updates.username !== undefined)        payload.username = updates.username;
        if (updates.profilePicture !== undefined)  payload.profile_picture = updates.profilePicture;
        if (updates.phone !== undefined)           payload.phone = updates.phone || null;
        if (updates.bio !== undefined) payload.bio = updates.bio || null;
        if (updates.isVerified !== undefined)      payload.is_verified = updates.isVerified;
        if (updates.isBoosted !== undefined)       payload.is_boosted = updates.isBoosted;
        if (updates.boostedUntil !== undefined)    payload.boosted_until = updates.boostedUntil;

        const { error } = await supabase.from('users').update(payload).eq('id', userId);
        if (error) throw error;
        return true;
    } catch (e) { console.error('updateUser:', e); return false; }
};

// ── Products ──────────────────────────────────────────────────────────────────
const parseImages = (raw: string): string[] => {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [raw]; } catch { return raw ? [raw] : []; }
};

export const getProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(p => ({
            id: p.id, title: p.title, price: p.price, category: p.category,
            images: parseImages(p.image), location: p.location, date: p.date,
            description: p.description, sellerId: p.seller_id,
        }));
    } catch (e) { console.error('getProducts:', e); return []; }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert({ title: product.title, price: product.price, category: product.category,
                image: JSON.stringify(product.images), location: product.location,
                date: product.date, description: product.description, seller_id: product.sellerId })
            .select().single();
        if (error) throw error;
        return { id: data.id, title: data.title, price: data.price, category: data.category,
            images: parseImages(data.image), location: data.location, date: data.date,
            description: data.description, sellerId: data.seller_id };
    } catch (e) { console.error('createProduct:', e); return null; }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<boolean> => {
    try {
        const payload: Record<string, unknown> = { title: updates.title, price: updates.price, category: updates.category, description: updates.description };
        if (updates.images) payload.image = JSON.stringify(updates.images);
        const { error } = await supabase.from('products').update(payload).eq('id', productId);
        if (error) throw error;
        return true;
    } catch (e) { console.error('updateProduct:', e); return false; }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;
        return true;
    } catch (e) { console.error('deleteProduct:', e); return false; }
};

// ── Saved products ────────────────────────────────────────────────────────────
export const getSavedProductIds = async (userId: string | undefined): Promise<Set<string>> => {
    if (!userId) return new Set();
    try {
        const { data, error } = await supabase.from('saved_products').select('product_id').eq('user_id', userId);
        if (error) throw error;
        return new Set((data || []).map(i => i.product_id));
    } catch (e) { console.error(e); return new Set(); }
};
export const saveProduct = async (userId: string, productId: string): Promise<boolean> => {
    try { const { error } = await supabase.from('saved_products').insert({ user_id: userId, product_id: productId }); if (error) throw error; return true; } catch { return false; }
};
export const unsaveProduct = async (userId: string, productId: string): Promise<boolean> => {
    try { const { error } = await supabase.from('saved_products').delete().eq('user_id', userId).eq('product_id', productId); if (error) throw error; return true; } catch { return false; }
};

// ── Threads & Messages ────────────────────────────────────────────────────────
export const getThreads = async (): Promise<MessageThread[]> => {
    try {
        const { data: td, error: te } = await supabase.from('message_threads').select('*').order('last_message_timestamp', { ascending: false });
        if (te) throw te;
        return Promise.all((td || []).map(async t => {
            const { data: md, error: me } = await supabase.from('messages').select('*').eq('thread_id', t.id).order('timestamp', { ascending: true });
            if (me) throw me;
            return { id: t.id, productId: t.product_id, productTitle: t.product_title,
                participants: [t.participant1_id, t.participant2_id] as [string, string],
                messages: (md || []).map(m => ({ id: m.id, senderId: m.sender_id, text: m.text, timestamp: m.timestamp })),
                lastMessageTimestamp: t.last_message_timestamp };
        }));
    } catch (e) { console.error('getThreads:', e); return []; }
};

export const createThread = async (thread: Omit<MessageThread, 'messages'>): Promise<MessageThread | null> => {
    try {
        const { data, error } = await supabase.from('message_threads')
            .insert({ id: thread.id, product_id: thread.productId, product_title: thread.productTitle,
                participant1_id: thread.participants[0], participant2_id: thread.participants[1],
                last_message_timestamp: thread.lastMessageTimestamp })
            .select().single();
        if (error) throw error;
        return { id: data.id, productId: data.product_id, productTitle: data.product_title,
            participants: [data.participant1_id, data.participant2_id] as [string, string],
            messages: [], lastMessageTimestamp: data.last_message_timestamp };
    } catch (e) { console.error('createThread:', e); return null; }
};

export const updateThreadTimestamp = async (threadId: string, timestamp: number): Promise<boolean> => {
    try { const { error } = await supabase.from('message_threads').update({ last_message_timestamp: timestamp }).eq('id', threadId); if (error) throw error; return true; } catch { return false; }
};

export const createMessage = async (message: Message, threadId: string): Promise<Message | null> => {
    try {
        const { data, error } = await supabase.from('messages')
            .insert({ thread_id: threadId, sender_id: message.senderId, text: message.text, timestamp: message.timestamp })
            .select().single();
        if (error) throw error;
        await updateThreadTimestamp(threadId, message.timestamp);
        return { id: data.id, senderId: data.sender_id, text: data.text, timestamp: data.timestamp };
    } catch (e) { console.error('createMessage:', e); return null; }
};

export const uploadImage = async (file: File, bucket: 'products' | 'profiles'): Promise<string | null> => {
    try {
        const ext = file.name.split('.').pop();
        const name = `${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`;
        const { data, error } = await supabase.storage.from(bucket).upload(name, file);
        if (error) throw error;
        return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
    } catch (e) { console.error('uploadImage:', e); return null; }
};

// ── Properties ─────────────────────────────────────────────────────────────────
export const getProperties = async (): Promise<Property[]> => {
    try {
        const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(rowToProperty);
    } catch (e) { console.error('getProperties:', e); return []; }
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
    try {
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (error) throw error;
        return data ? rowToProperty(data) : null;
    } catch (e) { console.error('getPropertyById:', e); return null; }
};

export const getPropertiesByHost = async (hostId: string): Promise<Property[]> => {
    try {
        const { data, error } = await supabase.from('properties').select('*').eq('host_id', hostId);
        if (error) throw error;
        return (data || []).map(rowToProperty);
    } catch (e) { console.error('getPropertiesByHost:', e); return []; }
};

export const createProperty = async (property: Omit<Property, 'id' | 'createdAt'>): Promise<Property | null> => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .insert({
                title: property.title,
                description: property.description,
                location: property.location,
                images: property.images,
                price_per_night: property.pricePerNight,
                guest_capacity: property.guestCapacity,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                host_id: property.hostId,
                amenities: property.amenities,
                check_in_time: property.checkInTime,
                check_out_time: property.checkOutTime,
                house_rules: property.houseRules || null,
                cancellation_policy: property.cancellationPolicy,
                latitude: property.latitude || null,
                longitude: property.longitude || null,
            })
            .select()
            .single();
        if (error) throw error;
        return rowToProperty(data);
    } catch (e) { console.error('createProperty:', e); return null; }
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
    try {
        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.description) updateData.description = updates.description;
        if (updates.location) updateData.location = updates.location;
        if (updates.images) updateData.images = updates.images;
        if (updates.pricePerNight) updateData.price_per_night = updates.pricePerNight;
        if (updates.amenities) updateData.amenities = updates.amenities;
        if (updates.houseRules) updateData.house_rules = updates.houseRules;
        
        const { data, error } = await supabase.from('properties').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        return rowToProperty(data);
    } catch (e) { console.error('updateProperty:', e); return null; }
};

// ── Bookings ───────────────────────────────────────────────────────────────────
export const getBookings = async (): Promise<Booking[]> => {
    try {
        const { data, error } = await supabase.from('bookings').select('*').order('check_in_date', { ascending: false });
        if (error) throw error;
        return (data || []).map(rowToBooking);
    } catch (e) { console.error('getBookings:', e); return []; }
};

export const getBookingsByProperty = async (propertyId: string): Promise<Booking[]> => {
    try {
        const { data, error } = await supabase.from('bookings').select('*').eq('property_id', propertyId);
        if (error) throw error;
        return (data || []).map(rowToBooking);
    } catch (e) { console.error('getBookingsByProperty:', e); return []; }
};

export const getBookingsByHost = async (hostId: string): Promise<Booking[]> => {
    try {
        const { data, error } = await supabase.from('bookings').select('*').eq('host_id', hostId);
        if (error) throw error;
        return (data || []).map(rowToBooking);
    } catch (e) { console.error('getBookingsByHost:', e); return []; }
};

export const getBookingsByGuest = async (guestId: string): Promise<Booking[]> => {
    try {
        const { data, error } = await supabase.from('bookings').select('*').eq('guest_id', guestId);
        if (error) throw error;
        return (data || []).map(rowToBooking);
    } catch (e) { console.error('getBookingsByGuest:', e); return []; }
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking | null> => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                property_id: booking.propertyId,
                guest_id: booking.guestId,
                host_id: booking.hostId,
                check_in_date: booking.checkInDate,
                check_out_date: booking.checkOutDate,
                number_of_guests: booking.numberOfGuests,
                total_price: booking.totalPrice,
                status: booking.status,
                guest_message: booking.guestMessage || null,
            })
            .select()
            .single();
        if (error) throw error;
        return rowToBooking(data);
    } catch (e) { console.error('createBooking:', e); return null; }
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<Booking | null> => {
    try {
        const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        return rowToBooking(data);
    } catch (e) { console.error('updateBookingStatus:', e); return null; }
};

// ── Reviews ────────────────────────────────────────────────────────────────────
export const getReviewsByProperty = async (propertyId: string): Promise<Review[]> => {
    try {
        const { data, error } = await supabase.from('reviews').select('*, reviewer:profiles(*)').eq('property_id', propertyId);
        if (error) throw error;
        return (data || []).map((r: any) => ({
            ...rowToReview(r),
            reviewer: r.reviewer ? rowToUser(r.reviewer) : undefined,
        }));
    } catch (e) { console.error('getReviewsByProperty:', e); return []; }
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt' | 'reviewer'>): Promise<Review | null> => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                booking_id: review.bookingId,
                property_id: review.propertyId,
                reviewer_id: review.reviewerId,
                rating: review.rating,
                cleanliness_rating: review.cleanliness,
                communication_rating: review.communication,
                accuracy_rating: review.accuracy,
                location_rating: review.location,
                checkin_rating: review.checkin,
                value_rating: review.value,
                comment: review.comment || null,
            })
            .select()
            .single();
        if (error) throw error;
        return rowToReview(data);
    } catch (e) { console.error('createReview:', e); return null; }
};
