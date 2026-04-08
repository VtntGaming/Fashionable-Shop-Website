import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const { itemCount } = useSelector((s: RootState) => s.cart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <header className={`bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.06)]' : 'border-transparent'}`}>
      <div className="w-[90%] max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Fashion</span>
            <span className="text-2xl font-light text-accent">Shop</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/', label: 'Trang chủ', active: location.pathname === '/' },
              { to: '/shop', label: 'Cửa hàng', active: location.pathname.startsWith('/shop') || location.pathname.startsWith('/product') },
              { to: '/vouchers', label: 'Khuyến mãi', active: location.pathname === '/vouchers' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className={`relative text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${item.active ? 'text-accent bg-accent/8' : 'text-gray-600 hover:text-primary hover:bg-gray-100'}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex-1 max-w-xs lg:max-w-sm xl:max-w-md focus-within:border-accent/40 focus-within:bg-white transition-all duration-200">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
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
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-[fadeInUp_0.15s_ease-out]">
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
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-accent font-medium">
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
