'use client';

import { useState, useEffect } from 'react';
import { FilterOptions } from '@/types/restaurants';
import { createClient } from '@/lib/supabase/client';
import { Filter } from 'lucide-react';


interface RestaurantFilterProps {
  cities: string[];
  provinces: string[];
  keywords: string[];
  onFilterChange: (filters: FilterOptions) => void;
}

export default function RestaurantFilter({
  cities: initialCities,
  provinces: initialProvinces,
  keywords,
  onFilterChange,
}: RestaurantFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filteredCities, setFilteredCities] = useState<string[]>(initialCities);
  const supabase = createClient();

  // Filter cities based on selected province
  useEffect(() => {
    const fetchCitiesByProvince = async () => {
      if (filters.province && filters.province !== '') {
        // Fetch cities for the selected province from the database
        const { data, error } = await supabase
          .from('restaurants')
          .select('city')
          .eq('province', filters.province)
          .not('city', 'is', null)
          .order('city');
        
        if (!error && data) {
          const uniqueCities = [...new Set(data.map(item => item.city).filter(Boolean))];
          setFilteredCities(uniqueCities);
        } else {
          // Fallback to filtering initial cities
          const citiesForProvince = initialCities.filter(city => 
            // This would need a mapping from city to province
            // For now, just show all cities
            true
          );
          setFilteredCities(citiesForProvince);
        }
      } else {
        setFilteredCities(initialCities);
      }
    };

    fetchCitiesByProvince();
  }, [filters.province, initialCities, supabase]);

  const handleChange = (key: keyof FilterOptions, value: string | number) => {
    const newFilters = { ...filters, [key]: value || undefined };
    
    // If province changes, reset city filter
    if (key === 'province') {
      delete newFilters.city;
    }
    
    // If city changes and province is not set, we might want to auto-set province?
    if (key === 'city' && value && !filters.province) {
      // Optionally auto-select province based on city
      // You would need a city->province mapping for this
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (value: string) => {
    let ratingValue: number | undefined;
    
    switch(value) {
      case '4.5':
        ratingValue = 4.5;
        break;
      case '4.0':
        ratingValue = 4.0;
        break;
      case '3.5':
        ratingValue = 3.5;
        break;
      default:
        ratingValue = undefined;
    }
    
    handleChange('minRating', ratingValue || '');
  };

  // Clean and deduplicate the lists
  const cleanProvinces = [...new Set(initialProvinces.filter(p => p && p.trim()))].sort();
  const cleanKeywords = [...new Set(keywords.filter(k => k && k.trim()))].sort();
  const cleanCities = [...new Set(filteredCities.filter(c => c && c.trim()))].sort();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg text-black font-semibold mb-4"> <Filter /></h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Province Filter */}
       <select
          className="px-3 py-2 text-black border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200"
          onChange={(e) => handleChange('province', e.target.value)}
          value={filters.province || ''}
        >
          <option value="">All Provinces</option>
          {cleanProvinces.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>

        {/* City Filter - Updates based on selected province */}
        <select
          className="px-3 py-2 text-black border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          onChange={(e) => handleChange('city', e.target.value)}
          value={filters.city || ''}
          disabled={!filters.province && cleanCities.length === initialCities.length}
        >
          <option value="">All Cities</option>
          {cleanCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {/* Cuisine Filter */}
        <select
          className="px-3 py-2 text-black border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          onChange={(e) => handleChange('keyword', e.target.value)}
          value={filters.keyword || ''}
        >
          <option value="">All Cuisines</option>
          {cleanKeywords.map(keyword => (
            <option key={keyword} value={keyword}>{keyword}</option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          className="px-3 py-2 text-black border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          onChange={(e) => handleRatingChange(e.target.value)}
          value={
            filters.minRating === 4.5 ? '4.5' :
            filters.minRating === 4.0 ? '4.0' :
            filters.minRating === 3.5 ? '3.5' : ''
          }
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
        </select>
      </div>
      
      {/* Active Filters Display */}
      {(filters.city || filters.province || filters.keyword || filters.minRating) && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-black">Active filters:</span>
          {filters.province && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-200 text-blue-800">
              Province: {filters.province}
              <button
                onClick={() => handleChange('province', '')}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-200 text-green-800">
              City: {filters.city}
              <button
                onClick={() => handleChange('city', '')}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.keyword && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Cuisine: {filters.keyword}
              <button
                onClick={() => handleChange('keyword', '')}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.minRating && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              Rating: {filters.minRating}+
              <button
                onClick={() => handleChange('minRating', '')}
                className="ml-1 hover:text-yellow-600"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setFilters({});
              onFilterChange({});
            }}
            className="text-sm text-red-600 hover:text-red-700 ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}