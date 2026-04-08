import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
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
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.salePrice && product.salePrice < product.price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </span>
        )}
        {/* Top-right actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {onToggleWishlist && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(product.id); }}
              className={`p-2 rounded-full shadow-md transition-all duration-300 ${
                isWishlisted
                  ? 'bg-red-50 text-red-500 opacity-100'
                  : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
              }`}
            >
              <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          )}
          <Link
            to={`/product/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full shadow-md bg-white text-gray-400 opacity-0 group-hover:opacity-100 hover:text-accent transition-all duration-300"
          >
            <Eye size={15} />
          </Link>
        </div>
        {/* Bottom add-to-cart overlay */}
        {onAddToCart && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product.id); }}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm text-primary text-xs font-medium py-2.5 rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent hover:text-white shadow-lg"
          >
            <ShoppingCart size={14} /> Thêm vào giỏ
          </button>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium line-clamp-2 hover:text-accent transition-colors min-h-[2.5rem] leading-snug">
          {product.name}
        </Link>
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
          </div>
        )}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-accent text-base">{formatCurrency(effectivePrice)}</span>
            {product.salePrice && product.salePrice < product.price && (
              <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
