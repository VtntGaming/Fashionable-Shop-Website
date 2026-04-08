// ===== Simple Hash Router =====

const Router = {
  routes: [],
  currentPath: '',

  register(path, handler, options = {}) {
    this.routes.push({ path, handler, ...options });
  },

  init() {
    window.addEventListener('hashchange', () => this._resolve());
    // Handle clicks on <a> tags with data-link
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href') || link.dataset.link);
      }
    });
    this._resolve();
  },

  navigate(path = '/') {
    const normalized = String(path || '/')
      .trim()
      .replace(/^#+/, '');

    window.location.hash = normalized.startsWith('/') ? normalized : '/' + normalized;
  },

  getPath() {
    const hash = (window.location.hash || '').replace(/^#+/, '');
    if (!hash) return '/';
    return hash.startsWith('/') ? hash : '/' + hash;
  },

  getParams() {
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return {};
    return parseQueryString(hash.slice(qIndex));
  },

  _resolve() {
    const fullPath = this.getPath();
    const [path, queryStr] = fullPath.split('?');
    const params = parseQueryString(queryStr ? '?' + queryStr : '');

    this.currentPath = path;

    // Find matching route
    let matched = null;
    let routeParams = {};

    for (const route of this.routes) {
      const result = this._match(route.path, path);
      if (result) {
        matched = route;
        routeParams = result;
        break;
      }
    }

    if (!matched) {
      // 404
      const main = document.getElementById('main-content');
      if (typeof NotFoundPage !== 'undefined') {
        NotFoundPage.render(main);
      } else {
        main.innerHTML = '<div class="not-found container"><h1>404</h1><p>Trang không tồn tại</p></div>';
      }
      return;
    }

    // Route guards
    if (matched.requireAuth && !Store.isAuthenticated()) {
      this.navigate('/login');
      return;
    }
    if (matched.requireAdmin && !Store.isAdmin()) {
      this.navigate('/');
      return;
    }
    if (matched.guestOnly && Store.isAuthenticated()) {
      this.navigate('/');
      return;
    }

    // Render
    scrollToTop();
    const main = document.getElementById('main-content');
    const isAdmin = path.startsWith('/admin');
    if (isAdmin) {
      // Render admin layout wrapper
      if (!main.querySelector('.admin-layout')) {
        main.innerHTML = `
          <div class="admin-layout">
            <aside class="admin-sidebar">
              <div class="admin-sidebar-header"><a href="#/admin" data-link><i class="fas fa-crown"></i> Admin</a></div>
              <nav class="admin-nav">
                <a href="#/admin/dashboard" data-link class="admin-nav-item"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                <a href="#/admin/products" data-link class="admin-nav-item"><i class="fas fa-box"></i> Sản phẩm</a>
                <a href="#/admin/categories" data-link class="admin-nav-item"><i class="fas fa-th-large"></i> Danh mục</a>
                <a href="#/admin/orders" data-link class="admin-nav-item"><i class="fas fa-shopping-cart"></i> Đơn hàng</a>
                <a href="#/admin/customers" data-link class="admin-nav-item"><i class="fas fa-users"></i> Khách hàng</a>
                <a href="#/admin/vouchers" data-link class="admin-nav-item"><i class="fas fa-ticket-alt"></i> Mã giảm giá</a>
                <a href="#/admin/reviews" data-link class="admin-nav-item"><i class="fas fa-star"></i> Đánh giá</a>
              </nav>
              <div class="admin-sidebar-footer"><a href="#/" data-link><i class="fas fa-arrow-left"></i> Về trang chủ</a></div>
            </aside>
            <div class="admin-content"></div>
          </div>`;
      }
      // Highlight active nav
      main.querySelectorAll('.admin-nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('href') === '#' + path);
      });
      matched.handler(main.querySelector('.admin-content'), { ...routeParams, ...params });
    } else {
      matched.handler(main, { ...routeParams, ...params });
    }
  },

  _match(pattern, path) {
    // Convert route pattern to regex, e.g. /product/:slug -> /product/([^/]+)
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp('^' + regexStr + '$');
    const match = path.match(regex);
    if (!match) return null;
    const params = {};
    paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
    return params;
  },

  // Check if current path matches
  isActive(path) {
    if (path === '/') return this.currentPath === '/';
    return this.currentPath.startsWith(path);
  }
};
