import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryApi } from '@/api/categoryApi';
import type { Category } from '@/types/category';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Tên danh mục tối thiểu 2 ký tự'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.coerce.number().nullable().optional(),
});
type CategoryForm = z.infer<typeof schema>;

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const fetchCategories = () => {
    setLoading(true);
    categoryApi.getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', imageUrl: '', parentId: null });
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    reset({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', parentId: c.parentId });
    setShowModal(true);
  };

  const onSubmit = async (data: CategoryForm) => {
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.updateCategory(editing.id, data as never);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await categoryApi.createCategory(data as never);
        toast.success('Thêm danh mục thành công!');
      }
      setShowModal(false);
      fetchCategories();
    } catch { toast.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await categoryApi.deleteCategory(id);
      toast.success('Đã xóa danh mục');
      fetchCategories();
    } catch { toast.error('Không thể xóa danh mục'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-light transition-colors">
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Danh mục</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Slug</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Danh mục cha</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Sản phẩm</th>
                <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {c.parentId ? categories.find(p => p.id === c.parentId)?.name || '-' : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{c.productCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên danh mục</label>
                <input {...register('name')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea {...register('description')} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL ảnh</label>
                <input {...register('imageUrl')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Danh mục cha</label>
                <select {...register('parentId')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent">
                  <option value="">Không có</option>
                  {categories.filter(c => !editing || c.id !== editing.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
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
