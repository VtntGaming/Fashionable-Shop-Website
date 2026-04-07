import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Heart, User, Menu, X, Search, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/authSlice';
import { clearCartState } from '@/store/cartSlice';
import toast from 'react-hot-toast';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const { itemCount } = useSelector((s: RootState) => s.cart);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    toast.success('Đã đăng xuất');
    setUserMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Fashion</span>
            <span className="text-2xl font-light text-accent">Shop</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">Trang chủ</Link>
            <Link to="/shop" className="text-sm font-medium hover:text-accent transition-colors">Cửa hàng</Link>
            <Link to="/vouchers" className="text-sm font-medium hover:text-accent transition-colors">Khuyến mãi</Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 lg:w-80">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none ml-2 w-full text-sm"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Heart size={20} />
                </Link>
                <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <User size={20} />
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                        <Settings size={16} /> Tài khoản
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                        <Package size={16} /> Đơn hàng
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-accent font-medium">
                          <Settings size={16} /> Quản trị
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-red-600 w-full">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">Đăng nhập</Link>
                <Link to="/register" className="text-sm font-medium px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">Đăng ký</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none ml-2 w-full text-sm"
              />
            </form>
            <nav className="flex flex-col gap-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg">Trang chủ</Link>
              <Link to="/shop" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg">Cửa hàng</Link>
              <Link to="/vouchers" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg">Khuyến mãi</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
