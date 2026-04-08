import { useEffect, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { wishlistApi } from '@/api/wishlistApi';
import type { WishlistItem } from '@/types/payment';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/common/PageHeader';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = () => {
    setLoading(true);
    wishlistApi.getWishlist()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);
  usePageTitle('Yêu thích');

  const handleRemove = async (productId: number) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setItems(items.filter(i => i.productId !== productId));
      toast.success('Đã xóa khỏi yêu thích');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  if (loading) return <LoadingSpinner />;

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Container className="page-padding">
      <PageHeader
        title={`Danh sách yêu thích (${safeItems.length})`}
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Yêu thích' }]}
      />

      {safeItems.length === 0 ? (
        <EmptyState
          icon={<Heart size={48} />}
          title="Chưa có sản phẩm yêu thích"
          description="Hãy thêm sản phẩm vào danh sách yêu thích"
          actionLabel="Khám phá ngay"
          actionLink="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {safeItems.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard
                product={{
                  id: item.productId,
                  name: item.productName,
                  imageUrl: item.productImage,
                  price: item.price,
                  salePrice: item.salePrice,
                  effectivePrice: item.salePrice || item.price,
                  slug: item.productSlug || '',
                  rating: 0,
                  views: 0,
                } satisfies import('@/types/product').ProductRecommendation}
                onAddToCart={addToCart}
              />
              <button
                onClick={() => handleRemove(item.productId)}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
