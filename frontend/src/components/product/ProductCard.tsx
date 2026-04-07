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
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        {product.salePrice && product.salePrice < product.price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </span>
        )}
        {onToggleWishlist && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(product.id); }}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-all duration-300 ${
              isWishlisted
                ? 'bg-red-50 text-red-500 opacity-100'
                : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </Link>
      <div className="p-3.5 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium line-clamp-2 hover:text-accent transition-colors min-h-[2.5rem]">
          {product.name}
        </Link>
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
          </div>
        )}
        <div className="mt-auto pt-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-accent">{formatCurrency(effectivePrice)}</span>
            {product.salePrice && product.salePrice < product.price && (
              <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
        {onAddToCart && (
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(product.id); }}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-primary text-white text-xs py-2.5 rounded-lg hover:bg-primary-light active:scale-[0.97] transition-all duration-200"
          >
            <ShoppingCart size={14} /> Thêm vào giỏ
          </button>
        )}
      </div>
    </div>
  );
}
