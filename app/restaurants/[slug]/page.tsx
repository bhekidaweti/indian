import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import RestaurantDetails from '@/components/RestaurantDetails';
import RestaurantReviews from '@/components/RestaurantReviews';
import type { Metadata } from 'next';

interface RestaurantPageProps {
  params: Promise<{ slug: string }>;  // params is now a Promise
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  // Await params to get the slug
  const { slug } = await params;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/restaurants?slug=eq.${slug}&select=name,rating,review_count,city,province`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        next: { revalidate: 3600 }
      }
    );
    
    const restaurant = await response.json();
    
    if (!restaurant || restaurant.length === 0) {
      return { title: 'Restaurant Not Found' };
    }

    const r = restaurant[0];
    return {
      title: `${r.name} - ${r.rating || 'New'}★ (${r.review_count || 0} reviews)`,
      description: `Visit ${r.name} in ${r.city}, ${r.province}.`,
    };
  } catch (error) {
    return { title: 'Restaurant Details' };
  }
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  // Await params to get the slug
  const { slug } = await params;
  
  const supabase = await createServerSupabaseClient();
  
  // Fetch restaurant data
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (restaurantError || !restaurant) {
    notFound();
  }

  // Fetch reviews
  // Update the reviews fetching part
const { data: reviews, error: reviewsError } = await supabase
  .from('reviews')
  .select(`
    *,
    profiles!reviews_user_id_fkey (
      username,
      full_name,
      avatar_url
    )
  `)
  .eq('restaurant_id', restaurant.id)
  .order('created_at', { ascending: false });

// Transform the data
const transformedReviews = reviews?.map(review => ({
  ...review,
  user: review.profiles
})) || [];

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if restaurant is favorited
  let isFavorited = false;
  if (user) {
    const { data: favorite } = await supabase
      .from('favorites')
      .select()
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurant.id)
      .maybeSingle();
    
    isFavorited = !!favorite;
  }
  

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <RestaurantDetails 
        restaurant={restaurant} 
        isFavorited={isFavorited}
        userId={user?.id}
        userReviews={transformedReviews} 
      />
      
      <RestaurantReviews 
        reviews={reviews || []}
        restaurantId={restaurant.id}
        userId={user?.id}
      />
    </div>
  );
}