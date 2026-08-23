import { cn } from '@/lib/utils';
import { Icon } from './icon';

interface ProductArtProps {
  product: {
    icon?: string;
    tint?: string;
    imageUrl?: string;
    thumbnail?: string;
    name?: string;
  };
  className?: string;
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
}

export function ProductArt({ product, className = '', lazy = true }: ProductArtProps) {
  const img = product.thumbnail || product.imageUrl;
  if (img) {
    const cleanImg = img.replace(/&#x2F;/g, '/');
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-transparent', className)}>
        <img
          src={cleanImg}
          alt={product.name ?? 'Product image'}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center rounded-xl', className)}
      style={{ backgroundColor: product.tint || '#f5f3f3' }}
    >
      <Icon name={product.icon || 'medication'} className="text-[42px] text-[#006872]" />
    </div>
  );
}
