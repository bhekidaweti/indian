'use client';

import Link from 'next/link';
import { MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // List of cities with their display names and slugs
  const cities = [
    { name: 'Johannesburg', slug: 'johannesburg' },
    { name: 'Durban', slug: 'durban' },
    { name: 'Cape Town', slug: 'cape-town' },
    { name: 'Pretoria', slug: 'pretoria' },
    { name: 'Sandton', slug: 'sandton' },
    { name: 'Midrand', slug: 'midrand' }
  ];

  // Popular search categories
  const popularSearches = [
    { name: 'Halal Indian Restaurants', slug: 'halal', query: 'halal' },
    { name: 'Indian Takeaways', slug: 'takeaways', query: 'indian takeaways' },
    { name: 'Biryani Restaurants', slug: 'biryani', query: 'biryani' },
    { name: 'Vegetarian Indian', slug: 'vegetarian', query: 'vegetarian indian' },
    { name: 'Best Curry Houses', slug: 'curry', query: 'curry' },
    { name: 'South Indian Food', slug: 'south-indian', query: 'south indian' }
  ];

  return (
    <footer className="bg-orange-400 text-gray-900 mt-16">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white">
              Indian<span className="text-orange-700">Restaurants</span>
            </Link>
            <p className="mt-4 text-sm leading-7 text-gray-950">
              Discover authentic Indian restaurants, takeaways, curry houses, 
              and halal dining experiences across South Africa.
            </p>
          </div>

          {/* Explore Cities */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Explore Cities</h3>
            <ul className="space-y-3 text-sm">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}`}
                    className="hover:text-red-700 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3 h-3" />
                    {city.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/restaurants"
                  className="hover:text-red-700 transition-colors text-orange-400 mt-2 inline-block"
                >
                  View All Cities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Searches */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Popular Searches</h3>
            <ul className="space-y-3 text-sm">
              {popularSearches.map((search) => (
                <li key={search.slug}>
                  <Link
                    href={`/search?keyword=${encodeURIComponent(search.query)}`}
                    className="hover:text-red-700 transition-colors"
                  >
                    {search.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-700 mt-0.5 flex-shrink-0" />
                <span>South Africa</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-700 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@indianrestaurants.co.za"
                  className="hover:text-orange-900 transition-colors"
                >
                  info@indianrestaurants.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-950">
          <p>© {currentYear} IndianRestaurantNearMe.co.za. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-orange-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-orange-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}