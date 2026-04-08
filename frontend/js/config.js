// ===== Configuration =====
const DEPLOY_API_BASE_URL = '__API_BASE_URL__';
const runtimeApiBaseUrl = DEPLOY_API_BASE_URL !== '__API_BASE_URL__'
  ? DEPLOY_API_BASE_URL
  : (window.location.port === '8080' ? '/api' : 'http://localhost:8080/api');
const runtimeOrigin = runtimeApiBaseUrl.replace(/\/api\/?$/, '');

const Config = {
  // Local dev uses localhost:8080, GitHub Pages deploy injects secrets.API_BASE_URL here.
  API_BASE_URL: runtimeApiBaseUrl,
  UPLOADS_BASE_URL: runtimeOrigin ? runtimeOrigin + '/uploads' : '/uploads',
  GOOGLE_OAUTH_URL: runtimeOrigin ? runtimeOrigin + '/oauth2/authorization/google' : 'http://localhost:8080/oauth2/authorization/google',
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
