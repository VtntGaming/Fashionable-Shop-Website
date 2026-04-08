// ===== Wishlist Page =====

const WishlistPage = {
  async render(container) {
    container.innerHTML = `<div class="container">${renderLoading()}</div>`;
    try {
      const wishlist = await Api.getWishlist();
      const items = Array.isArray(wishlist) ? wishlist : (wishlist?.items || wishlist?.content || []);
      container.innerHTML = `
        <div class="container">
          <div class="page-header">
            <div class="breadcrumbs">
              <a href="#/" data-link>Trang chủ</a>
              <i class="fas fa-chevron-right text-xs"></i>
              <span>Yêu thích</span>
            </div>
            <h1><i class="fas fa-heart" style="color:var(--accent)"></i> Sản phẩm yêu thích</h1>
          </div>
          ${items.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-heart-broken"></i>
              <h3>Chưa có sản phẩm yêu thích</h3>
              <p>Hãy thêm sản phẩm vào danh sách yêu thích khi mua sắm</p>
              <a href="#/shop" data-link class="btn btn-primary">Khám phá ngay</a>
            </div>
          ` : `
            <div class="products-grid">
              ${items.map(item => {
                const productId = item.productId || item.id;
                const productName = item.productName || item.name || 'Sản phẩm';
                const productSlug = item.productSlug || item.slug || productId;
                const productImage = item.productImage || item.imageUrl || '';
                const currentPrice = item.salePrice || item.effectivePrice || item.price || 0;
                const originalPrice = item.price || currentPrice;

                return `
                  <div class="product-card">
                    <div class="product-card-image">
                      ${productImage ? `<img src="${getImageUrl(productImage)}" alt="${sanitizeHTML(productName)}" />` : '<div class="product-card-placeholder"><i class="fas fa-image"></i></div>'}
                      <div class="product-card-overlay">
                        <button class="card-action-btn" onclick="WishlistPage.remove(${productId})" title="Bỏ yêu thích"><i class="fas fa-heart-broken"></i></button>
                        <a class="card-action-btn" href="#/product/${productSlug}" data-link title="Xem"><i class="fas fa-eye"></i></a>
                      </div>
                    </div>
                    <div class="product-card-body">
                      <span class="product-card-category">${sanitizeHTML(item.status || '')}</span>
                      <h3 class="product-card-title"><a href="#/product/${productSlug}" data-link>${sanitizeHTML(productName)}</a></h3>
                      <div class="product-card-price">
                        <span class="current-price">${formatCurrency(currentPrice)}</span>
                        ${item.salePrice && item.salePrice < originalPrice ? `<span class="original-price">${formatCurrency(originalPrice)}</span>` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div></div>`;
    }
  },

  async remove(productId) {
    try {
      await Api.removeFromWishlist(productId);
      Toast.success('Đã xóa khỏi yêu thích');
      WishlistPage.render(document.getElementById('main-content'));
    } catch (err) {
      Toast.error(err.message);
    }
  }
};
