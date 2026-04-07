import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Product } from '@/types/product';
import type { ProductRecommendation } from '@/types/product';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface ProductCardProps {
  product: Product | ProductRecommendation;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted }: ProductCardProps) {
  const effectivePrice = product.effectivePrice ?? product.price;
  const rating = 'averageRating' in product ? (product as Product).averageRating : ('rating' in product ? (product as ProductRecommendation).rating : 0);

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.salePrice && product.salePrice < product.price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </span>
        )}
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium line-clamp-2 hover:text-accent transition-colors min-h-[2.5rem]">
          {product.name}
        </Link>
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
          </div>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent text-sm">{formatCurrency(effectivePrice)}</span>
            {product.salePrice && product.salePrice < product.price && (
              <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {onAddToCart && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(product.id); }}
              className="flex-1 flex items-center justify-center gap-1 bg-primary text-white text-xs py-2 rounded-lg hover:bg-primary-light transition-colors"
            >
              <ShoppingCart size={14} /> Thêm
            </button>
          )}
          {onToggleWishlist && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }}
              className={`p-2 rounded-lg border transition-colors ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 hover:border-red-200 hover:text-red-500'}`}
            >
              <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
