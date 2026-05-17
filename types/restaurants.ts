export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
  keyword: string;
  city: string;
  province: string;
  description: string | null;
  price_range: string | null;
  opening_hours: any;
  featured_image: string | null;
  gallery_images: string[];
  created_at: string;
  updated_at: string;
  owner_id: string | null;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    avatar_url: string;
    full_name?: string;  // Added full_name as optional
  };
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email?: string;  // Added email as optional
  avatar_url: string | null;
  role: 'user' | 'admin' | 'owner';
  created_at: string;
  updated_at: string;
}

export interface FilterOptions {
  city?: string;
  province?: string;
  keyword?: string;
  minRating?: number;
  searchTerm?: string;
  sortBy?: 'rating' | 'review_count' | 'newest';
}