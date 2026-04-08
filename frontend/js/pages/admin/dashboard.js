// ===== Admin Dashboard =====

const AdminDashboardPage = {
  async render(container) {
    container.innerHTML = renderLoading();
    try {
      const [products, categories, orders, users] = await Promise.all([
        Api.adminGetProducts({ page: 0, size: 1 }).catch(() => ({ totalElements: 0 })),
        Api.getCategories().catch(() => []),
        Api.adminGetOrders({ page: 0, size: 1 }).catch(() => ({ totalElements: 0 })),
        Api.adminGetUsers({ page: 0, size: 1 }).catch(() => ({ totalElements: 0 }))
      ]);

      const stats = [
        { icon: 'fa-box', label: 'Sản phẩm', value: products.totalElements || 0, color: 'var(--primary)', link: '#/admin/products' },
        { icon: 'fa-th-large', label: 'Danh mục', value: categories.length || 0, color: 'var(--accent)', link: '#/admin/categories' },
        { icon: 'fa-shopping-cart', label: 'Đơn hàng', value: orders.totalElements || 0, color: 'var(--secondary)', link: '#/admin/orders' },
        { icon: 'fa-users', label: 'Khách hàng', value: users.totalElements || 0, color: '#00b894', link: '#/admin/customers' }
      ];

      container.innerHTML = `
        <h1 style="margin-bottom:24px">Dashboard</h1>
        <div class="admin-stats-grid">
          ${stats.map(s => `
            <a href="${s.link}" data-link class="admin-stat-card" style="--stat-color:${s.color}">
              <div class="stat-icon"><i class="fas ${s.icon}"></i></div>
              <div class="stat-info">
                <span class="stat-value">${s.value.toLocaleString()}</span>
                <span class="stat-label">${s.label}</span>
              </div>
            </a>
          `).join('')}
        </div>

        <div style="margin-top:32px">
          <h2 style="margin-bottom:16px">Truy cập nhanh</h2>
          <div class="flex gap-3 flex-wrap">
            <a href="#/admin/products" data-link class="btn btn-primary"><i class="fas fa-plus"></i> Thêm sản phẩm</a>
            <a href="#/admin/orders" data-link class="btn btn-secondary"><i class="fas fa-list"></i> Đơn hàng mới</a>
            <a href="#/admin/vouchers" data-link class="btn btn-accent"><i class="fas fa-ticket-alt"></i> Mã giảm giá</a>
            <a href="#/admin/reviews" data-link class="btn btn-secondary"><i class="fas fa-star"></i> Đánh giá</a>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  }
};
