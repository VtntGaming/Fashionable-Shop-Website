// ===== Product Detail Page =====

const ProductDetailPage = {
  product: null,
  quantity: 1,

  async render(container, params) {
    container.innerHTML = `<div class="container">${renderLoading()}</div>`;
    const slug = params.slug;

    try {
      this.product = await Api.getProductBySlug(slug);
      this.quantity = 1;
      this._renderContent(container);
    } catch {
      try {
        this.product = await Api.getProduct(slug);
        this.quantity = 1;
        this._renderContent(container);
      } catch (err) {
        container.innerHTML = `<div class="container"><div class="empty-state"><i class="fas fa-box-open"></i><h3>Sản phẩm không tồn tại</h3><p>${sanitizeHTML(err.message)}</p><a href="#/shop" data-link class="btn btn-primary">Quay lại cửa hàng</a></div></div>`;
      }
    }
  },

  _renderContent(container) {
    const p = this.product;
    const effectivePrice = p.salePrice || p.effectivePrice || p.price;
    const hasDiscount = p.salePrice && p.salePrice < p.price;
    const mainImage = getImageUrl(p.imageUrl || (p.images && p.images[0]));
    const images = (p.images || []).map(getImageUrl).filter(Boolean);
    if (mainImage && !images.includes(mainImage)) images.unshift(mainImage);

    container.innerHTML = `
      <div class="container">
        <div class="page-header">
          <div class="breadcrumbs">
            <a href="#/" data-link>Trang chủ</a>
            <i class="fas fa-chevron-right text-xs"></i>
            <a href="#/shop" data-link>Cửa hàng</a>
            <i class="fas fa-chevron-right text-xs"></i>
            ${p.categoryName ? `<a href="#/shop?categoryId=${p.categoryId}" data-link>${sanitizeHTML(p.categoryName)}</a><i class="fas fa-chevron-right text-xs"></i>` : ''}
            <span>${sanitizeHTML(truncate(p.name, 40))}</span>
          </div>
        </div>
        <div class="product-detail-layout">
          <div class="product-gallery">
            <div class="product-main-image" id="main-img-container">
              ${mainImage ? `<img src="${mainImage}" alt="${sanitizeHTML(p.name)}" id="main-product-img" />` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;opacity:.15"><i class="fas fa-tshirt"></i></div>'}
            </div>
            ${images.length > 1 ? `
              <div class="product-thumbnails">
                ${images.map((img, i) => `<img src="${img}" class="${i === 0 ? 'active' : ''}" onclick="ProductDetailPage.switchImage('${img}', this)" />`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="product-info">
            ${p.categoryName ? `<span class="product-card-category">${sanitizeHTML(p.categoryName)}</span>` : ''}
            <h1>${sanitizeHTML(p.name)}</h1>
            <div class="product-meta">
              <span>${renderStarRating(p.averageRating || 0)} (${p.reviewCount || 0} đánh giá)</span>
              <span><i class="fas fa-eye"></i> ${p.views || 0} lượt xem</span>
              ${p.brand ? `<span><i class="fas fa-tag"></i> ${sanitizeHTML(p.brand)}</span>` : ''}
            </div>
            <div class="product-price-box">
              <span class="current-price">${formatCurrency(effectivePrice)}</span>
              ${hasDiscount ? `
                <span class="original-price">${formatCurrency(p.price)}</span>
                <span class="sale-badge">-${Math.round((1 - p.salePrice / p.price) * 100)}%</span>
              ` : ''}
            </div>
            <p class="product-description">${sanitizeHTML(p.description)}</p>
            <div class="product-stock">
              ${p.stock > 0
                ? `<span class="badge badge-success"><i class="fas fa-check"></i> Còn hàng (${p.stock})</span>`
                : `<span class="badge badge-danger"><i class="fas fa-times"></i> Hết hàng</span>`
              }
            </div>
            ${p.stock > 0 ? `
              <div class="flex items-center gap-2">
                <div class="quantity-control">
                  <button onclick="ProductDetailPage.changeQty(-1)"><i class="fas fa-minus"></i></button>
                  <input type="number" id="qty-input" value="${this.quantity}" min="1" max="${p.stock}" readonly />
                  <button onclick="ProductDetailPage.changeQty(1)"><i class="fas fa-plus"></i></button>
                </div>
              </div>
              <div class="product-actions">
                <button class="btn btn-primary btn-lg" onclick="ProductDetailPage.addToCart()">
                  <i class="fas fa-shopping-bag"></i> Thêm vào giỏ
                </button>
                <button class="btn btn-secondary btn-lg" onclick="ProductDetailPage.toggleWishlist()">
                  <i class="far fa-heart"></i>
                </button>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews-section" id="reviews-section">
          ${renderLoading()}
        </div>
      </div>
    `;

    this._loadReviews();
  },

  switchImage(url, thumb) {
    const img = document.getElementById('main-product-img');
    if (img) img.src = url;
    document.querySelectorAll('.product-thumbnails img').forEach(t => t.classList.remove('active'));
    if (thumb) thumb.classList.add('active');
  },

  changeQty(delta) {
    const input = document.getElementById('qty-input');
    let val = parseInt(input.value) + delta;
    val = Math.max(1, Math.min(val, this.product.stock));
    input.value = val;
    this.quantity = val;
  },

  async addToCart() {
    if (!Store.isAuthenticated()) {
      Toast.warning('Vui lòng đăng nhập');
      Router.navigate('/login');
      return;
    }
    try {
      const cart = await Api.addToCart(this.product.id, this.quantity);
      Store.setCart(cart);
      Toast.success('Đã thêm vào giỏ hàng');
      Header.render();
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async toggleWishlist() {
    if (!Store.isAuthenticated()) {
      Toast.warning('Vui lòng đăng nhập');
      Router.navigate('/login');
      return;
    }
    try {
      await Api.addToWishlist(this.product.id);
      Toast.success('Đã thêm vào yêu thích');
    } catch {
      try {
        await Api.removeFromWishlist(this.product.id);
        Toast.info('Đã bỏ yêu thích');
      } catch (err) {
        Toast.error(err.message);
      }
    }
  },

  async _loadReviews() {
    const section = document.getElementById('reviews-section');
    try {
      const result = await Api.getProductReviews(this.product.id, { page: 0, size: 10 });
      const reviews = result?.content || (Array.isArray(result) ? result : []);

      section.innerHTML = `
        <h2 style="margin-bottom:20px">Đánh giá (${reviews.length})</h2>
        ${Store.isAuthenticated() ? `
          <div class="review-card mb-2" id="review-form-card">
            <h3 style="margin-bottom:12px">Viết đánh giá</h3>
            <div id="review-stars">${renderStarInput(0, (val) => { this._reviewRating = val; })}</div>
            <textarea id="review-comment" placeholder="Nhận xét của bạn..." rows="3" style="margin-top:8px"></textarea>
            <button class="btn btn-primary btn-sm mt-1" onclick="ProductDetailPage.submitReview()">Gửi đánh giá</button>
          </div>
        ` : ''}
        ${reviews.length ? reviews.map(r => `
          <div class="review-card">
            <div class="review-header">
              <div class="review-avatar">${getInitials(r.userFullName || r.userName || 'U')}</div>
              <div>
                <strong>${sanitizeHTML(r.userFullName || r.userName || 'Người dùng')}</strong>
                <div>${renderStarRating(r.rating)} <span class="text-sm text-muted">${timeAgo(r.createdAt)}</span></div>
              </div>
            </div>
            <div class="review-body">${sanitizeHTML(r.comment)}</div>
          </div>
        `).join('') : '<p class="text-muted">Chưa có đánh giá nào.</p>'}
      `;
    } catch {
      section.innerHTML = '';
    }
  },

  _reviewRating: 0,

  async submitReview() {
    if (!this._reviewRating) {
      Toast.warning('Vui lòng chọn số sao');
      return;
    }
    const comment = document.getElementById('review-comment')?.value?.trim();
    try {
      await Api.createReview({ productId: this.product.id, rating: this._reviewRating, comment });
      Toast.success('Đã gửi đánh giá');
      this._reviewRating = 0;
      this._loadReviews();
    } catch (err) {
      Toast.error(err.message);
    }
  }
};
