'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: number;
}

interface ReviewableOrder {
  orderId: string;
  orderDate: string;
}

export function ProductReviews({ productId, productName }: { productId: string; productName: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reviewableOrders, setReviewableOrders] = useState<ReviewableOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/public/reviews?productId=${encodeURIComponent(productId)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setReviews(d.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  // Fetch user's delivered orders that contain this product
  useEffect(() => {
    if (!user) return;
    fetch('/api/public/orders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const delivered = (d.items ?? []).filter(
          (o: any) =>
            (o.status === 'Delivered' || o.status === 'Completed') &&
            o.items?.some((item: any) => item.productId === productId),
        );
        setReviewableOrders(
          delivered.map((o: any) => ({
            orderId: o.id,
            orderDate: new Date(o.createdAt).toLocaleDateString(),
          })),
        );
      })
      .catch(() => {});
  }, [user, productId]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error('Please select an order');
      return;
    }
    if (!title.trim() || !comment.trim()) {
      toast.error('Please fill in title and comment');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          orderId: selectedOrder,
          rating,
          title,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit review');
      toast.success('Review submitted successfully!');
      setReviews((prev) => [{ ...data.item }, ...prev]);
      setShowForm(false);
      setTitle('');
      setComment('');
      setRating(5);
      setSelectedOrder('');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-bold">
          Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {user && reviewableOrders.length > 0 && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#00535b]"
          >
            <Icon name="rate_review" className="mr-1 text-[16px]" /> Write a Review
          </button>
        )}
      </div>

      {/* Average rating */}
      {reviews.length > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-[#f5f3f3] p-4">
          <div className="text-center">
            <p className="text-[32px] font-extrabold text-[#006872]">{avgRating.toFixed(1)}</p>
            <div className="flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Icon
                  key={s}
                  name="star"
                  filled={s <= Math.round(avgRating)}
                  className={`text-[16px] ${s <= Math.round(avgRating) ? 'text-[#ffc107]' : 'text-[#bdc9ca]'}`}
                />
              ))}
            </div>
            <p className="mt-1 text-[10px] text-[#6e797b]">{reviews.length} reviews</p>
          </div>
          <div className="h-12 w-px bg-[#bdc9ca]" />
          <p className="text-[12px] text-[#3e494a]">
            Based on customer feedback from verified purchases
          </p>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={submitReview} className="mb-4 rounded-xl border border-[#e4e2e1] bg-white p-4">
          <h3 className="mb-3 text-[14px] font-bold">Write a Review</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Select Order *</span>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                required
              >
                <option value="">Choose an order...</option>
                {reviewableOrders.map((o) => (
                  <option key={o.orderId} value={o.orderId}>
                    #{o.orderId} — {o.orderDate}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Rating *</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1"
                  >
                    <Icon
                      name="star"
                      filled={s <= rating}
                      className={`text-[24px] ${s <= rating ? 'text-[#ffc107]' : 'text-[#bdc9ca]'}`}
                    />
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Title *</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Great product!"
                required
                className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Comment *</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                required
                className="min-h-20 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-[#bdc9ca] bg-white px-4 py-2 text-[12px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl bg-[#f5f3f3] p-6 text-center">
          <Icon name="reviews" className="text-[36px] text-[#bdc9ca]" />
          <p className="mt-2 text-[12px] font-bold">No reviews yet</p>
          <p className="text-[11px] text-[#6e797b]">
            {user
              ? reviewableOrders.length > 0
                ? 'Be the first to review this product!'
                : 'Purchase and receive this product to write a review.'
              : 'Login and purchase this product to write a review.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="soft-card rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006872] text-[12px] font-bold text-white">
                    {r.userName?.slice(0, 1).toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold">{r.userName}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Icon
                          key={s}
                          name="star"
                          filled={s <= r.rating}
                          className={`text-[12px] ${s <= r.rating ? 'text-[#ffc107]' : 'text-[#bdc9ca]'}`}
                        />
                      ))}
                      <span className="ml-1 text-[10px] text-[#6e797b]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-[#d9eeee] px-2 py-0.5 text-[9px] font-bold text-[#006872]">
                  ✓ Verified Purchase
                </span>
              </div>
              <p className="mt-2 text-[13px] font-bold">{r.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#3e494a]">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
