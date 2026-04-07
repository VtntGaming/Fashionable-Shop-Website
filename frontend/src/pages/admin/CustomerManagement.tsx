import { useEffect, useState } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { userApi } from '@/api/userApi';
import type { User } from '@/types/user';
import { formatDate } from '@/utils/formatDate';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CustomerManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    userApi.getUsers({ page, size: 10 })
      .then((res) => { setUsers(res.content); setTotalPages(res.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userApi.updateUserStatus(user.id, newStatus as 'ACTIVE' | 'INACTIVE');
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
      fetchUsers();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý khách hàng</h1>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Khách hàng</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Vai trò</th>
                  <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Trạng thái</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Ngày tạo</th>
                  <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <ImageWithFallback src={u.avatarUrl || undefined} alt={u.fullName} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${u.status === 'ACTIVE' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}
                          title={u.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {u.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="border-t border-gray-100 p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </div>
      )}
    </div>
  );
}
