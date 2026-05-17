'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import {
  User,
  Heart,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              className="text-xl font-bold text-gray-900 hover:text-orange-300 transition-colors"
            >
              Indian<span className="text-orange-500">Restaurants</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/restaurants"
              className="text-gray-700 hover:text-orange-300 transition-colors"
            >
              Browse
            </Link>

            {user ? (
              <>
                <Link
                  href="/favorites"
                  className="text-gray-700 hover:text-orange-300 transition-colors flex items-center"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Favorites
                </Link>

                <Link
                  href="/my-reviews"
                  className="text-gray-700 hover:text-orange-300 transition-colors flex items-center"
                >
                  <Star className="w-4 h-4 mr-1" />
                  My Reviews
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-300 transition-colors">
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
                      {profile?.full_name ||
                        user.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>

                    {profile?.role === 'owner' && (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                    )}

                    {profile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-orange-300 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-300 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-3">
              <Link
                href="/restaurants"
                className="block text-gray-700 hover:text-orange-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>

              {user ? (
                <>
                  <Link
                    href="/favorites"
                    className="block text-gray-700 hover:text-orange-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Favorites
                  </Link>

                  <Link
                    href="/my-reviews"
                    className="block text-gray-700 hover:text-orange-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Reviews
                  </Link>

                  <Link
                    href="/profile"
                    className="block text-gray-700 hover:text-orange-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  {profile?.role === 'owner' && (
                    <Link
                      href="/dashboard"
                      className="block text-gray-700 hover:text-orange-300 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}

                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block text-gray-700 hover:text-orange-300 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-red-300 hover:text-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block bg-orange-300 text-white px-4 py-2 rounded-md text-center hover:bg-orange-700 transition-colors"
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