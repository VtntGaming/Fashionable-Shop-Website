import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Sparkles, TrendingUp, Tag } from 'lucide-react';
import type { RootState } from '@/store';
import { productApi, recommendationApi } from '@/api/productApi';
import { categoryApi } from '@/api/categoryApi';
import { voucherApi } from '@/api/voucherApi';
import type { Product } from '@/types/product';
import type { ProductRecommendation } from '@/types/product';
import type { Category } from '@/types/category';
import type { Voucher } from '@/types/voucher';
import ProductCard from '@/components/product/ProductCard';
import { SkeletonGrid } from '@/components/ui/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<ProductRecommendation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredRes, catRes] = await Promise.all([
          productApi.getFeaturedProducts({ size: 8 }),
          categoryApi.getCategories(),
        ]);
        setFeatured(featuredRes.content);
        setCategories(catRes);

        try {
          const trendRes = await recommendationApi.getTrending(8);
          setTrending(trendRes);
        } catch { /* silent */ }

        try {
          const voucherRes = await voucherApi.getVouchers({ size: 4 });
          setVouchers(voucherRes.content);
        } catch { /* silent */ }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary to-primary-light text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Phong cách <span className="text-accent">thời trang</span> của bạn
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Khám phá bộ sưu tập mới nhất với chất lượng hàng đầu và thiết kế độc đáo.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-accent-light transition-colors">
              Mua sắm ngay <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-accent blur-3xl" />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
            <Link to="/shop" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} to={`/shop?categoryId=${cat.id}`} className="group text-center">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                  <ImageWithFallback src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-sm font-medium group-hover:text-accent transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-accent" />
            <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
          </div>
          <Link to="/shop" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
            Xem thêm <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <SkeletonGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="bg-surface-alt py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={22} className="text-accent" />
                <h2 className="text-2xl font-bold">Xu hướng</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vouchers */}
      {vouchers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Tag size={22} className="text-accent" />
              <h2 className="text-2xl font-bold">Ưu đãi hôm nay</h2>
            </div>
            <Link to="/vouchers" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              Tất cả voucher <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vouchers.map((v) => (
              <div key={v.id} className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-4">
                <div className="text-accent font-bold text-lg mb-1">
                  {v.discountType === 'PERCENT' ? `Giảm ${v.discountValue}%` : `Giảm ${formatCurrency(v.discountValue)}`}
                </div>
                <p className="text-xs text-gray-500 mb-2">Đơn tối thiểu {formatCurrency(v.minOrderValue)}</p>
                <div className="flex items-center justify-between">
                  <code className="bg-white px-3 py-1 rounded text-sm font-mono font-bold text-accent">{v.code}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(v.code); }}
                    className="text-xs text-accent hover:underline"
                  >
                    Sao chép
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
