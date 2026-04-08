// ===== Utility Functions =====

function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
  if (diff < 2592000) return Math.floor(diff / 86400) + ' ngày trước';
  return formatDate(dateStr);
}

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) {
    const baseOrigin = (Config.API_ORIGIN || '').replace(/\/$/, '');
    return baseOrigin ? baseOrigin + url : url;
  }
  return (Config.UPLOADS_BASE_URL || '').replace(/\/$/, '') + '/' + String(url).replace(/^\//, '');
}

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function slugify(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function truncate(str, len = 100) {
  if (!str || str.length <= len) return str || '';
  return str.slice(0, len) + '...';
}

function generateStars(rating, max = 5) {
  let html = '';
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
  if (half) html += '<i class="fas fa-star-half-alt"></i>';
  const empty = max - full - (half ? 1 : 0);
  for (let i = 0; i < empty; i++) html += '<i class="far fa-star empty"></i>';
  return html;
}

function buildQueryString(params) {
  const filtered = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (!filtered.length) return '';
  return '?' + filtered.map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
}

function parseQueryString(qs) {
  const params = {};
  const search = qs || window.location.search;
  new URLSearchParams(search).forEach((v, k) => { params[k] = v; });
  return params;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
