'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import RestaurantCard from '@/components/RestaurantCard';
import RestaurantFilter from '@/components/RestaurantFilter';
import SearchBar from '@/components/SearchBar';
import { Restaurant, FilterOptions } from '@/types/restaurants';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching restaurants...');
        
        // Fetch all restaurants
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .order('rating', { ascending: false, nullsFirst: true });

        if (restaurantsError) {
          console.error('Error fetching restaurants:', restaurantsError);
          setError(`Failed to load restaurants: ${restaurantsError.message}`);
          return;
        }
        
        console.log(`Fetched ${restaurantsData?.length || 0} restaurants`);
        
        if (restaurantsData && restaurantsData.length > 0) {
          setRestaurants(restaurantsData as Restaurant[]);
          setFilteredRestaurants(restaurantsData as Restaurant[]);
        } else {
          console.log('No restaurants found in database');
          setRestaurants([]);
          setFilteredRestaurants([]);
        }

        // Fetch unique cities
        console.log('Fetching cities...');
        const { data: citiesData, error: citiesError } = await supabase
          .from('restaurants')
          .select('city')
          .not('city', 'is', null)
          .neq('city', '')
          .order('city');
        
        if (citiesError) {
          console.error('Error fetching cities:', citiesError);
        } else if (citiesData) {
          const uniqueCities = [...new Set(citiesData.map(c => c.city).filter(Boolean))];
          console.log(`Fetched ${uniqueCities.length} cities`);
          setCities(uniqueCities);
        }

        // Fetch unique provinces
        console.log('Fetching provinces...');
        const { data: provincesData, error: provincesError } = await supabase
          .from('restaurants')
          .select('province')
          .not('province', 'is', null)
          .neq('province', '')
          .order('province');
        
        if (provincesError) {
          console.error('Error fetching provinces:', provincesError);
        } else if (provincesData) {
          const uniqueProvinces = [...new Set(provincesData.map(p => p.province).filter(Boolean))];
          console.log(`Fetched ${uniqueProvinces.length} provinces`);
          setProvinces(uniqueProvinces);
        }

        // Fetch unique keywords
        console.log('Fetching keywords...');
        const { data: keywordsData, error: keywordsError } = await supabase
          .from('restaurants')
          .select('keyword')
          .not('keyword', 'is', null)
          .neq('keyword', '')
          .order('keyword');
        
        if (keywordsError) {
          console.error('Error fetching keywords:', keywordsError);
        } else if (keywordsData) {
          const uniqueKeywords = [...new Set(keywordsData.map(k => k.keyword).filter(Boolean))];
          console.log(`Fetched ${uniqueKeywords.length} keywords`);
          setKeywords(uniqueKeywords);
        }

      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    if (!restaurants.length) {
      setFilteredRestaurants([]);
      return;
    }
    
    let results = [...restaurants];

    // Apply search
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(restaurant =>
        restaurant.name?.toLowerCase().includes(term) ||
        restaurant.address?.toLowerCase().includes(term) ||
        restaurant.city?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.city && filters.city !== '') {
      results = results.filter(r => r.city === filters.city);
    }
    if (filters.province && filters.province !== '') {
      results = results.filter(r => r.province === filters.province);
    }
    if (filters.keyword && filters.keyword !== '') {
      results = results.filter(r => r.keyword?.toLowerCase() === filters.keyword?.toLowerCase());
    }
    if (filters.minRating && filters.minRating > 0) {
      const minRating = Number(filters.minRating);
      results = results.filter(r => (r.rating || 0) >= minRating);
    }

    setFilteredRestaurants(results);
  }, [restaurants, filters, searchTerm]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (restaurants.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">No restaurants found in the database.</p>
          <p className="text-gray-600 mt-2">Please add some restaurants to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Restaurants</h1>
        <p className="text-gray-600">
          Discover {restaurants.length} amazing restaurants across multiple cities
        </p>
      </div>

      <SearchBar onSearch={handleSearch} />
      
      <RestaurantFilter
        cities={cities}
        provinces={provinces}
        keywords={keywords}
        onFilterChange={handleFilterChange}
      />

      {(filters.city || filters.province || filters.keyword || filters.minRating || searchTerm) && (
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleClearFilters}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Clear all filters
          </button>
        </div>
      )}

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No restaurants found matching your criteria.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}