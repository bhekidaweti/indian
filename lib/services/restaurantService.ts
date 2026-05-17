import { createClient } from '../supabase/client';
import { Restaurant, Review, FilterOptions } from '@/types/restaurants';
import { generateSlug } from '../utils';

const supabase = createClient();

export const restaurantService = {
  // Get all restaurants with filtering and pagination
  async getRestaurants(
    filters: FilterOptions = {},
    page: number = 1,
    pageSize: number = 12
  ) {
    let query = supabase
      .from('restaurants')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.province) {
      query = query.eq('province', filters.province);
    }
    if (filters.keyword) {
      query = query.eq('keyword', filters.keyword);
    }
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }
    if (filters.searchTerm) {
      query = query.or(
        `name.ilike.%${filters.searchTerm}%,address.ilike.%${filters.searchTerm}%,city.ilike.%${filters.searchTerm}%`
      );
    }

    // Apply sorting
    if (filters.sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (filters.sortBy === 'review_count') {
      query = query.order('review_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { restaurants: data as Restaurant[], count: count || 0 };
  },

  // Get restaurant by slug
  async getRestaurantBySlug(slug: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Restaurant;
  },

  // Get restaurant with reviews
  async getRestaurantWithReviews(slug: string) {
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (restaurantError) throw restaurantError;

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(username, avatar_url)
      `)
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (reviewsError) throw reviewsError;

    return { restaurant: restaurant as Restaurant, reviews: reviews as Review[] };
  },

  // Create restaurant (for owners/admins)
  async createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'slug' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>) {
    const slug = generateSlug(restaurantData.name);
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert([{ ...restaurantData, slug }])
      .select()
      .single();

    if (error) throw error;
    return data as Restaurant;
  },

  // Update restaurant
  async updateRestaurant(id: string, updates: Partial<Restaurant>) {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Restaurant;
  },

  // Delete restaurant
  async deleteRestaurant(id: string) {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Add review
  async addReview(restaurantId: string, userId: string, rating: number, reviewText: string) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        restaurant_id: restaurantId,
        user_id: userId,
        rating,
        review_text: reviewText
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  // Update review
  async updateReview(reviewId: string, rating: number, reviewText: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, review_text: reviewText })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  // Delete review
  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  },

  // Toggle favorite
  async toggleFavorite(userId: string, restaurantId: string) {
    const { data: existing } = await supabase
      .from('favorites')
      .select()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);
      
      if (error) throw error;
      return false; // Removed from favorites
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, restaurant_id: restaurantId }]);
      
      if (error) throw error;
      return true; // Added to favorites
    }
  },

  // Get user favorites
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`restaurant:restaurants(*)`)
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((item: any) => item.restaurant as Restaurant);
  },

  // Get unique filter values
  async getFilterOptions() {
    const [cities, provinces, keywords] = await Promise.all([
      supabase.from('restaurants').select('city').order('city'),
      supabase.from('restaurants').select('province').order('province'),
      supabase.from('restaurants').select('keyword').order('keyword'),
    ]);

    return {
      cities: [...new Set(cities.data?.map(r => r.city) || [])],
      provinces: [...new Set(provinces.data?.map(r => r.province) || [])],
      keywords: [...new Set(keywords.data?.map(r => r.keyword) || [])],
    };
  }
};