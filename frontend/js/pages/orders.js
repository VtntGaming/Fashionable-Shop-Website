// ===== Orders Page =====

const OrdersPage = {
  page: 0,
  statusFilter: '',

  async render(container) {
    this.page = 0;
    this.statusFilter = '';
    container.innerHTML = `<div class="container"><div class="page-header"><div class="breadcrumbs"><a href="#/" data-link>Trang chủ</a><i class="fas fa-chevron-right text-xs"></i><span>Đơn hàng</span></div><h1>Đơn Hàng Của Tôi</h1></div><div id="orders-content">${renderLoading()}</div></div>`;
    await this._loadOrders();
  },

  async _loadOrders() {
    const el = document.getElementById('orders-content');
    try {
      const params = { page: this.page, size: 10 };
      if (this.statusFilter) params.status = this.statusFilter;
      const result = await Api.getMyOrders(params);
      const orders = result?.content || (Array.isArray(result) ? result : []);
      const totalPages = result?.totalPages || 1;

      el.innerHTML = `
        <div class="flex gap-1 mb-2" style="flex-wrap:wrap">
          ${['', 'PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map(s => `
            <button class="btn btn-sm ${this.statusFilter === s ? 'btn-primary' : 'btn-secondary'}"
              onclick="OrdersPage.filterStatus('${s}')">
              ${s ? ORDER_STATUS[s].label : 'Tất cả'}
            </button>
          `).join('')}
        </div>
        ${orders.length ? orders.map(order => `
          <div class="order-card" onclick="Router.navigate('/orders/${order.id}')">
            <div class="order-card-header">
              <div>
                <strong>${sanitizeHTML(order.orderCode)}</strong>
                <span class="text-sm text-muted ml-1">${formatDateTime(order.createdAt)}</span>
              </div>
              <span class="status-badge ${ORDER_STATUS[order.status]?.class || ''}">
                ${ORDER_STATUS[order.status]?.label || order.status}
              </span>
            </div>
            <div class="order-card-items">
              ${(order.items || []).slice(0, 4).map(item => `
                <img src="${getImageUrl(item.productImage)}" alt="" onerror="this.style.display='none'" />
              `).join('')}
              ${(order.items || []).length > 4 ? `<span class="text-sm text-muted" style="display:flex;align-items:center">+${order.items.length - 4}</span>` : ''}
            </div>
            <div class="order-card-footer">
              <span class="text-muted">${order.itemCount || (order.items || []).length} sản phẩm</span>
              <span class="font-semibold" style="color:var(--primary)">${formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        `).join('') : `
          <div class="empty-state">
            <i class="fas fa-box"></i>
            <h3>Chưa có đơn hàng</h3>
            <p>Bạn chưa đặt đơn hàng nào</p>
            <a href="#/shop" data-link class="btn btn-primary">Mua sắm ngay</a>
          </div>
        `}
        ${renderPagination(this.page, totalPages, (page) => {
          this.page = page;
          this._loadOrders();
          scrollToTop();
        })}
      `;
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  filterStatus(status) {
    this.statusFilter = status;
    this.page = 0;
    this._loadOrders();
  }
};
