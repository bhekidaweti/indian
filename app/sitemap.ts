import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient();
  const baseUrl = 'https://indianrestaurantnearme.co.za'; 

  // Fetch all restaurants for dynamic routes
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug, updated_at')
    .order('created_at', { ascending: false });

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Dynamic restaurant routes
  const restaurantRoutes = restaurants?.map((restaurant) => ({
    url: `${baseUrl}/restaurants/${restaurant.slug}`,
    lastModified: new Date(restaurant.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  // City pages
  const cities = ['johannesburg', 'durban', 'cape-town', 'pretoria', 'sandton', 'midrand'];
  const cityRoutes = cities.map((city) => ({
    url: `${baseUrl}/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...restaurantRoutes, ...cityRoutes];
}