'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/types/restaurants';
import { Search, Filter, X } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  const keyword = searchParams.get('keyword') || '';
  const city = searchParams.get('city') || '';

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError('');

      try {
        let query = supabase.from('restaurants').select('*');

        if (keyword) {
          query = query.ilike('keyword', `%${keyword}%`);
        }

        if (city) {
          query = query.ilike('city', `%${city}%`);
        }

        const { data, error: fetchError } = await query.order('rating', { ascending: false });

        if (fetchError) throw fetchError;
        setRestaurants(data || []);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    if (keyword || city) {
      fetchSearchResults();
    } else {
      setLoading(false);
    }
  }, [keyword, city]);

  const clearFilters = () => {
    router.push('/restaurants');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Searching...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
        {(keyword || city) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-gray-600">Filters:</span>
            {keyword && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Cuisine: {keyword}
                <button onClick={clearFilters} className="hover:text-blue-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                City: {city}
                <button onClick={clearFilters} className="hover:text-green-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">
            We couldn't find any restaurants matching your search criteria.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}