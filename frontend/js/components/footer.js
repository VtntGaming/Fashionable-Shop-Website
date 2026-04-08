// ===== Footer Component =====

const Footer = {
  render() {
    const footer = document.getElementById('footer');
    // Hide footer for admin pages
    if (Router.currentPath.startsWith('/admin')) {
      footer.innerHTML = '';
      footer.className = '';
      return;
    }

    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3><i class="fas fa-tshirt"></i> Fashion<span>able</span></h3>
            <p>Thời trang chất lượng, phong cách hiện đại. Mang đến cho bạn những sản phẩm thời trang tốt nhất với giá cả hợp lý.</p>
            <div class="footer-social">
              <a href="#"><i class="fab fa-facebook-f"></i></a>
              <a href="#"><i class="fab fa-instagram"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
              <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Cửa hàng</h4>
            <a href="#/shop" data-link>Tất cả sản phẩm</a>
            <a href="#/shop?sortBy=createdAt&sortDir=desc" data-link>Hàng mới</a>
            <a href="#/shop?sortBy=views&sortDir=desc" data-link>Bán chạy</a>
            <a href="#/vouchers" data-link>Khuyến mãi</a>
          </div>
          <div class="footer-col">
            <h4>Hỗ trợ</h4>
            <a href="#">Chính sách đổi trả</a>
            <a href="#">Hướng dẫn đặt hàng</a>
            <a href="#">Phương thức thanh toán</a>
            <a href="#">Liên hệ</a>
          </div>
          <div class="footer-col">
            <h4>Liên hệ</h4>
            <a href="#"><i class="fas fa-map-marker-alt"></i> TP. Hồ Chí Minh</a>
            <a href="#"><i class="fas fa-phone"></i> 0123 456 789</a>
            <a href="#"><i class="fas fa-envelope"></i> info@fashionable.vn</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Fashionable Shop. All rights reserved.</p>
        </div>
      </div>
    `;
  }
};
