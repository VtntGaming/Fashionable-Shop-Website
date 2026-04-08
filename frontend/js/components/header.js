// ===== Header Component =====

const Header = {
  _dropdownOpen: false,
  _mobileNavOpen: false,

  render() {
    const header = document.getElementById('header');
    const user = Store.getUser();
    const isAuth = Store.isAuthenticated();
    const isAdmin = Store.isAdmin();
    const cartCount = Store.getCartCount();

    header.className = 'site-header';
    header.innerHTML = `
      <div class="container header-inner">
        <a href="#/" data-link class="header-logo">
          <i class="fas fa-tshirt"></i>
          <span>Fashionable</span>
        </a>

        <nav class="header-nav" id="header-nav">
          <a href="#/" data-link class="${Router.isActive('/') && !Router.isActive('/shop') ? 'active' : ''}">Trang chủ</a>
          <a href="#/shop" data-link class="${Router.isActive('/shop') ? 'active' : ''}">Cửa hàng</a>
          <a href="#/vouchers" data-link class="${Router.isActive('/vouchers') ? 'active' : ''}">Khuyến mãi</a>
          ${isAdmin ? `<a href="#/admin" data-link class="${Router.isActive('/admin') ? 'active' : ''}">Quản trị</a>` : ''}
        </nav>

        <div class="header-actions">
          ${isAuth ? `
            <a href="#/wishlist" data-link class="header-icon-btn" title="Yêu thích">
              <i class="far fa-heart"></i>
            </a>
            <a href="#/cart" data-link class="header-icon-btn" title="Giỏ hàng">
              <i class="fas fa-shopping-bag"></i>
              ${cartCount > 0 ? `<span class="badge-count">${cartCount > 99 ? '99+' : cartCount}</span>` : ''}
            </a>
            <div class="header-user-menu" id="user-menu">
              <button class="header-user-btn" id="user-menu-btn">
                <div class="header-user-avatar">
                  ${user?.avatarUrl
                    ? `<img src="${getImageUrl(user.avatarUrl)}" alt="" />`
                    : sanitizeHTML(getInitials(user?.fullName))}
                </div>
                <span class="text-sm font-medium">${sanitizeHTML(user?.fullName || '')}</span>
                <i class="fas fa-chevron-down text-xs"></i>
              </button>
              <div class="header-dropdown" id="user-dropdown">
                <a href="#/profile" data-link><i class="far fa-user"></i> Tài khoản</a>
                <a href="#/orders" data-link><i class="fas fa-box"></i> Đơn hàng</a>
                <a href="#/wishlist" data-link><i class="far fa-heart"></i> Yêu thích</a>
                <div class="divider"></div>
                <button id="logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
              </div>
            </div>
          ` : `
            <a href="#/login" data-link class="btn btn-primary btn-sm">Đăng nhập</a>
          `}

          <button class="mobile-menu-btn header-icon-btn" id="mobile-menu-btn">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    `;

    this._bindEvents();
  },

  _bindEvents() {
    // User menu dropdown
    const menuBtn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    if (menuBtn && dropdown) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._dropdownOpen = !this._dropdownOpen;
        dropdown.classList.toggle('show', this._dropdownOpen);
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => Auth.logout());
    }

    // Mobile menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('header-nav');
    if (mobileBtn && nav) {
      mobileBtn.addEventListener('click', () => {
        this._mobileNavOpen = !this._mobileNavOpen;
        nav.classList.toggle('show', this._mobileNavOpen);
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      if (this._dropdownOpen) {
        this._dropdownOpen = false;
        const dd = document.getElementById('user-dropdown');
        if (dd) dd.classList.remove('show');
      }
    });

    // Scroll effect
    window.addEventListener('scroll', () => {
      const h = document.getElementById('header');
      if (h) h.classList.toggle('scrolled', window.scrollY > 10);
    });
  }
};
