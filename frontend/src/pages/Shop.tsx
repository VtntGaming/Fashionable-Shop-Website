import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productApi } from '@/api/productApi';
import { categoryApi } from '@/api/categoryApi';
import type { Product, ProductFilter } from '@/types/product';
import type { Category } from '@/types/category';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonGrid } from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';
import { useCart } from '@/hooks/useCart';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { formatCurrency } from '@/utils/formatCurrency';
import { toArray, dedupeBy } from '@/utils/arrayHelpers';

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
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { addToCart } = useCart();
  usePageTitle('Cửa hàng');

  const page = parseInt(searchParams.get('page') || '0');
  const categoryId = searchParams.get('categoryId') || '';
  const keyword = searchParams.get('keyword') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    categoryApi.getCategories()
      .then((res) => setCategories(dedupeBy(toArray(res), (item) => (item as Category).id ?? (item as Category).slug)))
      .catch(() => setCategories([]));
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
        setProducts(dedupeBy(toArray(res?.content), (item) => (item as Product).id ?? (item as Product).slug));
        setTotalPages(typeof res?.totalPages === 'number' ? res.totalPages : 0);
        setTotalElements(typeof res?.totalElements === 'number' ? res.totalElements : 0);
      } catch {
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      }
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

  const hasActiveFilters = !!(categoryId || keyword || minPrice || maxPrice);
  const activeFilterCount = [categoryId, keyword, minPrice, maxPrice].filter(Boolean).length;
  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  return (
    <Container className="page-padding">
      <PageHeader
        title="Cửa hàng"
        subtitle={`${totalElements} sản phẩm`}
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Cửa hàng' }]}
        actions={
          <>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 hover:bg-surface-alt lg:hidden relative"
            >
              <SlidersHorizontal size={16} /> Lọc
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </>
        }
      />

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Bộ lọc:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
              {selectedCategory.name}
              <button onClick={() => updateParams({ categoryId: '' })} className="hover:text-accent-dark"><X size={12} /></button>
            </span>
          )}
          {keyword && (
            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
              "{keyword}"
              <button onClick={() => updateParams({ keyword: '' })} className="hover:text-accent-dark"><X size={12} /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
              {minPrice ? formatCurrency(parseInt(minPrice)) : '0'} - {maxPrice ? formatCurrency(parseInt(maxPrice)) : '∞'}
              <button onClick={() => updateParams({ minPrice: '', maxPrice: '' })} className="hover:text-accent-dark"><X size={12} /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline ml-1">
            Xóa tất cả
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar - Desktop always visible, mobile as overlay */}
        <aside className={`${filterOpen ? 'fixed inset-0 z-50 bg-black/50 lg:bg-transparent lg:static lg:z-auto' : 'hidden lg:block'} lg:w-[15%] lg:min-w-[14rem] lg:max-w-[16rem] flex-shrink-0`}>
          <div className={`${filterOpen ? 'absolute right-0 top-0 h-full w-[85vw] max-w-[20rem] bg-white p-4 overflow-y-auto lg:static lg:w-auto lg:max-w-none lg:p-0' : 'bg-white border border-gray-200 rounded-xl p-4'}`}>
            {filterOpen && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold">Bộ lọc</h3>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
            )}

            {/* Category filter - collapsible */}
            <div className="mb-4">
              <button
                onClick={() => setCategoryExpanded(!categoryExpanded)}
                className="flex items-center justify-between w-full font-semibold text-sm mb-2 hover:text-accent transition-colors"
              >
                Danh mục
                <ChevronDown size={16} className={`transition-transform duration-200 ${categoryExpanded ? 'rotate-180' : ''}`} />
              </button>
              {categoryExpanded && (
                <div className="space-y-1">
                  <button
                    onClick={() => updateParams({ categoryId: '' })}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!categoryId ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-gray-50'}`}
                  >
                    Tất cả
                  </button>
                  {Array.isArray(categories) && categories.map((cat, index) => (
                    <button
                      key={`category-${cat.id ?? cat.slug ?? index}`}
                      onClick={() => { updateParams({ categoryId: String(cat.id) }); setFilterOpen(false); }}
                      className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${categoryId === String(cat.id) ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price filter - collapsible */}
            <div className="mb-4">
              <button
                onClick={() => setPriceExpanded(!priceExpanded)}
                className="flex items-center justify-between w-full font-semibold text-sm mb-2 hover:text-accent transition-colors"
              >
                Khoảng giá
                <ChevronDown size={16} className={`transition-transform duration-200 ${priceExpanded ? 'rotate-180' : ''}`} />
              </button>
              {priceExpanded && (
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
              )}
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors">
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
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
                {products.map((p, index) => (
                  <ProductCard key={`shop-${p.id ?? p.slug ?? index}`} product={p} onAddToCart={isAuthenticated ? addToCart : undefined} />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateParams({ page: String(p) })} />
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
