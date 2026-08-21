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
import { Accordion } from '@/components/ui/accordion';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = useIdParam(params);
  const router = useRouter();
  const { addToCart, cart, updateQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

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
  }, [id]);

  if (loading) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0">
        <DesktopHeader />
      <StoreHeader search={false} />
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
      <div className="app-root min-h-screen pb-16 md:pb-0">
        <DesktopHeader />
      <StoreHeader search={false} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon name="error_outline" className="text-[64px] text-[#bdc9ca]" />
          <p className="mt-3 text-[14px] font-bold">Product not found</p>
          <Link href="/products" className="mt-3 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white">
            Browse Products
          </Link>
        </div>
        <DesktopFooter />
      <BottomNav />
      </div>
    );
  }

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= product.reorderLevel;
  const cartItem = cart.find((i) => i.id === product.id);

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
    toast.success(`${product.shortName} × ${qty} — proceeding to checkout`);
    router.push('/checkout');
  };

  return (
    <div className="app-root min-h-screen pb-32 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <Link href="/products" className="mb-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#006872]">
          <Icon name="arrow_back" className="text-[16px]" /> Back to Products
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image + Gallery */}
          <div>
            <ProductGallery product={product} />
            {product.badge && (
              <span className="mt-2 inline-block rounded bg-[#fc5d59] px-2 py-1 text-[11px] font-bold text-[#600009]">
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-[11px] font-medium uppercase text-[#3e494a]">{product.brand}</p>
            <h1 className="mt-1 text-[24px] font-extrabold leading-tight">{product.name}</h1>
            <p className="mt-1 text-[13px] text-[#3e494a]">{product.note}</p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-[28px] font-extrabold">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="mb-1 text-[14px] text-[#6e797b] line-through">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {!inStock ? (
                <span className="inline-block rounded-full bg-[#ffdad7] px-3 py-1 text-[11px] font-bold text-[#910816]">Out of Stock</span>
              ) : lowStock ? (
                <span className="inline-block rounded-full bg-[#ffddb5] px-3 py-1 text-[11px] font-bold text-[#835400]">Low Stock — only {product.stock} left</span>
              ) : (
                <span className="inline-block rounded-full bg-[#d9eeee] px-3 py-1 text-[11px] font-bold text-[#006872]">In Stock</span>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[12px] font-bold text-[#3e494a]">Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`rounded-lg border-2 px-3 py-2 text-left text-[11px] transition ${
                        selectedVariantId === v.id
                          ? 'border-[#006872] bg-[#d9eeee]'
                          : 'border-[#bdc9ca] bg-white hover:border-[#006872]/50'
                      }`}
                    >
                      <p className="font-bold">{v.name || `${v.dosageForm} ${v.strengthValue || ''} ${v.packSize} ${v.packUnit}`}</p>
                      <p className="text-[10px] text-[#6e797b]">${Number(v.sellingPrice).toFixed(2)} · Stock: {v.stock}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prescription warning */}
            {product.prescriptionRequired && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#fff4f2] p-3">
                <Icon name="warning" className="text-[#910816]" />
                <div>
                  <p className="text-[12px] font-bold text-[#910816]">Prescription Required</p>
                  <p className="text-[11px] text-[#3e494a]">A valid prescription must be uploaded at checkout.</p>
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart / Buy Now — always show both buttons */}
            <div className="mt-5 flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center rounded-lg border border-[#bdc9ca]">
                <button
                  type="button"
                  className="px-3 py-2 text-[14px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="px-4 py-2 text-[13px] font-bold">{qty}</span>
                <button
                  type="button"
                  className="px-3 py-2 text-[14px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
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
                className="flex-1 rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#00535b] disabled:opacity-50"
              >
                <Icon name="add_shopping_cart" className="mr-1 align-middle text-[18px]" />
                Add to Cart
              </button>
              {/* Buy Now */}
              <button
                type="button"
                disabled={!inStock}
                onClick={onBuyNow}
                className="flex-1 rounded-lg bg-[#fc5d59] py-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#e04d49] disabled:opacity-50"
              >
                <Icon name="flash_on" className="mr-1 align-middle text-[18px]" />
                Buy Now
              </button>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[14px] font-bold">Key Highlights</h3>
                <ul className="mt-2 space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#3e494a]">
                      <Icon name="check_circle" className="mt-0.5 text-[16px] text-[#006872]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {(product.shortDescription || product.fullDescription || product.description) && (
              <div className="mt-6">
                <h3 className="text-[14px] font-bold">About this product</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#3e494a]">
                  {product.shortDescription || product.description}
                </p>
                {product.fullDescription && (
                  <div className="mt-3 whitespace-pre-line text-[13px] leading-6 text-[#3e494a]">
                    {product.fullDescription}
                  </div>
                )}
              </div>
            )}

            {/* Customer Info — Accordion */}
            <div className="mt-6">
              <Accordion
                items={[
                  { title: 'Uses', icon: 'medical_services', content: product.uses },
                  { title: 'Benefits', icon: 'thumb_up', content: product.benefits },
                  { title: 'How to Use', icon: 'restaurant_menu', content: product.howToUse },
                  { title: 'Dosage Information', icon: 'vaccines', content: product.dosageInfo },
                  { title: 'Precautions', icon: 'warning', content: product.precautions },
                  { title: 'Warnings', icon: 'report', content: product.warnings },
                  { title: 'Side Effects', icon: 'error_outline', content: product.sideEffects },
                  {
                    title: 'Specifications',
                    icon: 'info',
                    children: (product.manufacturer || product.composition?.length || product.dosageForm || product.storageCondition) ? (
                      <table className="w-full text-[12px]">
                        <tbody>
                          {product.manufacturer && (
                            <tr className="border-b border-[#f0eded]">
                              <td className="py-2 font-semibold text-[#6e797b]">Manufacturer</td>
                              <td className="py-2 text-[#1b1c1c]">{product.manufacturer}</td>
                            </tr>
                          )}
                          {product.composition && product.composition.length > 0 && (
                            <tr className="border-b border-[#f0eded]">
                              <td className="py-2 font-semibold text-[#6e797b]">Composition</td>
                              <td className="py-2 text-[#1b1c1c]">
                                {product.composition.map((c, i) => (
                                  <span key={i}>
                                    {c.salt} {c.strength}{i < product.composition!.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          )}
                          {product.dosageForm && (
                            <tr className="border-b border-[#f0eded]">
                              <td className="py-2 font-semibold text-[#6e797b]">Dosage Form</td>
                              <td className="py-2 text-[#1b1c1c]">{product.dosageForm}</td>
                            </tr>
                          )}
                          {product.storageCondition && (
                            <tr className="border-b border-[#f0eded]">
                              <td className="py-2 font-semibold text-[#6e797b]">Storage</td>
                              <td className="py-2 text-[#1b1c1c]">{product.storageCondition}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : undefined,
                  },
                ]}
              />
            </div>

            {/* SKU */}
            <div className="mt-6 border-t border-[#e4e2e1] pt-4 text-[11px] text-[#6e797b]">
              SKU: <span className="font-bold text-[#3e494a]">{product.sku}</span>
            </div>
          </div>
        </div>

        {/* Customer Reviews — above related products */}
        <ProductReviews productId={product.id} productName={product.name} />

        {/* Related Products */}
        <RelatedProducts productId={product.id} categoryId={product.categoryId} brand={product.brand} />
      </main>

      {/* Sticky Buy Now Bar — mobile only, above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#e4e2e1] bg-white px-3 py-2.5 shadow-[0_-2px_10px_rgba(0,0,0,.08)] md:hidden">
        <div className="flex items-center gap-2">
          {/* Price */}
          <div className="shrink-0">
            <p className="text-[10px] text-[#6e797b]">Price</p>
            <p className="text-[16px] font-extrabold text-[#1b1c1c]">
              ${selectedVariantId && product.variants
                ? Number(product.variants.find((v) => v.id === selectedVariantId)?.sellingPrice ?? product.price).toFixed(2)
                : product.price.toFixed(2)}
            </p>
          </div>
          {/* Add to Cart */}
          <button
            type="button"
            disabled={!inStock}
            onClick={onAddToCart}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-[#006872] py-2.5 text-[12px] font-bold text-[#006872] disabled:opacity-50"
          >
            <Icon name="add_shopping_cart" className="text-[16px]" />
            Cart
          </button>
          {/* Buy Now */}
          <button
            type="button"
            disabled={!inStock}
            onClick={onBuyNow}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#fc5d59] py-2.5 text-[12px] font-bold text-white disabled:opacity-50"
          >
            <Icon name="flash_on" className="text-[16px]" />
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
        // Same category first, then same brand, exclude current product
        const sameCat = all.filter((p) => p.id !== productId && p.categoryId === categoryId);
        const sameBrand = all.filter((p) => p.id !== productId && p.brand === brand && !sameCat.find((s) => s.id === p.id));
        const others = all.filter((p) => p.id !== productId && !sameCat.find((s) => s.id === p.id) && !sameBrand.find((s) => s.id === p.id));
        setRelated([...sameCat, ...sameBrand, ...others].slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId, categoryId, brand]);

  if (loading || related.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-bold">Related Products</h2>
        <Link href="/products" className="rounded bg-[#006872] px-3 py-1 text-[12px] font-bold text-white">
          VIEW ALL
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="soft-card group rounded-xl p-2 transition hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-[#f5f3f3]">
              {p.thumbnail || p.imageUrl ? (
                <img
                  src={p.thumbnail || p.imageUrl}
                  alt={p.shortName}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Icon name="medication" className="text-[32px] text-[#bdc9ca]" />
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-[11px] font-semibold">{p.shortName}</p>
            <p className="text-[12px] font-bold text-[#006872]">${Number(p.price).toFixed(2)}</p>
          </Link>
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
