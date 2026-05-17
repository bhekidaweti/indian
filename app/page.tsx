import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/types/restaurants';

export const metadata = {
  title: 'Restaurant Near Me',
  description: 'Discover top-rated restaurants with authentic reviews. Find the best dining experiences in your city.',
};

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch featured restaurants (top 6 by rating)
  const { data: featuredRestaurants, error: featuredError } = await supabase
    .from('restaurants')
    .select('*')
    .not('rating', 'is', null)
    .order('rating', { ascending: false })
    .limit(6);

  // Fetch stats
  const { data: allRestaurants, error: statsError } = await supabase
    .from('restaurants')
    .select('rating, review_count');

  if (featuredError || statsError) {
    console.error('Error fetching data:', featuredError || statsError);
  }

  const restaurants = allRestaurants || [];
  
  // Calculate stats
  const totalRestaurants = restaurants.length;
  const averageRating = restaurants.length > 0
    ? restaurants.reduce((acc, r) => acc + (r.rating || 0), 0) / restaurants.length
    : 0;  // Average rating calculation can be skewed by null ratings, consider only rated restaurants
  const totalReviews = restaurants.reduce((acc, r) => acc + (r.review_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Indian Restaurant Near Me
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover authentic Indian restaurants, takeaways, and curry houses across South Africa.
        </p>
        <Link
          href="/restaurants"
          className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Browse All Restaurants
        </Link>
      </div>

      {/* Featured Restaurants */}
      {featuredRestaurants && featuredRestaurants.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant as Restaurant} />
            ))}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-300">{totalRestaurants}</div>
            <div className="text-gray-600 mt-2">Restaurants</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-300">
              {  averageRating.toFixed(1) }
               
            </div>
            <div className="text-gray-600 mt-2">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-300">
              {totalReviews.toLocaleString()}
            </div>
            <div className="text-gray-600 mt-2">Total Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
}