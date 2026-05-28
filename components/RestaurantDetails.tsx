'use client';

import { useState } from 'react';
import { Restaurant } from '@/types/restaurants';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Navigation, 
  Heart, 
  Share2, 
  Clock, 
  DollarSign,
  Check,
  Copy
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';


interface RestaurantDetailsProps {
  restaurant: Restaurant;
  isFavorited: boolean;
  userId?: string;
  userReviews: any[];
}

export default function RestaurantDetails({ restaurant, isFavorited: initialFavorited, userId, userReviews }: RestaurantDetailsProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();
  
  const userReviewCount = userReviews.length;
  const userAverageRating = userReviewCount > 0
    ? userReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / userReviewCount
    : null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
  
  const handleToggleFavorite = async () => {
    if (!userId) {
      window.location.href = '/auth';
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('restaurant_id', restaurant.id);
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: userId, restaurant_id: restaurant.id }]);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < fullStars
                ? 'text-yellow-400 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-2xl font-bold text-gray-900">{rating}</span>
       <span className="ml-1 text-gray-500">
          ({userReviewCount > 0 ? userReviewCount : restaurant.review_count} reviews)
        </span>
        <span className="ml-2 text-xs text-gray-400 italic">via Google Maps</span>
      </div>
      
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      {/* Hero Section with Image Placeholder */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-orange-300 to-orange-800">
        {restaurant.featured_image ? (
          <img
            src={restaurant.featured_image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg">{restaurant.keyword} Cuisine</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorited 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors text-gray-700"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          {renderStars(restaurant.rating)}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700">{restaurant.address}</p>
                  <p className="text-gray-600">{restaurant.city}, {restaurant.province}</p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    Get Directions
                  </a>
                </div>
              </div>

              {restaurant.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-500 mr-3" />
                  <a href={`tel:${restaurant.phone}`} className="text-gray-700 hover:text-blue-600">
                    {restaurant.phone}
                  </a>
                </div>
              )}

              {restaurant.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-500 mr-3" />
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 break-all"
                  >
                    {restaurant.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-24 text-gray-500">Cuisine:</span>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm capitalize">
                  {restaurant.keyword}
                </span>
              </div>
              
              {restaurant.price_range && (
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-500 mr-1" />
                  <span className="text-gray-700">Price Range: {restaurant.price_range}</span>
                </div>
              )}

              {restaurant.opening_hours && (
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                  <div className="text-gray-700">
                    {typeof restaurant.opening_hours === 'object' 
                      ? Object.entries(restaurant.opening_hours).map(([day, hours]) => (
                          <p key={day}>
                            <span className="font-medium">{day}:</span> {hours as string}
                          </p>
                        ))
                      : restaurant.opening_hours}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
          </div>
        )}

        {/* Gallery */}
        {restaurant.gallery_images && restaurant.gallery_images.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {restaurant.gallery_images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${restaurant.name} gallery ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </div>
        )}

        {/* Schema.org markup for SEO */}
        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": restaurant.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": restaurant.address || undefined,
        "addressLocality": restaurant.city,
        "addressRegion": restaurant.province,
      },
      ...(restaurant.phone && { "telephone": restaurant.phone }),
      ...(restaurant.website && { "url": restaurant.website }),
      ...(restaurant.keyword && { "servesCuisine": restaurant.keyword }),
      ...(restaurant.price_range && { "priceRange": restaurant.price_range }),
      // Only use YOUR users' reviews — never Google Maps data
      ...(userAverageRating && userReviewCount
        ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": Number(userAverageRating.toFixed(1)),
              "reviewCount": userReviewCount,
            }
          }
        : {}),
    }),
  }}
/>
      </div>
    </div>
  );
}