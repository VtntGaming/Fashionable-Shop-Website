import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, ShoppingBag } from 'lucide-react';
import { productApi, recommendationApi } from '@/api/productApi';
import { reviewApi } from '@/api/reviewApi';
import { wishlistApi } from '@/api/wishlistApi';
import type { Product, ProductRecommendation } from '@/types/product';
import type { Review } from '@/types/review';
import type { RootState } from '@/store';
import ProductCard from '@/components/product/ProductCard';
import StarRating from '@/components/common/StarRating';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatRelative } from '@/utils/formatDate';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

function toArray<T>(value: T[] | { content?: T[] } | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray((value as { content?: T[] }).content)) {
    return (value as { content?: T[] }).content ?? [];
  }
  return [];
}

function dedupeBy<T>(items: T[], getKey: (item: T, index: number) => string | number | undefined) {
  const seen = new Set<string | number>();
  return items.filter((item, index) => {
    const key = getKey(item, index) ?? `fallback-${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<ProductRecommendation[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productApi.getProductBySlug(slug)
      .then(async (p) => {
        setProduct(p);
        setQuantity(1);
        setSelectedImage(0);
        try {
          const [revRes, simRes] = await Promise.all([
            reviewApi.getProductReviews(p.id, { page: 0, size: 10 }),
            recommendationApi.getSimilarProducts(p.id, 6),
          ]);
          setReviews(dedupeBy(toArray(revRes?.content ?? revRes), (item) => (item as Review).id));
          setSimilar(dedupeBy(toArray(simRes), (item) => (item as ProductRecommendation).id ?? (item as ProductRecommendation).slug));
        } catch {
          setReviews([]);
          setSimilar([]);
        }
        if (isAuthenticated) {
          try { const w = await wishlistApi.checkWishlist(p.id); setIsWishlisted(w); } catch { /* silent */ }
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug, isAuthenticated]);

  const handleAddToCart = () => {
    if (product) addToCart(product.id, quantity);
  };

  const handleToggleWishlist = async () => {
    if (!product || !isAuthenticated) return;
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(product.id);
        setIsWishlisted(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await wishlistApi.addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newReview = await reviewApi.createReview({ productId: product.id, rating: reviewRating, comment: reviewComment });
      setReviews((prev) => [newReview, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Đã gửi đánh giá!');
    } catch { toast.error('Không thể gửi đánh giá'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-16"><p>Không tìm thấy sản phẩm.</p><Link to="/shop" className="text-accent mt-4 inline-block">Quay lại cửa hàng</Link></div>;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div className="w-[90%] max-w-screen-xl 2xl:max-w-screen-2xl mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-accent">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-accent">Cửa hàng</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
            <ImageWithFallback src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? 'border-accent' : 'border-transparent'}`}>
                  <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.averageRating} size={16} />
            <span className="text-sm text-gray-500">({product.reviewCount} đánh giá)</span>
            {product.brand && <span className="text-sm text-gray-500">Thương hiệu: <strong>{product.brand}</strong></span>}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-accent">{formatCurrency(product.effectivePrice)}</span>
            {product.salePrice && product.salePrice < product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                  -{Math.round((1 - product.salePrice / product.price) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <ShoppingBag size={16} />
            {product.stock > 0 ? <span className="text-green-600">Còn {product.stock} sản phẩm</span> : <span className="text-red-500">Hết hàng</span>}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium">Số lượng:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50"><Minus size={16} /></button>
              <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-50"><Plus size={16} /></button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || !isAuthenticated}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} /> Thêm vào giỏ hàng
            </button>
            {isAuthenticated && (
              <button
                onClick={handleToggleWishlist}
                className={`px-4 py-3 rounded-xl border transition-colors ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 hover:border-red-200 hover:text-red-500'}`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Đánh giá sản phẩm</h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium mb-3">Viết đánh giá</h3>
            <div className="mb-3">
              <StarRating rating={reviewRating} onChange={setReviewRating} readonly={false} />
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Nhận xét của bạn..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none mb-3"
            />
            <button
              type="submit"
              disabled={submittingReview || !reviewComment.trim()}
              className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50"
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        )}

        {!Array.isArray(reviews) || reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, index) => (
              <div key={`review-${r.id ?? index}`} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={r.rating} size={14} />
                  <span className="text-xs text-gray-500">{formatRelative(r.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar products */}
      {Array.isArray(similar) && similar.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similar.map((p, index) => (
              <ProductCard key={`similar-${p.id ?? p.slug ?? index}`} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
