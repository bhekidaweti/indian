'use client';

import { useState } from 'react';
import { Review } from '@/types/restaurants';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Star, User, Trash2, Edit, AlertCircle, Loader2 } from 'lucide-react';

interface RestaurantReviewsProps {
  reviews: Review[];
  restaurantId: string;
  userId?: string;
}

export default function RestaurantReviews({ reviews: initialReviews, restaurantId, userId }: RestaurantReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const userReview = reviews.find(r => r.user_id === userId);
  const hasReviewed = !!userReview;

  const startEditing = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditText(review.review_text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditRating(5);
    setEditText('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (!reviewText.trim()) {
      setError('Please write a review before submitting.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // First, ensure user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        await supabase.from('profiles').insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          username: user.email?.split('@')[0],
          role: 'user'
        }]);
      }

      // Insert review
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([{
          restaurant_id: restaurantId,
          user_id: user.id,
          rating,
          review_text: reviewText.trim(),
        }])
        .select(`
          *,
          profiles!reviews_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Transform the response to match Review type
      const newReview = {
        ...data,
        user: data.profiles
      } as Review;

      setReviews([newReview, ...reviews]);
      setRating(5);
      setReviewText('');
      setSuccess('Your review has been posted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const { data, error: updateError } = await supabase
        .from('reviews')
        .update({
          rating: editRating,
          review_text: editText,
        })
        .eq('id', reviewId)
        .select(`
          *,
          profiles!reviews_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (updateError) throw updateError;

      const updatedReview = {
        ...data,
        user: data.profiles
      } as Review;

      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
      setEditingId(null);
      setSuccess('Your review has been updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return;

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
      setSuccess('Your review has been deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (ratingValue: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!interactive || submitting}
          >
            <Star
              className={`w-5 h-5 ${
                star <= ratingValue
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

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const getUserDisplayName = (review: Review): string => {
    if (review.user?.full_name) return review.user.full_name;
    if (review.user?.username) return review.user.username;
    return 'Anonymous User';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-900 mr-2">{averageRating.toFixed(1)}</span>
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
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

      {!hasReviewed ? (
        <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            {renderStars(rating, true, setRating)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Share your experience at this restaurant..."
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-orange-50 rounded-lg text-orange-800 text-sm">
          You've already reviewed this restaurant. You can edit or delete your review below.
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this restaurant!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              {editingId === review.id ? (
                <div className="space-y-3">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateReview(review.id)}
                      disabled={submitting}
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
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
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {review.user?.avatar_url ? (
                          <img src={review.user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getUserDisplayName(review)}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.user_id === userId && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(review)}
                          disabled={submitting}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {review.review_text && (
                    <p className="mt-3 text-gray-700 leading-relaxed">{review.review_text}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}