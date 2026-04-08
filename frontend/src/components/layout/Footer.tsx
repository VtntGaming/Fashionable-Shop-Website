import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary to-[#111128] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">Fashion</span>
              <span className="text-2xl font-light text-accent">Shop</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Thời trang cao cấp, phong cách hiện đại. Mang đến cho bạn những sản phẩm chất lượng nhất.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors text-sm font-bold">f</a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors text-sm font-bold">ig</a>
              <a href="#" aria-label="Youtube" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors text-sm font-bold">yt</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-accent">Liên kết</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">Trang chủ</Link></li>
              <li><Link to="/shop" className="text-gray-400 text-sm hover:text-white transition-colors">Cửa hàng</Link></li>
              <li><Link to="/vouchers" className="text-gray-400 text-sm hover:text-white transition-colors">Khuyến mãi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-accent">Hỗ trợ</h4>
            <ul className="space-y-2.5">
              <li><span className="text-gray-400 text-sm hover:text-white cursor-pointer transition-colors">Chính sách đổi trả</span></li>
              <li><span className="text-gray-400 text-sm hover:text-white cursor-pointer transition-colors">Hướng dẫn mua hàng</span></li>
              <li><span className="text-gray-400 text-sm hover:text-white cursor-pointer transition-colors">Câu hỏi thường gặp</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-accent">Liên hệ</h4>
            <ul className="space-y-2.5">
              <li className="text-gray-400 text-sm flex items-center gap-2"><Mail size={14} className="text-accent flex-shrink-0" /> contact@fashionshop.vn</li>
              <li className="text-gray-400 text-sm flex items-center gap-2"><Phone size={14} className="text-accent flex-shrink-0" /> 1900 xxxx</li>
              <li className="text-gray-400 text-sm flex items-center gap-2"><MapPin size={14} className="text-accent flex-shrink-0" /> TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Fashion Shop. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            <span className="hover:text-white cursor-pointer transition-colors">Điều khoản</span>
            <span className="hover:text-white cursor-pointer transition-colors">Bảo mật</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookie</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
