// ===== Not Found Page =====

const NotFoundPage = {
  render(container) {
    container.innerHTML = `
      <div class="not-found-page">
        <div class="not-found-content">
          <h1 class="not-found-code">404</h1>
          <h2>Không tìm thấy trang</h2>
          <p class="text-muted">Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.</p>
          <div class="flex gap-3 justify-center" style="margin-top:24px">
            <a href="#/" data-link class="btn btn-primary"><i class="fas fa-home"></i> Trang chủ</a>
            <a href="#/shop" data-link class="btn btn-secondary"><i class="fas fa-shopping-bag"></i> Cửa hàng</a>
          </div>
        </div>
      </div>
    `;
  }
};
