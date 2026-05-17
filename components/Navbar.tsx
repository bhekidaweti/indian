'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { User, Heart, Star, Menu, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const cities = [
    { name: 'Johannesburg', slug: 'johannesburg' },
    { name: 'Durban', slug: 'durban' },
    { name: 'Cape Town', slug: 'cape-town' },
    { name: 'Pretoria', slug: 'pretoria' },
    { name: 'Sandton', slug: 'sandton' },
    { name: 'Midrand', slug: 'midrand' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-orange-500 transition-colors"
            > 
            <img src="/logo-ind.png" 
                  alt="Logo" 
                  className="w-20 h-20 mr-2" />
              {/*Indian<span className="text-orange-500">Restaurants</span> */}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">

            {/* Cities Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-700 hover:text-orange-500 transition-colors">
                Cities
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {city.name}
                  </Link>
                ))}
                <Link
                  href="/restaurants"
                  className="block px-4 py-2 text-sm text-orange-500 hover:bg-orange-50 border-t transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View All Cities →
                </Link>
              </div>
            </div>

            {user ? (
              <>
                <Link
                  href="/favorites"
                  className="text-gray-700 hover:text-orange-500 transition-colors flex items-center"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Favorites
                </Link>

                <Link
                  href="/my-reviews"
                  className="text-gray-700 hover:text-orange-500 transition-colors flex items-center"
                >
                  <Star className="w-4 h-4 mr-1" />
                  My Reviews
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full flex items-center justify-center text-white overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Profile
                    </Link>

                    {profile?.role === 'owner' && (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}

                    {profile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-500 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-3">
              <Link
                href="/restaurants"
                className="block text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>

              {/* Cities Section in Mobile */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Cities
                </p>
                <div className="space-y-2 pl-2">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}`}
                      className="block text-gray-600 hover:text-orange-500 transition-colors text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              {user ? (
                <>
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Account
                    </p>
                    <div className="space-y-2 pl-2">
                      <Link
                        href="/favorites"
                        className="block text-gray-600 hover:text-orange-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Favorites
                      </Link>

                      <Link
                        href="/my-reviews"
                        className="block text-gray-600 hover:text-orange-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Reviews
                      </Link>

                      <Link
                        href="/profile"
                        className="block text-gray-600 hover:text-orange-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>

                      {profile?.role === 'owner' && (
                        <Link
                          href="/dashboard"
                          className="block text-gray-600 hover:text-orange-500 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}

                      {profile?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block text-gray-600 hover:text-orange-500 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left text-red-600 hover:text-red-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block bg-orange-500 text-white px-4 py-2 rounded-md text-center hover:bg-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}