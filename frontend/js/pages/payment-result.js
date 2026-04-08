// ===== Payment Result Page =====

const PaymentResultPage = {
  async render(container) {
    const qs = parseQueryString(window.location.hash.split('?')[1] || '');
    const success = qs.vnp_ResponseCode === '00' || qs.status === 'success';
    const orderId = qs.vnp_TxnRef || qs.orderId || '';

    if (orderId && qs.vnp_ResponseCode) {
      try {
        await Api.vnpayReturn(qs);
      } catch (_) { /* ignore */ }
    }

    container.innerHTML = `
      <div class="container">
        <div class="payment-result ${success ? 'payment-success' : 'payment-fail'}">
          <div class="payment-result-icon">
            <i class="fas ${success ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          </div>
          <h1>${success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}</h1>
          <p class="text-muted">${success
            ? 'Đơn hàng của bạn đã được thanh toán thành công. Cảm ơn bạn đã mua sắm!'
            : 'Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'
          }</p>
          ${orderId ? `<p class="text-sm text-muted">Mã giao dịch: <strong>${sanitizeHTML(orderId)}</strong></p>` : ''}
          <div class="flex gap-3 justify-center" style="margin-top:24px">
            ${success && orderId ? `<a href="#/orders/${orderId}" data-link class="btn btn-primary"><i class="fas fa-eye"></i> Xem đơn hàng</a>` : ''}
            <a href="#/shop" data-link class="btn btn-secondary"><i class="fas fa-shopping-bag"></i> Tiếp tục mua sắm</a>
            ${!success ? `<a href="#/orders" data-link class="btn btn-primary"><i class="fas fa-list"></i> Đơn hàng</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }
};
