import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Users, Ticket, Star, BarChart3, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/authSlice';
import toast from 'react-hot-toast';

const menuItems = [
  { path: '/admin/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Sản phẩm', icon: Package },
  { path: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { path: '/admin/customers', label: 'Khách hàng', icon: Users },
  { path: '/admin/vouchers', label: 'Voucher', icon: Ticket },
  { path: '/admin/reviews', label: 'Đánh giá', icon: Star },
  { path: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">Fashion</span>
            <span className="text-xl font-light text-accent">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg text-sm">
            <ChevronLeft size={18} /> Về trang chủ
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg text-sm w-full">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-600">Xin chào, <strong>{user?.fullName}</strong></span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
