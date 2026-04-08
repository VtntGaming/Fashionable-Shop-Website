// ===== Configuration =====
const DEPLOY_API_BASE_URL = '__API_BASE_URL__';
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://fashionwebj2ee-production.up.railway.app/api';
const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const isInjectedApiBaseUrl = /^(https?:)?\/\//i.test(DEPLOY_API_BASE_URL) || DEPLOY_API_BASE_URL.startsWith('/api');
const runtimeApiBaseUrl = isLocalDev
  ? (window.location.port === '8080' ? '/api' : 'http://localhost:8080/api')
  : (isInjectedApiBaseUrl ? DEPLOY_API_BASE_URL : DEFAULT_PRODUCTION_API_BASE_URL);
const runtimeOrigin = runtimeApiBaseUrl.replace(/\/api\/?$/, '') || (isLocalDev ? 'http://localhost:8080' : window.location.origin);

const Config = {
  // Local dev uses localhost:8080, non-local uses Railway by default unless Pages injects another API URL.
  API_BASE_URL: runtimeApiBaseUrl,
  API_ORIGIN: runtimeOrigin,
  UPLOADS_BASE_URL: runtimeOrigin + '/uploads',
  GOOGLE_OAUTH_URL: runtimeOrigin + '/oauth2/authorization/google',
  ITEMS_PER_PAGE: 12,
  ADMIN_ITEMS_PER_PAGE: 10,
};

// Order status mappings
const ORDER_STATUS = {
  PENDING: { label: 'Chờ xử lý', class: 'status-pending', icon: 'fa-clock' },
  PAID: { label: 'Đã thanh toán', class: 'status-paid', icon: 'fa-credit-card' },
  SHIPPING: { label: 'Đang giao', class: 'status-shipping', icon: 'fa-truck' },
  DELIVERED: { label: 'Đã giao', class: 'status-delivered', icon: 'fa-check-circle' },
  CANCELLED: { label: 'Đã hủy', class: 'status-cancelled', icon: 'fa-times-circle' },
};

const PAYMENT_METHOD = {
  COD: { label: 'Thanh toán khi nhận hàng', icon: 'fa-money-bill' },
  VNPAY: { label: 'VNPay', icon: 'fa-credit-card' },
};
