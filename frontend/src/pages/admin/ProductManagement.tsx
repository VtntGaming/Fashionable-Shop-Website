import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi } from '@/api/productApi';
import { categoryApi } from '@/api/categoryApi';
import { fileApi } from '@/api/fileApi';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { formatCurrency } from '@/utils/formatCurrency';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm tối thiểu 2 ký tự'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Giá phải lớn hơn 0'),
  salePrice: z.coerce.number().nullable().optional(),
  stock: z.coerce.number().int().min(0, 'Tồn kho không hợp lệ'),
  categoryId: z.coerce.number().positive('Vui lòng chọn danh mục'),
  brand: z.string().optional(),
  featured: z.boolean().optional(),
});
type ProductForm = z.infer<typeof productSchema>;

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  });

  const fetchProducts = () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, size: 10 };
    if (search) params.keyword = search;
    productApi.getProducts(params as never)
      .then((res) => { setProducts(res.content); setTotalPages(res.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page]);
  useEffect(() => { categoryApi.getCategories().then(setCategories).catch(() => {}); }, []);

  const handleSearch = () => { setPage(0); fetchProducts(); };

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', price: 0, salePrice: null, stock: 0, categoryId: 0, brand: '', featured: false });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    reset({ name: p.name, description: p.description, price: p.price, salePrice: p.salePrice, stock: p.stock, categoryId: p.categoryId, brand: p.brand || '', featured: p.featured || false });
    setImageFile(null);
    setShowModal(true);
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const upload = await fileApi.uploadProductImage(imageFile);
        imageUrl = upload.fileUrl;
      }
      
      const payload = { ...data, imageUrl: imageUrl || editing?.imageUrl || '' };
      
      if (editing) {
        await productApi.updateProduct(editing.id, payload as never);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await productApi.createProduct(payload as never);
        toast.success('Thêm sản phẩm thành công!');
      }
      setShowModal(false);
      fetchProducts();
    } catch { toast.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await productApi.deleteProduct(id);
      toast.success('Đã xóa sản phẩm');
      fetchProducts();
    } catch { toast.error('Không thể xóa sản phẩm'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-light transition-colors">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent"
          />
        </div>
        <button onClick={handleSearch} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Tìm</button>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Sản phẩm</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Danh mục</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Giá</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Tồn kho</th>
                  <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.categoryName}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(p.effectivePrice)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={p.stock <= 5 ? 'text-red-500 font-medium' : ''}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="border-t border-gray-100 p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                <input {...register('name')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea {...register('description')} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Giá (VND)</label>
                  <input {...register('price')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá sale</label>
                  <input {...register('salePrice')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tồn kho</label>
                  <input {...register('stock')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục</label>
                  <select {...register('categoryId')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent">
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                <input {...register('brand')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ảnh sản phẩm</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input {...register('featured')} type="checkbox" className="accent-[#c9a84c]" />
                Sản phẩm nổi bật
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent-light transition-colors disabled:opacity-50">
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
