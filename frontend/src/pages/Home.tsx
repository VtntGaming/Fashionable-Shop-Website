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

        setFeatured(dedupeBy(toArray(featuredRes), (item) => (item as Product).id ?? (item as Product).slug));
        setCategories(dedupeBy(toArray(catRes), (item) => (item as Category).id ?? (item as Category).slug));

        try {
          const trendRes = await recommendationApi.getTrending(8);
          setTrending(dedupeBy(toArray(trendRes), (item) => (item as ProductRecommendation).id ?? (item as ProductRecommendation).slug));
        } catch {
          setTrending([]);
        }

        try {
          const voucherRes = await voucherApi.getVouchers({ size: 4 });
          setVouchers(dedupeBy(toArray(voucherRes), (item) => (item as Voucher).id ?? (item as Voucher).code));
        } catch {
          setVouchers([]);
        }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="max-w-xl">
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-4">Bộ sưu tập mới 2025</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Phong cách <span className="text-accent">thời trang</span> của bạn
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Khám phá bộ sưu tập mới nhất với chất lượng hàng đầu và thiết kế độc đáo.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-full font-medium hover:bg-accent-light hover:shadow-lg hover:shadow-accent/25 transition-all duration-300">
                Mua sắm ngay <ArrowRight size={18} />
              </Link>
              <Link to="/vouchers" className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3.5 rounded-full font-medium hover:bg-white/10 transition-all duration-300">
                Xem ưu đãi
              </Link>
            </div>
            <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
              <div><span className="text-2xl font-bold text-accent">1000+</span><p className="text-sm text-gray-400 mt-1">Sản phẩm</p></div>
              <div><span className="text-2xl font-bold text-accent">500+</span><p className="text-sm text-gray-400 mt-1">Đánh giá</p></div>
              <div><span className="text-2xl font-bold text-accent">99%</span><p className="text-sm text-gray-400 mt-1">Hài lòng</p></div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-accent blur-[100px]" />
          <div className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-accent blur-[80px]" />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white blur-[60px]" />
        </div>
      </section>

      {/* Categories */}
      {Array.isArray(categories) && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
            <Link to="/shop" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat, index) => (
              <Link key={`category-${cat.id ?? cat.slug ?? index}`} to={`/shop?categoryId=${cat.id}`} className="group relative text-center">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                  <ImageWithFallback src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-medium text-white drop-shadow-sm">{cat.name}</p>
                  </div>
                </div>
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
            {featured.map((p, index) => (
              <ProductCard key={`featured-${p.id ?? p.slug ?? index}`} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      {Array.isArray(trending) && trending.length > 0 && (
        <section className="bg-surface-alt py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={22} className="text-accent" />
                <h2 className="text-2xl font-bold">Xu hướng</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending.map((p, index) => (
                <ProductCard key={`trending-${p.id ?? p.slug ?? index}`} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vouchers */}
      {Array.isArray(vouchers) && vouchers.length > 0 && (
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
            {vouchers.map((v, index) => (
              <div key={`voucher-${v.id ?? v.code ?? index}`} className="relative bg-white border-2 border-dashed border-accent/30 rounded-xl overflow-hidden hover:border-accent/60 transition-colors">
                <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-5">
                  <div className="text-accent font-bold text-xl mb-1">
                    {v.discountType === 'PERCENT' ? `Giảm ${v.discountValue}%` : `Giảm ${formatCurrency(v.discountValue)}`}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Đơn tối thiểu {formatCurrency(v.minOrderValue)}</p>
                  <div className="flex items-center justify-between">
                    <code className="bg-white border border-accent/20 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-accent">{v.code}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(v.code); }}
                      className="text-xs text-white bg-accent px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
