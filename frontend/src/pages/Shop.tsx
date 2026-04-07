import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { productApi } from '@/api/productApi';
import { categoryApi } from '@/api/categoryApi';
import type { Product, ProductFilter } from '@/types/product';
import type { Category } from '@/types/category';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonGrid } from '@/components/ui/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const SORT_OPTIONS = [
  { value: '', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'createdAt-desc', label: 'Mới nhất' },
  { value: 'averageRating-desc', label: 'Đánh giá cao' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { addToCart } = useCart();

  const page = parseInt(searchParams.get('page') || '0');
  const categoryId = searchParams.get('categoryId') || '';
  const keyword = searchParams.get('keyword') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const [sortBy, sortDir] = sort.split('-');
        const filter: ProductFilter = {
          page,
          size: 12,
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...(keyword && { keyword }),
          ...(sortBy && { sortBy }),
          ...(sortDir && { sortDir: sortDir as 'asc' | 'desc' }),
          ...(minPrice && { minPrice: parseInt(minPrice) }),
          ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
        };
        const res = await productApi.getProducts(filter);
        setProducts(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    }
    fetchProducts();
  }, [page, categoryId, keyword, sort, minPrice, maxPrice]);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
      else newParams.delete(k);
    });
    if (!updates.page) newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cửa hàng</h1>
          <p className="text-sm text-gray-500">{totalElements} sản phẩm</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-accent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal size={16} /> Lọc
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Desktop always visible, mobile as overlay */}
        <aside className={`${filterOpen ? 'fixed inset-0 z-50 bg-black/50 lg:bg-transparent lg:static lg:z-auto' : 'hidden lg:block'} lg:w-60 flex-shrink-0`}>
          <div className={`${filterOpen ? 'absolute right-0 top-0 h-full w-80 bg-white p-4 overflow-y-auto lg:static lg:w-auto lg:p-0' : ''}`}>
            {filterOpen && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold">Bộ lọc</h3>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
            )}

            {/* Category filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-3">Danh mục</h4>
              <div className="space-y-1">
                <button
                  onClick={() => updateParams({ categoryId: '' })}
                  className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!categoryId ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-gray-50'}`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { updateParams({ categoryId: String(cat.id) }); setFilterOpen(false); }}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${categoryId === String(cat.id) ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-3">Khoảng giá</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => updateParams({ minPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => updateParams({ maxPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            {(categoryId || keyword || minPrice || maxPrice) && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">
                Xóa bộ lọc
              </button>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {keyword && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Kết quả tìm kiếm cho:</span>
              <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">"{keyword}"</span>
              <button onClick={() => updateParams({ keyword: '' })} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <SkeletonGrid count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
              actionLabel="Xóa bộ lọc"
              actionLink="/shop"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateParams({ page: String(p) })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
