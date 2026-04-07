import { useEffect, useState } from 'react';
import { Eye, EyeOff, Trash2, MessageSquare } from 'lucide-react';
import { reviewApi } from '@/api/reviewApi';
import type { Review } from '@/types/review';
import StarRating from '@/components/common/StarRating';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchReviews = () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, size: 10 };
    if (filterStatus) params.status = filterStatus;
    reviewApi.getAllReviews(params as never)
      .then((res) => { setReviews(res.content); setTotalPages(res.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [page, filterStatus]);

  const handleToggleVisibility = async (review: Review) => {
    const newStatus = review.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    try {
      await reviewApi.updateReviewStatus(review.id, newStatus);
      toast.success(newStatus === 'VISIBLE' ? 'Đã hiện đánh giá' : 'Đã ẩn đánh giá');
      fetchReviews();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await reviewApi.deleteReview(id);
      toast.success('Đã xóa đánh giá');
      fetchReviews();
    } catch { toast.error('Không thể xóa'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Tất cả</option>
          <option value="VISIBLE">Hiển thị</option>
          <option value="HIDDEN">Đã ẩn</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có đánh giá nào</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className={`bg-white border rounded-xl p-4 ${r.status === 'HIDDEN' ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium">{r.userName || 'Ẩn danh'}</span>
                      <StarRating rating={r.rating} size={14} />
                      <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                      {r.status === 'HIDDEN' && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Đã ẩn</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Sản phẩm: <strong>{r.productName}</strong></p>
                    <p className="text-sm text-gray-700">{r.comment}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleVisibility(r)}
                      className={`p-1.5 rounded-lg transition-colors ${r.status === 'VISIBLE' ? 'hover:bg-yellow-50 text-yellow-500' : 'hover:bg-green-50 text-green-500'}`}
                      title={r.status === 'VISIBLE' ? 'Ẩn' : 'Hiện'}
                    >
                      {r.status === 'VISIBLE' ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>
      )}
    </div>
  );
}
