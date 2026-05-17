import Link from 'next/link';
import { Restaurant } from '@/types/restaurants';
import { Star, MapPin, Phone, Globe } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="p-6 flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {restaurant.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-700 font-medium">
                {restaurant.rating ? restaurant.rating : 'New'}
              </span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-600">
              {restaurant.review_count?.toLocaleString() || 0} reviews
            </span>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-start text-gray-600">
              <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <span className="text-sm line-clamp-2">
                {restaurant.address}, {restaurant.city}, {restaurant.province}
              </span>
            </div>
            
            {restaurant.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{restaurant.phone}</span>
              </div>
            )}
            
            {restaurant.website && (
              <div className="flex items-center text-gray-600">
                <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{restaurant.website}</span>
              </div>
            )}
          </div>

          {restaurant.keyword && (
            <div className="mt-4">
              <span className="inline-block bg-ornage-100 text-orange-800 text-xs px-2 py-1 rounded capitalize">
                {restaurant.keyword}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}