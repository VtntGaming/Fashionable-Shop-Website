// ===== Order Detail Page =====

const OrderDetailPage = {
  async render(container, params) {
    container.innerHTML = `<div class="container">${renderLoading()}</div>`;
    try {
      const order = await Api.getOrder(params.id);
      const statuses = ['PENDING', 'PAID', 'SHIPPING', 'DELIVERED'];
      const currentIdx = statuses.indexOf(order.status);

      container.innerHTML = `
        <div class="container">
          <div class="page-header">
            <div class="breadcrumbs">
              <a href="#/" data-link>Trang chủ</a>
              <i class="fas fa-chevron-right text-xs"></i>
              <a href="#/orders" data-link>Đơn hàng</a>
              <i class="fas fa-chevron-right text-xs"></i>
              <span>${sanitizeHTML(order.orderCode)}</span>
            </div>
            <div class="flex items-center justify-between">
              <h1>Chi tiết đơn hàng</h1>
              ${order.status === 'PENDING' ? `
                <button class="btn btn-danger btn-sm" onclick="OrderDetailPage.cancelOrder(${order.id})">
                  <i class="fas fa-times"></i> Hủy đơn
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Timeline -->
          ${order.status !== 'CANCELLED' ? `
          <div class="order-timeline" style="flex-direction:row;justify-content:space-between;padding:24px;background:var(--white);border-radius:var(--radius);border:1px solid var(--border);margin-bottom:24px">
            ${statuses.map((s, i) => `
              <div class="flex flex-col items-center gap-1" style="flex:1;position:relative">
                <div class="timeline-dot ${i <= currentIdx ? (i < currentIdx ? 'completed' : 'active') : ''}" style="width:36px;height:36px">
                  <i class="fas ${ORDER_STATUS[s].icon}"></i>
                </div>
                <span class="text-xs ${i <= currentIdx ? 'font-semibold' : 'text-muted'}">${ORDER_STATUS[s].label}</span>
              </div>
            `).join('')}
          </div>
          ` : `
          <div style="padding:16px;background:rgba(225,112,85,0.08);border-radius:var(--radius);margin-bottom:24px;text-align:center;color:var(--danger)">
            <i class="fas fa-times-circle"></i> Đơn hàng đã bị hủy
          </div>
          `}

          <div class="order-detail-grid">
            <div class="order-info-card">
              <h3><i class="fas fa-box"></i> Thông tin đơn hàng</h3>
              <div class="order-info-row"><span class="label">Mã đơn</span><span class="font-semibold">${sanitizeHTML(order.orderCode)}</span></div>
              <div class="order-info-row"><span class="label">Ngày đặt</span><span>${formatDateTime(order.createdAt)}</span></div>
              <div class="order-info-row"><span class="label">Trạng thái</span><span class="status-badge ${ORDER_STATUS[order.status]?.class || ''}">${ORDER_STATUS[order.status]?.label || order.status}</span></div>
              <div class="order-info-row"><span class="label">Thanh toán</span><span>${PAYMENT_METHOD[order.paymentMethod]?.label || order.paymentMethod}</span></div>
            </div>
            <div class="order-info-card">
              <h3><i class="fas fa-truck"></i> Giao hàng</h3>
              <div class="order-info-row"><span class="label">Người nhận</span><span>${sanitizeHTML(order.userEmail || '')}</span></div>
              <div class="order-info-row"><span class="label">Điện thoại</span><span>${sanitizeHTML(order.phone || '')}</span></div>
              <div class="order-info-row"><span class="label">Địa chỉ</span><span>${sanitizeHTML(order.shippingAddress || '')}</span></div>
            </div>
          </div>

          <!-- Order items -->
          <div style="margin-top:24px">
            <h3 style="margin-bottom:16px">Sản phẩm (${(order.items || []).length})</h3>
            ${(order.items || []).map(item => `
              <div class="cart-item">
                <div class="cart-item-image">
                  ${item.productImage ? `<img src="${getImageUrl(item.productImage)}" alt="" />` : ''}
                </div>
                <div class="cart-item-info" style="display:flex;justify-content:space-between;align-items:center">
                  <div>
                    <h3>${sanitizeHTML(item.productName)}</h3>
                    <p class="text-muted">x${item.quantity} · ${formatCurrency(item.priceAtPurchase)}</p>
                  </div>
                  <span class="font-semibold" style="color:var(--primary)">${formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:24px;text-align:right;padding:20px;background:var(--white);border-radius:var(--radius);border:1px solid var(--border)">
            <div class="cart-summary-total" style="border:none;padding:0;margin:0">
              <span>Tổng cộng</span>
              <span class="amount" style="font-size:1.5rem">${formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p><a href="#/orders" data-link class="btn btn-primary">Quay lại</a></div></div>`;
    }
  },

  async cancelOrder(id) {
    Modal.confirm('Hủy đơn hàng', 'Bạn có chắc muốn hủy đơn hàng này?', async () => {
      try {
        await Api.cancelOrder(id);
        Toast.success('Đã hủy đơn hàng');
        Router.navigate('/orders/' + id);
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
