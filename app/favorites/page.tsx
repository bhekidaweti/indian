'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Restaurant } from '@/types/restaurants';
import RestaurantCard from '@/components/RestaurantCard';
import { Heart, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      fetchFavorites();
    }
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');

      // First, get all favorite restaurant IDs
      const { data: favoriteIds, error: favError } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', user?.id);

      if (favError) throw favError;

      if (!favoriteIds || favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const restaurantIds = favoriteIds.map(f => f.restaurant_id);

      // Then fetch the restaurant details
      const { data: restaurants, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', restaurantIds)
        .order('rating', { ascending: false });

      if (restError) throw restError;

      setFavorites(restaurants || []);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (restaurantId: string) => {
    setRemovingId(restaurantId);
    
    try {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('restaurant_id', restaurantId);

      if (deleteError) throw deleteError;

      setFavorites(favorites.filter(r => r.id !== restaurantId));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      setError(err.message || 'Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorite Restaurants</h1>
        <p className="text-gray-600">
          {favorites.length} {favorites.length === 1 ? 'restaurant' : 'restaurants'} saved to your favorites
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Heart className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6">
            Start adding restaurants to your favorites and they'll appear here!
          </p>
          <Link
            href="/restaurants"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((restaurant) => (
            <div key={restaurant.id} className="relative">
              <button
                onClick={() => removeFromFavorites(restaurant.id)}
                disabled={removingId === restaurant.id}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}