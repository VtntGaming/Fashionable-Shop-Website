// ===== Admin Orders =====

const AdminOrdersPage = {
  _page: 0,
  _status: '',

  async render(container) {
    container.innerHTML = renderLoading();
    await this._load(container);
  },

  async _load(container) {
    try {
      const data = await Api.adminGetOrders({ page: this._page, size: Config.ADMIN_ITEMS_PER_PAGE || 10 });
      const allOrders = data.content || data || [];
      const orders = this._status ? allOrders.filter(o => o.status === this._status) : allOrders;
      const totalPages = data.totalPages || 1;
      const statusFilters = ['', 'PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

      container.innerHTML = `
        <h1 style="margin-bottom:24px">Quản lý đơn hàng</h1>
        <div class="admin-toolbar">
          <div class="flex gap-2 flex-wrap">
            ${statusFilters.map(s => `
              <button class="btn btn-sm ${this._status === s ? 'btn-primary' : 'btn-secondary'}" onclick="AdminOrdersPage.filterStatus('${s}')">
                ${s ? (ORDER_STATUS[s]?.label || s) : 'Tất cả'}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Ngày đặt</th><th>Thao tác</th></tr></thead>
            <tbody>
              ${orders.length === 0 ? '<tr><td colspan="7" class="text-center text-muted">Không có đơn hàng</td></tr>' :
                orders.map(o => `
                  <tr>
                    <td><strong>${sanitizeHTML(o.orderCode)}</strong></td>
                    <td>${sanitizeHTML(o.userEmail || '')}</td>
                    <td>${formatCurrency(o.totalAmount)}</td>
                    <td>${PAYMENT_METHOD[o.paymentMethod]?.label || o.paymentMethod}</td>
                    <td><span class="status-badge ${ORDER_STATUS[o.status]?.class || ''}">${ORDER_STATUS[o.status]?.label || o.status}</span></td>
                    <td>${formatDate(o.createdAt)}</td>
                    <td class="admin-actions">
                      <button class="btn-action btn-edit" onclick="AdminOrdersPage.updateStatus(${o.id}, '${o.status}')" title="Cập nhật"><i class="fas fa-edit"></i></button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
        <div id="admin-orders-pagination"></div>
      `;
      if (totalPages > 1) {
        document.getElementById('admin-orders-pagination').innerHTML = renderPagination(this._page + 1, totalPages, (pg) => {
          this._page = pg - 1;
          this._load(container);
        });
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  filterStatus(s) {
    this._status = s;
    this._page = 0;
    this._load(document.querySelector('.admin-content') || document.getElementById('main-content'));
  },

  updateStatus(id, currentStatus) {
    const statuses = ['PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    Modal.show(
      'Cập nhật trạng thái',
      `<form id="status-form">
        <div class="form-group"><label>Trạng thái mới</label>
          <select name="status" class="form-control">
            ${statuses.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${ORDER_STATUS[s]?.label || s}</option>`).join('')}
          </select>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Modal.hide()">Hủy</button>
       <button class="btn btn-primary" onclick="AdminOrdersPage.saveStatus(${id})">Cập nhật</button>`
    );
  },

  async saveStatus(id) {
    const form = document.getElementById('status-form');
    try {
      await Api.adminUpdateOrderStatus(id, form.status.value);
      Modal.hide();
      Toast.success('Đã cập nhật trạng thái');
      this._load(document.querySelector('.admin-content') || document.getElementById('main-content'));
    } catch (err) {
      Toast.error(err.message);
    }
  }
};
