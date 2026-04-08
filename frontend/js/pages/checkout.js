// ===== Checkout Page =====

const CheckoutPage = {
  paymentMethod: 'COD',
  voucherCode: '',
  voucherDiscount: 0,

  async render(container) {
    container.innerHTML = `<div class="container"><div class="page-header"><div class="breadcrumbs"><a href="#/" data-link>Trang chủ</a><i class="fas fa-chevron-right text-xs"></i><a href="#/cart" data-link>Giỏ hàng</a><i class="fas fa-chevron-right text-xs"></i><span>Thanh toán</span></div><h1>Thanh Toán</h1></div><div id="checkout-content">${renderLoading()}</div></div>`;
    this.voucherCode = '';
    this.voucherDiscount = 0;
    await this._loadCheckout();
  },

  async _loadCheckout() {
    const el = document.getElementById('checkout-content');
    try {
      const cart = await Api.getCart();
      const items = cart?.items || [];
      if (!items.length) {
        el.innerHTML = `<div class="empty-state"><i class="fas fa-shopping-bag"></i><h3>Giỏ hàng trống</h3><a href="#/shop" data-link class="btn btn-primary">Mua sắm ngay</a></div>`;
        return;
      }

      const user = Store.getUser();
      const total = cart.totalAmount - this.voucherDiscount;

      el.innerHTML = `
        <div class="checkout-layout">
          <div>
            <div class="checkout-section">
              <h3><i class="fas fa-map-marker-alt"></i> Thông tin giao hàng</h3>
              <div class="form-group">
                <label>Họ tên</label>
                <input type="text" id="checkout-name" value="${sanitizeHTML(user?.fullName || '')}" />
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" id="checkout-phone" value="${sanitizeHTML(user?.phone || '')}" placeholder="0xxx xxx xxx" />
              </div>
              <div class="form-group">
                <label>Địa chỉ giao hàng</label>
                <textarea id="checkout-address" rows="3" placeholder="Nhập địa chỉ giao hàng...">${sanitizeHTML(user?.address || '')}</textarea>
              </div>
            </div>

            <div class="checkout-section">
              <h3><i class="fas fa-tags"></i> Mã giảm giá</h3>
              <div class="flex gap-1">
                <input type="text" id="voucher-input" placeholder="Nhập mã giảm giá" value="${sanitizeHTML(this.voucherCode)}" />
                <button class="btn btn-secondary btn-sm" onclick="CheckoutPage.applyVoucher()">Áp dụng</button>
              </div>
              ${this.voucherDiscount > 0 ? `<p class="mt-1" style="color:var(--success)"><i class="fas fa-check"></i> Giảm ${formatCurrency(this.voucherDiscount)}</p>` : ''}
            </div>

            <div class="checkout-section">
              <h3><i class="fas fa-credit-card"></i> Phương thức thanh toán</h3>
              <div class="payment-methods">
                <label class="payment-method ${this.paymentMethod === 'COD' ? 'selected' : ''}">
                  <input type="radio" name="payment" value="COD" ${this.paymentMethod === 'COD' ? 'checked' : ''} onchange="CheckoutPage.paymentMethod='COD'; CheckoutPage._loadCheckout();" />
                  <i class="fas fa-money-bill"></i>
                  <div><strong>Thanh toán khi nhận hàng (COD)</strong><br><small class="text-muted">Thanh toán bằng tiền mặt khi giao hàng</small></div>
                </label>
                <label class="payment-method ${this.paymentMethod === 'VNPAY' ? 'selected' : ''}">
                  <input type="radio" name="payment" value="VNPAY" ${this.paymentMethod === 'VNPAY' ? 'checked' : ''} onchange="CheckoutPage.paymentMethod='VNPAY'; CheckoutPage._loadCheckout();" />
                  <i class="fas fa-credit-card"></i>
                  <div><strong>VNPay</strong><br><small class="text-muted">Thanh toán qua cổng VNPay</small></div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div class="cart-summary">
              <h3>Đơn hàng (${items.length} sản phẩm)</h3>
              ${items.map(item => `
                <div class="flex items-center gap-1 mb-1" style="padding:8px 0;border-bottom:1px solid var(--border)">
                  <div style="width:48px;height:48px;border-radius:8px;overflow:hidden;flex-shrink:0;background:var(--bg)">
                    ${item.productImage ? `<img src="${getImageUrl(item.productImage)}" style="width:100%;height:100%;object-fit:cover" />` : ''}
                  </div>
                  <div style="flex:1;min-width:0">
                    <div class="text-sm font-medium" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sanitizeHTML(item.productName)}</div>
                    <div class="text-xs text-muted">x${item.quantity}</div>
                  </div>
                  <div class="text-sm font-semibold">${formatCurrency(item.subtotal)}</div>
                </div>
              `).join('')}
              <div class="cart-summary-row mt-1"><span>Tạm tính</span><span>${formatCurrency(cart.totalAmount)}</span></div>
              ${this.voucherDiscount > 0 ? `<div class="cart-summary-row"><span>Giảm giá</span><span style="color:var(--success)">-${formatCurrency(this.voucherDiscount)}</span></div>` : ''}
              <div class="cart-summary-row"><span>Phí vận chuyển</span><span class="text-muted">Miễn phí</span></div>
              <div class="cart-summary-total"><span>Tổng cộng</span><span class="amount">${formatCurrency(total > 0 ? total : 0)}</span></div>
              <button class="btn btn-primary w-full mt-2" style="display:flex;justify-content:center" onclick="CheckoutPage.placeOrder()">
                <i class="fas fa-check"></i> Đặt hàng
              </button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  async applyVoucher() {
    const code = document.getElementById('voucher-input')?.value?.trim();
    if (!code) { Toast.warning('Vui lòng nhập mã giảm giá'); return; }
    try {
      const cart = await Api.getCart();
      const result = await Api.validateVoucher(code, cart.totalAmount);
      this.voucherCode = code;
      this.voucherDiscount = Number(result) || 0;
      Toast.success('Áp dụng mã giảm giá thành công');
      this._loadCheckout();
    } catch (err) {
      this.voucherDiscount = 0;
      Toast.error(err.message || 'Mã giảm giá không hợp lệ');
    }
  },

  async placeOrder() {
    const phone = document.getElementById('checkout-phone')?.value?.trim();
    const address = document.getElementById('checkout-address')?.value?.trim();

    if (!phone) { Toast.warning('Vui lòng nhập số điện thoại'); return; }
    if (!address) { Toast.warning('Vui lòng nhập địa chỉ giao hàng'); return; }

    try {
      const orderData = {
        shippingAddress: address,
        phone: phone,
        paymentMethod: this.paymentMethod,
      };
      if (this.voucherCode) orderData.voucherCode = this.voucherCode;

      const order = await Api.createOrder(orderData);
      Store.setCart(null);
      Header.render();

      if (this.paymentMethod === 'VNPAY' && order?.id) {
        Toast.info('Đang chuyển đến VNPay...');
        const returnUrl = window.location.origin + window.location.pathname + '#/payment-result';
        const payment = await Api.createVnPayPayment(order.id, returnUrl);
        if (payment?.paymentUrl) {
          window.location.href = payment.paymentUrl;
          return;
        }
      }

      Toast.success('Đặt hàng thành công!');
      Router.navigate('/orders/' + order.id);
    } catch (err) {
      Toast.error(err.message);
    }
  }
};
