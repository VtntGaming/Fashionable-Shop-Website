// ===== Cart Page =====

const CartPage = {
  async render(container) {
    container.innerHTML = `<div class="container"><div class="page-header"><div class="breadcrumbs"><a href="#/" data-link>Trang chủ</a><i class="fas fa-chevron-right text-xs"></i><span>Giỏ hàng</span></div><h1>Giỏ Hàng</h1></div><div id="cart-content">${renderLoading()}</div></div>`;
    await this._loadCart();
  },

  async _loadCart() {
    const el = document.getElementById('cart-content');
    try {
      const cart = await Api.getCart();
      Store.setCart(cart);
      Header.render();
      const items = cart?.items || [];

      if (!items.length) {
        el.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-shopping-bag"></i>
            <h3>Giỏ hàng trống</h3>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <a href="#/shop" data-link class="btn btn-primary">Mua sắm ngay</a>
          </div>
        `;
        return;
      }

      el.innerHTML = `
        <div class="cart-layout">
          <div class="cart-items">
            ${items.map(item => `
              <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                  ${item.productImage
                    ? `<img src="${getImageUrl(item.productImage)}" alt="" />`
                    : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-tshirt fa-2x"></i></div>'
                  }
                </div>
                <div class="cart-item-info">
                  <h3><a href="#/product/${item.productId}" data-link>${sanitizeHTML(item.productName)}</a></h3>
                  <p class="price">${formatCurrency(item.priceAtAdd)}</p>
                  <div class="cart-item-actions">
                    <div class="quantity-control">
                      <button onclick="CartPage.updateQty(${item.id}, ${item.quantity - 1})"><i class="fas fa-minus"></i></button>
                      <input type="number" value="${item.quantity}" readonly />
                      <button onclick="CartPage.updateQty(${item.id}, ${item.quantity + 1})"><i class="fas fa-plus"></i></button>
                    </div>
                    <span class="font-semibold" style="color:var(--primary)">${formatCurrency(item.subtotal)}</span>
                    <button class="cart-item-remove" onclick="CartPage.removeItem(${item.id})">
                      <i class="fas fa-trash"></i> Xóa
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div class="cart-summary-row"><span>Số lượng sản phẩm</span><span>${items.length}</span></div>
            <div class="cart-summary-row"><span>Tạm tính</span><span>${formatCurrency(cart.totalAmount)}</span></div>
            <div class="cart-summary-row"><span>Phí vận chuyển</span><span class="text-muted">Miễn phí</span></div>
            <div class="cart-summary-total"><span>Tổng cộng</span><span class="amount">${formatCurrency(cart.totalAmount)}</span></div>
            <a href="#/checkout" data-link class="btn btn-primary w-full mt-2" style="display:flex">
              <i class="fas fa-credit-card"></i> Tiến hành thanh toán
            </a>
            <button class="btn btn-secondary w-full mt-1" style="display:flex;justify-content:center" onclick="CartPage.clearAll()">
              <i class="fas fa-trash"></i> Xóa tất cả
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  async updateQty(cartItemId, quantity) {
    if (quantity < 1) {
      this.removeItem(cartItemId);
      return;
    }
    try {
      await Api.updateCartItem(cartItemId, quantity);
      await this._loadCart();
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async removeItem(cartItemId) {
    try {
      await Api.removeCartItem(cartItemId);
      Toast.success('Đã xóa sản phẩm');
      await this._loadCart();
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async clearAll() {
    Modal.confirm('Xóa giỏ hàng', 'Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?', async () => {
      try {
        await Api.clearCart();
        Toast.success('Đã xóa giỏ hàng');
        await this._loadCart();
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
