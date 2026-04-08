import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <h1 className="text-[10rem] font-bold text-gray-100 leading-none select-none">404</h1>
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent font-bold text-2xl whitespace-nowrap">Oops!</p>
        </div>
        <h2 className="text-2xl font-bold mb-3">Không tìm thấy trang</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-border text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-surface-alt transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-light transition-colors"
          >
            <Home size={16} /> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
