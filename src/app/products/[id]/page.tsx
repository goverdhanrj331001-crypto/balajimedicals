'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductGallery } from '@/components/store/product-gallery';
import { ProductReviews } from '@/components/store/product-reviews';
import { ProductCard } from '@/components/store/product-card';
import { Accordion } from '@/components/ui/accordion';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = useIdParam(params);
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const found = (d.products as Product[]).find((p) => p.id === id);
        setProduct(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`/api/public/reviews?productId=${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setReviews(d.items ?? []))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
        <DesktopHeader />
        <StoreHeader search={true} />
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
        <DesktopFooter />
        <BottomNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
        <DesktopHeader />
        <StoreHeader search={true} />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="error_outline" className="text-[36px]" />
          </div>
          <h2 className="mt-4 text-[18px] font-bold text-[#1e293b]">Product Not Found</h2>
          <p className="mt-1 text-[13px] text-[#64748b]">The medicine or product you are looking for is unavailable.</p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#006872] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#00535b] shadow-xs"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            Back to All Products
          </Link>
        </div>
        <DesktopFooter />
        <BottomNav />
      </div>
    );
  }

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= product.reorderLevel;
  const currentPrice = selectedVariantId && product.variants
    ? Number(product.variants.find((v) => v.id === selectedVariantId)?.sellingPrice ?? product.price)
    : product.price;

  const onAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${product.shortName} × ${qty} added to cart`);
  };

  const onBuyNow = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast.error('Please select a variant first');
      return;
    }
    addToCart(product, qty);
    if (!user) {
      toast.info('Please log in to proceed to checkout');
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="app-root min-h-screen pb-32 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={true} />

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-5">
        {/* ─── Breadcrumb Navigation ─── */}
        <nav className="mb-4 flex items-center gap-2 text-[12.5px] text-[#64748b]" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-[#006872]">Home</Link>
          <span>/</span>
          <Link href="/products" className="transition hover:text-[#006872]">Products</Link>
          <span>/</span>
          <span className="font-semibold text-[#1e293b] truncate max-w-[240px]">{product.shortName}</span>
        </nav>

        {/* ─── Main Product Showcase Card ─── */}
        <div className="rounded-3xl bg-white p-5 md:p-8 border border-[#e2e8f0] shadow-xs">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left: Product Image Gallery (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative p-2">
                {product.badge && (
                  <span className="absolute left-2 top-2 z-10 rounded-md bg-[#fee2e2] border border-[#fecaca] px-2.5 py-1 text-[11px] font-bold text-[#b91c1c]">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="absolute right-2 top-2 z-10 rounded-md bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-1 text-[11px] font-bold text-[#047857]">
                    {discountPercent}% OFF
                  </span>
                )}
                <ProductGallery product={product} />
              </div>

              {/* Guarantees under image */}
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f8fafc] p-3 text-center border border-[#f1f5f9]">
                <div className="space-y-1">
                  <Icon name="verified" className="text-[20px] text-[#006872]" />
                  <p className="text-[10.5px] font-bold text-[#334155]">100% Genuine</p>
                </div>
                <div className="space-y-1 border-x border-[#e2e8f0]">
                  <Icon name="local_shipping" className="text-[20px] text-[#006872]" />
                  <p className="text-[10.5px] font-bold text-[#334155]">Fast Delivery</p>
                </div>
                <div className="space-y-1">
                  <Icon name="health_and_safety" className="text-[20px] text-[#006872]" />
                  <p className="text-[10.5px] font-bold text-[#334155]">Safe &amp; Tested</p>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Purchase Actions (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                {/* Brand & Stock Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#e6f4f5] px-3 py-1 text-[11.5px] font-bold text-[#006872]">
                    {product.brand}
                  </span>
                  {/* Stock Pill */}
                  {!inStock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-3 py-1 text-[11px] font-bold text-[#b91c1c]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" /> Out of Stock
                    </span>
                  ) : lowStock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1 text-[11px] font-bold text-[#b45309]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] animate-pulse" /> Only {product.stock} Left
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-bold text-[#047857]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> In Stock
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-[22px] md:text-[26px] font-bold text-[#0f172a] leading-tight">
                  {product.name}
                </h1>
                {product.note && (
                  <p className="text-[13px] text-[#64748b]">{product.note}</p>
                )}

                {/* Rating summary — only shown if real reviews exist */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex items-center gap-1 rounded-md bg-[#006872] px-2 py-0.5 text-[12px] font-bold text-white">
                      <span>{(reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)}</span>
                      <Icon name="star" className="text-[13px] fill-current" />
                    </div>
                    <span className="text-[12px] text-[#64748b]">
                      Based on {reviews.length} {reviews.length === 1 ? 'customer review' : 'customer reviews'}
                    </span>
                  </div>
                )}

                {/* Pricing Box */}
                <div className="rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] p-4 space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[28px] font-extrabold text-[#0f172a]">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </span>
                    {product.oldPrice && (
                      <span className="text-[15px] font-medium text-[#94a3b8] line-through">
                        ₹{product.oldPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-[12.5px] font-bold text-[#059669]">
                        Save ₹{(product.oldPrice! - product.price).toLocaleString('en-IN')} ({discountPercent}% OFF)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748b]">Inclusive of all applicable taxes</p>
                </div>

                {/* Variant Selector (if any) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[12px] font-bold text-[#334155]">Select Pack / Strength:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`rounded-xl border-2 px-3.5 py-2 text-left text-[12px] transition cursor-pointer ${
                            selectedVariantId === v.id
                              ? 'border-[#006872] bg-[#f0fdfa] text-[#006872]'
                              : 'border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1]'
                          }`}
                        >
                          <p className="font-bold">{v.name || `${v.dosageForm} ${v.strengthValue || ''} ${v.packSize} ${v.packUnit}`}</p>
                          <p className="text-[11px] text-[#64748b]">₹{Number(v.sellingPrice).toLocaleString('en-IN')}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-1 shrink-0">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[16px] font-bold text-[#334155] hover:bg-white transition cursor-pointer"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className="min-w-[36px] text-center text-[14px] font-bold text-[#1e293b]">{qty}</span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[16px] font-bold text-[#334155] hover:bg-white transition cursor-pointer"
                      onClick={() => setQty((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={onAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#006872] py-3 px-5 text-[13.5px] font-bold text-white transition hover:bg-[#00535b] shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    <Icon name="shopping_cart" className="text-[18px]" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Buy Now */}
                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={onBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#fc5d59] py-3 px-5 text-[13.5px] font-bold text-white transition hover:bg-[#e04d49] shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    <Icon name="bolt" className="text-[18px]" />
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Key Highlights */}
                {product.highlights && product.highlights.length > 0 && (
                  <div className="rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] p-4 mt-4">
                    <h3 className="text-[13px] font-bold text-[#1e293b]">Key Highlights</h3>
                    <ul className="mt-2 space-y-1.5">
                      {product.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12.5px] text-[#475569]">
                          <Icon name="check_circle" className="mt-0.5 text-[15px] text-[#006872] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Product Details Accordions / Information ─── */}
        <div className="mt-6 rounded-3xl bg-white p-5 md:p-8 border border-[#e2e8f0] shadow-xs space-y-6">
          {/* Description */}
          {(product.shortDescription || product.fullDescription || product.description) && (
            <div className="space-y-2">
              <h2 className="text-[18px] font-bold text-[#0f172a]">About this Product</h2>
              <p className="text-[13.5px] leading-relaxed text-[#475569]">
                {product.shortDescription || product.description}
              </p>
              {product.fullDescription && (
                <div className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-[#475569]">
                  {product.fullDescription}
                </div>
              )}
            </div>
          )}

          {/* Medical Info Accordion */}
          <div className="border-t border-[#f1f5f9] pt-6">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-3">Product Information &amp; Specifications</h3>
            <Accordion
              items={[
                { title: 'Uses & Indications', icon: 'medical_services', content: product.uses },
                { title: 'Key Benefits', icon: 'thumb_up', content: product.benefits },
                { title: 'How to Use / Administration', icon: 'restaurant_menu', content: product.howToUse },
                { title: 'Dosage Information', icon: 'vaccines', content: product.dosageInfo },
                { title: 'Safety Precautions', icon: 'warning', content: product.precautions },
                { title: 'Warnings & Interactions', icon: 'report', content: product.warnings },
                { title: 'Possible Side Effects', icon: 'error_outline', content: product.sideEffects },
                {
                  title: 'Composition & Specifications',
                  icon: 'info',
                  children: (product.manufacturer || product.composition?.length || product.dosageForm || product.storageCondition) ? (
                    <table className="w-full text-[12.5px]">
                      <tbody>
                        {product.manufacturer && (
                          <tr className="border-b border-[#f1f5f9]">
                            <td className="py-2.5 font-semibold text-[#64748b] w-1/3">Manufacturer</td>
                            <td className="py-2.5 text-[#1e293b] font-medium">{product.manufacturer}</td>
                          </tr>
                        )}
                        {product.composition && product.composition.length > 0 && (
                          <tr className="border-b border-[#f1f5f9]">
                            <td className="py-2.5 font-semibold text-[#64748b]">Composition</td>
                            <td className="py-2.5 text-[#1e293b] font-medium">
                              {product.composition.map((c, i) => (
                                <span key={i}>
                                  {c.salt} {c.strength}{i < product.composition!.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </td>
                          </tr>
                        )}
                        {product.dosageForm && (
                          <tr className="border-b border-[#f1f5f9]">
                            <td className="py-2.5 font-semibold text-[#64748b]">Dosage Form</td>
                            <td className="py-2.5 text-[#1e293b] font-medium">{product.dosageForm}</td>
                          </tr>
                        )}
                        {product.storageCondition && (
                          <tr className="border-b border-[#f1f5f9]">
                            <td className="py-2.5 font-semibold text-[#64748b]">Storage Instructions</td>
                            <td className="py-2.5 text-[#1e293b] font-medium">{product.storageCondition}</td>
                          </tr>
                        )}
                        {product.sku && (
                          <tr className="border-b border-[#f1f5f9]">
                            <td className="py-2.5 font-semibold text-[#64748b]">SKU Code</td>
                            <td className="py-2.5 text-[#1e293b] font-medium">{product.sku}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : undefined,
                },
              ]}
            />
          </div>
        </div>

        {/* ─── Customer Reviews Section ─── */}
        <div className="mt-6 rounded-3xl bg-white p-5 md:p-8 border border-[#e2e8f0] shadow-xs">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>

        {/* ─── Related Products ─── */}
        <RelatedProducts productId={product.id} categoryId={product.categoryId} brand={product.brand} />
      </main>

      {/* ─── Sticky Mobile Action Bar (Mobile Only) ─── */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#e2e8f0] bg-white px-4 py-2.5 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="shrink-0">
            <p className="text-[10px] uppercase font-bold text-[#64748b]">Price</p>
            <p className="text-[17px] font-bold text-[#0f172a]">
              ₹{currentPrice.toLocaleString('en-IN')}
            </p>
          </div>
          {/* Add to Cart */}
          <button
            type="button"
            disabled={!inStock}
            onClick={onAddToCart}
            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-[#006872] py-2.5 text-[12px] font-bold text-[#006872] disabled:opacity-50"
          >
            <Icon name="shopping_cart" className="text-[16px]" />
            Cart
          </button>
          {/* Buy Now */}
          <button
            type="button"
            disabled={!inStock}
            onClick={onBuyNow}
            className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#fc5d59] py-2.5 text-[12px] font-bold text-white disabled:opacity-50 shadow-xs"
          >
            <Icon name="bolt" className="text-[16px]" />
            Buy Now
          </button>
        </div>
      </div>

      <DesktopFooter />
      <BottomNav />
    </div>
  );
}

// ─── Related Products Component ──────────────────────────────────
function RelatedProducts({ productId, categoryId, brand }: { productId: string; categoryId?: string; brand?: string }) {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const all = d.products as Product[];
        const sameCat = all.filter((p) => p.id !== productId && p.categoryId === categoryId);
        const sameBrand = all.filter((p) => p.id !== productId && p.brand === brand && !sameCat.find((s) => s.id === p.id));
        const others = all.filter((p) => p.id !== productId && !sameCat.find((s) => s.id === p.id) && !sameBrand.find((s) => s.id === p.id));
        setRelated([...sameCat, ...sameBrand, ...others].slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId, categoryId, brand]);

  if (loading || related.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#0f172a]">Related Products</h2>
        <Link
          href="/products"
          className="rounded-lg bg-[#006872] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#00535b] shadow-2xs"
        >
          VIEW ALL
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

// Resolve params.id safely across sync/async Next.js param APIs.
function useIdParam(params: any): { id: string } {
  const [id, setId] = useState<string>(() => (params && typeof params.then !== 'function' ? params.id ?? '' : ''));
  useEffect(() => {
    let cancelled = false;
    if (params && typeof params.then === 'function') {
      params.then((p: any) => {
        if (!cancelled) setId(p.id);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [params]);
  return { id };
}
