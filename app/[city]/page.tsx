import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import RestaurantCard from '@/components/RestaurantCard';
import Link from 'next/link';
import { MapPin, Star, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface CityPageProps {
  params: Promise<{ city: string }>;
}

// Generate metadata dynamically based on city
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = formatCityName(city);
  
  return {
    title: `${cityName} Indian Restaurants | Best Curry Houses & Takeaways`,
    description: `Discover the best Indian restaurants in ${cityName}. Find authentic curry houses, biryani spots, and halal dining options with real reviews and ratings.`,
    keywords: `${cityName} indian restaurants, ${cityName} curry houses, ${cityName} indian takeaways, best indian food ${cityName}`,
  };
}

// Format city name from URL slug to display name
function formatCityName(slug: string): string {
  const cityMap: Record<string, string> = {
    'johannesburg': 'Johannesburg',
    'durban': 'Durban',
    'cape-town': 'Cape Town',
    'pretoria': 'Pretoria',
    'sandton': 'Sandton',
    'midrand': 'Midrand',
    'centurion': 'Centurion',
    'bloemfontein': 'Bloemfontein',
    'port-elizabeth': 'Port Elizabeth',
    'east-london': 'East London'
  };
  
  return cityMap[slug.toLowerCase()] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Get the URL-friendly slug from city name
function getCitySlug(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, '-');
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: citySlug } = await params;
  const supabase = await createServerSupabaseClient();
  
  // Format the city name for display
  const cityDisplayName = formatCityName(citySlug);
  
  // Fetch restaurants for this city
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')
    .ilike('city', `%${cityDisplayName}%`)
    .order('rating', { ascending: false, nullsLast: true });

  if (error) {
    console.error('Error fetching city restaurants:', error);
    notFound();
  }

  // If no restaurants found for this city, show 404
  if (!restaurants || restaurants.length === 0) {
    notFound();
  }

  // Calculate stats
  const totalRestaurants = restaurants.length;
  const averageRating = restaurants.reduce((acc, r) => acc + (r.rating || 0), 0) / totalRestaurants;
  const totalReviews = restaurants.reduce((acc, r) => acc + (r.review_count || 0), 0);
  
  // Get unique cuisines in this city
  const cuisines = [...new Set(restaurants.map(r => r.keyword).filter(Boolean))];
  
  // Get top rated restaurants
  const topRated = [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link 
        href="/restaurants" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all restaurants
      </Link>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 mb-12 text-white">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-bold">
            Indian Restaurants in {cityDisplayName}
          </h1>
        </div>
        <p className="text-lg text-white/90 mb-6">
          Discover the best authentic Indian cuisine, curry houses, and takeaways in {cityDisplayName}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{totalRestaurants}</div>
            <div className="text-sm text-white/80">Restaurants</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-white/80">Average Rating</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{totalReviews.toLocaleString()}</div>
            <div className="text-sm text-white/80">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Top Rated Section */}
      {topRated.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            Top Rated in {cityDisplayName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRated.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      )}

      {/* All Restaurants Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          All Indian Restaurants in {cityDisplayName}
        </h2>
        
        {/* Cuisine Filter Tags */}
        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-gray-600 mr-2">Popular cuisines:</span>
            {cuisines.slice(0, 8).map((cuisine) => (
              <Link
                key={cuisine}
                href={`/search?keyword=${encodeURIComponent(cuisine || '')}&city=${encodeURIComponent(cityDisplayName)}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-100 hover:text-orange-700 transition-colors"
              >
                {cuisine}
              </Link>
            ))}
          </div>
        )}

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `Indian Restaurants in ${cityDisplayName}`,
            "description": `Find the best Indian restaurants in ${cityDisplayName}. Browse menus, read reviews, and discover authentic curry houses.`,
            "numberOfItems": totalRestaurants,
            "itemListElement": restaurants.slice(0, 10).map((restaurant, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Restaurant",
                "name": restaurant.name,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": restaurant.city,
                  "addressRegion": restaurant.province
                },
                "aggregateRating": restaurant.rating ? {
                  "@type": "AggregateRating",
                  "ratingValue": restaurant.rating,
                  "reviewCount": restaurant.review_count
                } : undefined
              }
            }))
          })
        }}
      />
    </div>
  );
}