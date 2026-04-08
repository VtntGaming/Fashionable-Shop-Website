// ===== Shop Page =====

const ShopPage = {
  filters: { page: 0, size: 12, categoryId: '', keyword: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', sortDir: 'desc' },
  categories: [],

  async render(container, params = {}) {
    // Merge URL params into filters
    if (params.categoryId) this.filters.categoryId = params.categoryId;
    if (params.keyword) this.filters.keyword = params.keyword;
    if (params.sortBy) this.filters.sortBy = params.sortBy;
    if (params.sortDir) this.filters.sortDir = params.sortDir;
    if (params.page) this.filters.page = parseInt(params.page) || 0;

    container.innerHTML = `
      <div class="container">
        <div class="page-header">
          <div class="breadcrumbs">
            <a href="#/" data-link>Trang chủ</a>
            <i class="fas fa-chevron-right text-xs"></i>
            <span>Cửa hàng</span>
          </div>
          <h1>Cửa Hàng</h1>
        </div>
        <div class="shop-layout">
          <aside class="shop-sidebar" id="shop-sidebar">${renderLoading()}</aside>
          <div id="shop-products">${renderSkeletonGrid()}</div>
        </div>
      </div>
    `;

    // Load categories
    try {
      const cats = await Api.getCategories();
      this.categories = Array.isArray(cats) ? cats : (cats?.content || []);
    } catch { this.categories = []; }

    this._renderSidebar();
    await this._loadProducts();
  },

  _renderSidebar() {
    const sidebar = document.getElementById('shop-sidebar');
    sidebar.innerHTML = `
      <div class="sidebar-card">
        <h3><i class="fas fa-search"></i> Tìm kiếm</h3>
        <input type="text" id="shop-search" placeholder="Tìm sản phẩm..." value="${sanitizeHTML(this.filters.keyword)}" />
      </div>
      <div class="sidebar-card">
        <h3><i class="fas fa-list"></i> Danh mục</h3>
        <ul>
          <li><button class="sidebar-cat-btn ${!this.filters.categoryId ? 'active' : ''}" data-cat="">Tất cả</button></li>
          ${this.categories.map(c => `
            <li><button class="sidebar-cat-btn ${this.filters.categoryId == c.id ? 'active' : ''}" data-cat="${c.id}">${sanitizeHTML(c.name)}</button></li>
          `).join('')}
        </ul>
      </div>
      <div class="sidebar-card">
        <h3><i class="fas fa-dollar-sign"></i> Khoảng giá</h3>
        <div class="price-range-inputs">
          <input type="number" id="price-min" placeholder="Từ" value="${this.filters.minPrice}" />
          <span>-</span>
          <input type="number" id="price-max" placeholder="Đến" value="${this.filters.maxPrice}" />
        </div>
        <button class="btn btn-primary btn-sm w-full mt-1" id="apply-price-btn">Áp dụng</button>
      </div>
    `;

    // Events
    document.getElementById('shop-search').addEventListener('input', debounce((e) => {
      this.filters.keyword = e.target.value;
      this.filters.page = 0;
      this._loadProducts();
    }, 500));

    sidebar.querySelectorAll('.sidebar-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filters.categoryId = btn.dataset.cat;
        this.filters.page = 0;
        this._renderSidebar();
        this._loadProducts();
      });
    });

    document.getElementById('apply-price-btn').addEventListener('click', () => {
      this.filters.minPrice = document.getElementById('price-min').value;
      this.filters.maxPrice = document.getElementById('price-max').value;
      this.filters.page = 0;
      this._loadProducts();
    });
  },

  async _loadProducts() {
    const productsEl = document.getElementById('shop-products');
    productsEl.innerHTML = renderSkeletonGrid();

    try {
      const result = await Api.getProducts(this.filters);
      const products = result?.content || (Array.isArray(result) ? result : []);
      const totalPages = result?.totalPages || 1;
      const totalElements = result?.totalElements || products.length;

      let activeFilters = '';
      if (this.filters.keyword || this.filters.categoryId || this.filters.minPrice || this.filters.maxPrice) {
        activeFilters = '<div class="active-filters">';
        if (this.filters.keyword) activeFilters += `<span class="filter-tag">Từ khóa: ${sanitizeHTML(this.filters.keyword)} <button onclick="ShopPage.clearFilter('keyword')"><i class="fas fa-times"></i></button></span>`;
        if (this.filters.categoryId) {
          const cat = this.categories.find(c => c.id == this.filters.categoryId);
          activeFilters += `<span class="filter-tag">${sanitizeHTML(cat?.name || 'Danh mục')} <button onclick="ShopPage.clearFilter('categoryId')"><i class="fas fa-times"></i></button></span>`;
        }
        if (this.filters.minPrice || this.filters.maxPrice) activeFilters += `<span class="filter-tag">Giá: ${this.filters.minPrice || '0'} - ${this.filters.maxPrice || '∞'} <button onclick="ShopPage.clearFilter('price')"><i class="fas fa-times"></i></button></span>`;
        activeFilters += '</div>';
      }

      productsEl.innerHTML = `
        <div class="shop-toolbar">
          <span>Hiển thị ${products.length} / ${totalElements} sản phẩm</span>
          <select id="shop-sort">
            <option value="createdAt-desc" ${this.filters.sortBy === 'createdAt' && this.filters.sortDir === 'desc' ? 'selected' : ''}>Mới nhất</option>
            <option value="price-asc" ${this.filters.sortBy === 'price' && this.filters.sortDir === 'asc' ? 'selected' : ''}>Giá thấp → cao</option>
            <option value="price-desc" ${this.filters.sortBy === 'price' && this.filters.sortDir === 'desc' ? 'selected' : ''}>Giá cao → thấp</option>
            <option value="averageRating-desc" ${this.filters.sortBy === 'averageRating' ? 'selected' : ''}>Đánh giá cao</option>
            <option value="views-desc" ${this.filters.sortBy === 'views' ? 'selected' : ''}>Xem nhiều</option>
          </select>
        </div>
        ${activeFilters}
        ${products.length ? `
          <div class="grid grid-4 gap-2">
            ${products.map(p => renderProductCard(p)).join('')}
          </div>
          ${renderPagination(this.filters.page, totalPages, (page) => {
            this.filters.page = page;
            this._loadProducts();
            scrollToTop();
          })}
        ` : `
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        `}
      `;

      document.getElementById('shop-sort').addEventListener('change', (e) => {
        const [sortBy, sortDir] = e.target.value.split('-');
        this.filters.sortBy = sortBy;
        this.filters.sortDir = sortDir;
        this.filters.page = 0;
        this._loadProducts();
      });

    } catch (err) {
      productsEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải sản phẩm</h3>
          <p>${sanitizeHTML(err.message)}</p>
        </div>
      `;
    }
  },

  clearFilter(key) {
    if (key === 'price') {
      this.filters.minPrice = '';
      this.filters.maxPrice = '';
    } else {
      this.filters[key] = '';
    }
    this.filters.page = 0;
    this._renderSidebar();
    this._loadProducts();
  }
};
