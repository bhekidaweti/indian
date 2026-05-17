'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant, FilterOptions } from '@/types/restaurant';
import { Search, MapPin, Utensils, Star, Filter, X } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchInput, setSearchInput] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const supabase = createClient();

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const [citiesResult, keywordsResult] = await Promise.all([
        supabase.from('restaurants').select('city').not('city', 'is', null).neq('city', ''),
        supabase.from('restaurants').select('keyword').not('keyword', 'is', null).neq('keyword', '')
      ]);

      if (citiesResult.data) {
        setCities([...new Set(citiesResult.data.map(c => c.city).filter(Boolean))]);
      }
      if (keywordsResult.data) {
        setKeywords([...new Set(keywordsResult.data.map(k => k.keyword).filter(Boolean))]);
      }
    };
    fetchFilterOptions();
  }, [supabase]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      let query = supabase.from('restaurants').select('*');

      // Apply search term
      if (searchInput.trim()) {
        const term = searchInput.trim();
        query = query.or(`name.ilike.%${term}%,address.ilike.%${term}%,city.ilike.%${term}%`);
      }

      // Apply filters
      if (filters.city && filters.city !== '') {
        query = query.eq('city', filters.city);
      }
      if (filters.keyword && filters.keyword !== '') {
        query = query.ilike('keyword', `%${filters.keyword}%`);
      }
      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRestaurants(data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (city: string) => {
    setFilters({ city });
    setSearchInput('');
    setTimeout(() => handleSearch(), 100);
  };

  const handleCuisineSearch = (keyword: string) => {
    setFilters({ keyword });
    setSearchInput('');
    setTimeout(() => handleSearch(), 100);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchInput('');
    setRestaurants([]);
    setHasSearched(false);
  };

  const removeFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Authentic Indian Cuisine
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8">
              Find the best Indian restaurants, curry houses, and takeaways near you
            </p>
            
            {/* Main Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by restaurant name, city, or cuisine..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions - Popular Cities */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Popular Cities
          </h2>
          <div className="flex flex-wrap gap-3">
            {['Johannesburg', 'Durban', 'Cape Town', 'Pretoria'].map((city) => (
              <button
                key={city}
                onClick={() => handleQuickSearch(city)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions - Popular Cuisines */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-500" />
            Popular Cuisines
          </h2>
          <div className="flex flex-wrap gap-3">
            {keywords.slice(0, 8).map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleCuisineSearch(cuisine)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-colors capitalize"
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                value={filters.city || ''}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                value={filters.keyword || ''}
              >
                <option value="">All Cuisines</option>
                {keywords.map(keyword => (
                  <option key={keyword} value={keyword}>{keyword}</option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                value={filters.minRating || ''}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilters({});
                  setSearchInput('');
                  setTimeout(() => handleSearch(), 100);
                }}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.city || filters.keyword || filters.minRating || searchInput) && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchInput && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: {searchInput}
                <button onClick={() => { setSearchInput(''); handleSearch(); }} className="hover:text-blue-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                City: {filters.city}
                <button onClick={() => removeFilter('city')} className="hover:text-green-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.keyword && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm capitalize">
                Cuisine: {filters.keyword}
                <button onClick={() => removeFilter('keyword')} className="hover:text-purple-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.minRating && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {filters.minRating}+ Stars
                <button onClick={() => removeFilter('minRating')} className="hover:text-yellow-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Section */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Searching for restaurants...</p>
          </div>
        ) : hasSearched ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {restaurants.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-orange-600 hover:text-orange-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <Utensils className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Find Your Next Favorite Restaurant
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Search by restaurant name, city, or cuisine to discover authentic Indian dining experiences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}