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
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/common/SectionHeader';
import { useCart } from '@/hooks/useCart';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/utils/formatCurrency';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { toArray, dedupeBy } from '@/utils/arrayHelpers';
import toast from 'react-hot-toast';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<ProductRecommendation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { addToCart } = useCart();
  usePageTitle();

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
        <Container className="py-16 md:py-24 lg:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Content */}
            <div>
              <p className="text-accent font-medium tracking-wider uppercase text-sm mb-4">Bộ sưu tập mới 2026</p>
              <h1 className="text-[clamp(2rem,5vw,3.75rem)] font-bold leading-tight mb-6">
                Phong cách <span className="text-accent">thời trang</span> của bạn
              </h1>
              <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-[90%]">
                Khám phá bộ sưu tập mới nhất với chất lượng hàng đầu và thiết kế độc đáo.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/shop" className="inline-flex items-center gap-2 bg-accent text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium hover:bg-accent-light hover:shadow-lg hover:shadow-accent/25 transition-all duration-300">
                  Mua sắm ngay <ArrowRight size={18} />
                </Link>
                <Link to="/vouchers" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium hover:bg-white/10 transition-all duration-300">
                  Xem ưu đãi
                </Link>
              </div>
              <div className="flex gap-6 sm:gap-8 mt-10 pt-8 border-t border-white/10">
                <div><span className="text-xl sm:text-2xl font-bold text-accent">1000+</span><p className="text-xs sm:text-sm text-gray-400 mt-1">Sản phẩm</p></div>
                <div><span className="text-xl sm:text-2xl font-bold text-accent">500+</span><p className="text-xs sm:text-sm text-gray-400 mt-1">Đánh giá</p></div>
                <div><span className="text-xl sm:text-2xl font-bold text-accent">99%</span><p className="text-xs sm:text-sm text-gray-400 mt-1">Hài lòng</p></div>
              </div>
            </div>
            {/* Right: Visual decoration */}
            <div className="hidden md:flex items-center justify-center relative">
              <div className="relative w-[min(100%,22rem)] lg:w-[min(100%,26rem)] aspect-square">
                {/* Decorative rings */}
                <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-[8%] rounded-full border border-white/10 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-[16%] rounded-full border border-accent/10" />
                {/* Center circle with icon */}
                <div className="absolute inset-[22%] rounded-full bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl lg:text-6xl mb-2">👗</div>
                    <p className="text-accent font-semibold text-sm tracking-wider">FASHION</p>
                    <p className="text-white/60 text-xs mt-1">Premium Quality</p>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute top-[5%] right-[5%] bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 animate-bounce" style={{ animationDuration: '3s' }}>
                  <p className="text-accent font-bold text-sm">New</p>
                  <p className="text-white/70 text-[10px]">Collection</p>
                </div>
                <div className="absolute bottom-[10%] left-0 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <p className="text-accent font-bold text-sm">-50%</p>
                  <p className="text-white/70 text-[10px]">Sale off</p>
                </div>
                <div className="absolute top-1/2 -right-[2%] bg-accent/20 backdrop-blur-md rounded-xl px-3 py-2 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                  <p className="text-white font-bold text-sm">⭐ 4.9</p>
                  <p className="text-white/70 text-[10px]">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
        {/* Background blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[5%] right-[10%] w-[25vw] max-w-[20rem] aspect-square rounded-full bg-accent blur-[100px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[20vw] max-w-[15rem] aspect-square rounded-full bg-accent blur-[80px]" />
          <div className="absolute top-1/2 right-1/4 w-[12vw] max-w-[10rem] aspect-square rounded-full bg-white blur-[60px]" />
        </div>
      </section>

      {/* Categories */}
      {Array.isArray(categories) && categories.length > 0 && (
        <section className="section-padding">
          <Container>
          <SectionHeader title="Danh mục sản phẩm" subtitle="Khám phá theo phong cách của bạn" actionLabel="Xem tất cả" actionLink="/shop" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {categories.slice(0, 6).map((cat, index) => {
              const gradients = [
                'from-blue-500/80 to-indigo-600/80',
                'from-rose-500/80 to-pink-600/80',
                'from-amber-500/80 to-orange-600/80',
                'from-emerald-500/80 to-teal-600/80',
                'from-violet-500/80 to-purple-600/80',
                'from-cyan-500/80 to-blue-600/80',
              ];
              const gradient = gradients[index % gradients.length];
              const emojis = ['👔', '👗', '👟', '👜', '🧥', '💍'];
              return (
                <Link key={`category-${cat.id ?? cat.slug ?? index}`} to={`/shop?categoryId=${cat.id}`} className="group relative text-center">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                    {cat.imageUrl ? (
                      <>
                        <ImageWithFallback src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl" />
                      </>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                        <span className="text-4xl lg:text-5xl drop-shadow-lg">{emojis[index % emojis.length]}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-semibold text-white drop-shadow-md">{cat.name}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          </Container>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-white section-padding">
        <Container>
          <SectionHeader icon={<Sparkles size={22} className="text-accent" />} title="Sản phẩm nổi bật" subtitle="Được yêu thích nhất tuần này" actionLabel="Xem thêm" actionLink="/shop" />
          {loading ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((p, index) => (
                <ProductCard key={`featured-${p.id ?? p.slug ?? index}`} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Trending */}
      {Array.isArray(trending) && trending.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white section-padding">
            <Container>
            <SectionHeader icon={<TrendingUp size={22} className="text-accent" />} title="Xu hướng" subtitle="Sản phẩm đang hot nhất" actionLabel="Xem thêm" actionLink="/shop" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {trending.map((p, index) => (
                <ProductCard key={`trending-${p.id ?? p.slug ?? index}`} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA Banner */}
      <Container className="section-padding">
        <div className="relative bg-gradient-to-r from-primary via-primary-light to-primary rounded-3xl overflow-hidden px-6 sm:px-8 py-10 sm:py-12 md:py-16 md:px-14">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Đăng ký nhận ưu đãi</h2>
            <p className="text-gray-300 mb-6">Nhận ngay voucher giảm giá khi đăng ký tài khoản mới. Cập nhật xu hướng thời trang mới nhất.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full font-medium hover:bg-accent-light transition-all duration-300">
                Đăng ký ngay <ArrowRight size={16} />
              </Link>
              <Link to="/shop" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-all duration-300">
                Khám phá
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-0 right-0 w-[20vw] max-w-[16rem] aspect-square rounded-full bg-accent blur-[80px]" />
            <div className="absolute bottom-0 left-1/3 w-[15vw] max-w-[12rem] aspect-square rounded-full bg-white blur-[60px]" />
          </div>
        </div>
      </Container>

      {/* Vouchers */}
      {Array.isArray(vouchers) && vouchers.length > 0 && (
        <section className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 section-padding">
            <Container>
            <SectionHeader icon={<Tag size={22} className="text-accent" />} title="Ưu đãi hôm nay" subtitle="Nhập mã để được giảm giá ngay" actionLabel="Tất cả voucher" actionLink="/vouchers" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {vouchers.map((v, index) => (
                <div key={`voucher-${v.id ?? v.code ?? index}`} className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent rounded-l-2xl" />
                  <div className="p-5 pl-5">
                    <div className="text-accent font-bold text-xl mb-1">
                      {v.discountType === 'PERCENT' ? `Giảm ${v.discountValue}%` : `Giảm ${formatCurrency(v.discountValue)}`}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Đơn tối thiểu {formatCurrency(v.minOrderValue)}</p>
                    <div className="flex items-center justify-between">
                      <code className="bg-accent/5 border border-accent/20 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-accent">{v.code}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(v.code); toast.success('Đã sao chép mã!'); }}
                        className="text-xs text-white bg-accent px-4 py-2 rounded-lg hover:bg-accent-light transition-colors font-medium"
                      >
                        Sao chép
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
