import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi ngoài ý muốn</h2>
            <p className="text-sm text-gray-500 mb-6">
              Vui lòng tải lại trang. Nếu lỗi vẫn còn, hãy thử lại sau.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-light transition-colors"
            >
              <RefreshCw size={16} /> Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
