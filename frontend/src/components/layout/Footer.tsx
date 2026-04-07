import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">Fashion</span>
              <span className="text-2xl font-light text-accent">Shop</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Thời trang cao cấp, phong cách hiện đại. Mang đến cho bạn những sản phẩm chất lượng nhất.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-400 text-sm hover:text-accent transition-colors">Cửa hàng</Link></li>
              <li><Link to="/vouchers" className="text-gray-400 text-sm hover:text-accent transition-colors">Khuyến mãi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400 text-sm">Chính sách đổi trả</span></li>
              <li><span className="text-gray-400 text-sm">Hướng dẫn mua hàng</span></li>
              <li><span className="text-gray-400 text-sm">Câu hỏi thường gặp</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Email: contact@fashionshop.vn</li>
              <li className="text-gray-400 text-sm">Hotline: 1900 xxxx</li>
              <li className="text-gray-400 text-sm">Địa chỉ: TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Fashion Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
