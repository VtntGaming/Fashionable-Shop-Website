// ===== Home Page =====

const HomePage = {
  async render(container) {
    container.innerHTML = renderLoading();

    try {
      const [categories, featured, trending] = await Promise.all([
        Api.getCategories().catch(() => []),
        Api.getFeaturedProducts(0, 8).catch(() => ({ content: [] })),
        Api.getTrending().catch(() => []),
      ]);

      const catList = Array.isArray(categories) ? categories : (categories?.content || []);
      const featuredList = Array.isArray(featured) ? featured : (featured?.content || []);
      const trendingList = Array.isArray(trending) ? trending : (trending?.content || []);

      container.innerHTML = `
        <!-- Hero -->
        <section class="hero">
          <div class="container hero-inner">
            <div class="hero-content">
              <h1>Phong Cách Thời Trang Của Bạn</h1>
              <p>Khám phá bộ sưu tập thời trang mới nhất với thiết kế hiện đại, chất liệu cao cấp và giá cả hợp lý.</p>
              <div class="hero-buttons">
                <a href="#/shop" data-link class="btn btn-primary btn-lg">
                  <i class="fas fa-shopping-bag"></i> Mua sắm ngay
                </a>
                <a href="#/vouchers" data-link class="btn btn-secondary btn-lg" style="border-color:rgba(255,255,255,.3);color:#fff">
                  <i class="fas fa-tags"></i> Khuyến mãi
                </a>
              </div>
              <div class="hero-stats">
                <div class="hero-stat"><h3>1000+</h3><p>Sản phẩm</p></div>
                <div class="hero-stat"><h3>500+</h3><p>Khách hàng</p></div>
                <div class="hero-stat"><h3>99%</h3><p>Hài lòng</p></div>
              </div>
            </div>
            <div class="hero-visual">
              <i class="fas fa-tshirt"></i>
            </div>
          </div>
        </section>

        <!-- Categories -->
        ${catList.length ? `
        <section class="container" style="padding-top:60px">
          <div class="section-header">
            <h2>Danh Mục</h2>
            <a href="#/shop" data-link>Xem tất cả <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="categories-grid">
            ${catList.slice(0, 6).map((cat, i) => {
              const colors = ['#6C5CE7','#00CEC9','#FD79A8','#FDCB6E','#74B9FF','#00B894'];
              const icons = ['👗','👔','👟','👜','👒','🧥'];
              return `
                <a href="#/shop?categoryId=${cat.id}" data-link class="category-card">
                  <div class="category-card-bg" style="background:linear-gradient(135deg,${colors[i % 6]},${colors[(i+1) % 6]}22)">
                    ${icons[i % 6]}
                  </div>
                  <div class="category-card-overlay">
                    <span>${sanitizeHTML(cat.name)}</span>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        </section>
        ` : ''}

        <!-- Featured Products -->
        ${featuredList.length ? `
        <section class="container" style="padding-top:60px">
          <div class="section-header">
            <h2>Sản Phẩm Nổi Bật</h2>
            <a href="#/shop?featured=true" data-link>Xem tất cả <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="grid grid-4 gap-2">
            ${featuredList.map(p => renderProductCard(p)).join('')}
          </div>
        </section>
        ` : ''}

        <!-- CTA Banner -->
        <section class="container">
          <div class="cta-banner">
            <h2>Giảm giá đến 50%</h2>
            <p>Đừng bỏ lỡ cơ hội sở hữu những sản phẩm thời trang yêu thích với giá ưu đãi nhất.</p>
            <a href="#/vouchers" data-link class="btn btn-accent btn-lg">
              <i class="fas fa-tags"></i> Xem khuyến mãi
            </a>
          </div>
        </section>

        <!-- Trending -->
        ${trendingList.length ? `
        <section class="container" style="padding-bottom:60px">
          <div class="section-header">
            <h2>Xu Hướng</h2>
            <a href="#/shop?sortBy=views&sortDir=desc" data-link>Xem tất cả <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="grid grid-4 gap-2">
            ${trendingList.slice(0, 4).map(p => renderProductCard(p)).join('')}
          </div>
        </section>
        ` : ''}
      `;

    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Không thể tải trang</h3>
          <p>${sanitizeHTML(err.message)}</p>
          <button class="btn btn-primary" onclick="HomePage.render(document.getElementById('main-content'))">Thử lại</button>
        </div>
      `;
    }
  }
};
