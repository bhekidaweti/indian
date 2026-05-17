'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Review, Restaurant } from '@/types/restaurant';
import { Star, Trash2, Edit, AlertCircle, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';

interface MyReview extends Review {
  restaurant?: Restaurant;
}

export default function MyReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      fetchMyReviews();
    }
  }, [user, authLoading]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch reviews with restaurant data using two-step approach
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Get unique restaurant IDs
      const restaurantIds = [...new Set(reviewsData.map(r => r.restaurant_id))];

      // Fetch restaurant details
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', restaurantIds);

      if (restaurantsError) throw restaurantsError;

      // Create a map of restaurants by ID
      const restaurantsMap = new Map();
      restaurantsData?.forEach(r => restaurantsMap.set(r.id, r));

      // Combine reviews with restaurant data
      const combinedReviews = reviewsData.map(review => ({
        ...review,
        restaurant: restaurantsMap.get(review.restaurant_id)
      }));

      setReviews(combinedReviews);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating: editRating,
          review_text: editText,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (updateError) throw updateError;

      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId 
          ? { ...r, rating: editRating, review_text: editText }
          : r
      ));
      
      setEditingId(null);
      setSuccess('Review updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh to update restaurant ratings
      setTimeout(() => fetchMyReviews(), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string, restaurantName: string) => {
    if (!confirm(`Are you sure you want to delete your review for "${restaurantName}"?`)) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (deleteError) throw deleteError;

      setReviews(reviews.filter(r => r.id !== reviewId));
      setSuccess('Review deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (review: MyReview) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditText(review.review_text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditRating(5);
    setEditText('');
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
            disabled={!interactive || submitting}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">
          Manage all your restaurant reviews in one place
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          {success}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Star className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't written any reviews yet. Start exploring restaurants and share your experience!
          </p>
          <Link
            href="/restaurants"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Restaurant Header */}
              <Link href={`/restaurants/${review.restaurant?.slug}`}>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Building2 className="w-5 h-5" />
                      <h3 className="font-semibold">{review.restaurant?.name}</h3>
                    </div>
                    <span className="text-white/80 text-sm">
                      {review.restaurant?.city}, {review.restaurant?.province}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Review Content */}
              <div className="p-6">
                {editingId === review.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      {renderStars(editRating, true, setEditRating)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateReview(review.id)}
                        disabled={submitting}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={submitting}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(review)}
                          disabled={submitting}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id, review.restaurant?.name || '')}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {review.review_text && (
                      <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}