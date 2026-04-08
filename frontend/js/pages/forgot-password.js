// ===== Forgot Password Page =====

const ForgotPasswordPage = {
  render(container) {
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-illustration">
          <div class="auth-illustration-content">
            <i class="fas fa-unlock-alt" style="font-size:4rem;margin-bottom:24px"></i>
            <h2>Quên mật khẩu?</h2>
            <p>Đừng lo, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn</p>
          </div>
        </div>
        <div class="auth-form-section">
          <div class="auth-form-wrapper">
            <div class="auth-logo"><a href="#/" data-link>Fashionable<span>.</span></a></div>
            <h1>Quên mật khẩu</h1>
            <p class="text-muted" style="margin-bottom:24px">Nhập email của bạn để nhận link đặt lại mật khẩu</p>

            <form id="forgot-form" onsubmit="ForgotPasswordPage.handleSubmit(event)">
              <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" class="form-control" placeholder="your@email.com" required autofocus />
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%" id="forgot-btn">
                <i class="fas fa-paper-plane"></i> Gửi link đặt lại
              </button>
            </form>

            <p class="text-center" style="margin-top:24px">
              <a href="#/login" data-link style="color:var(--primary)"><i class="fas fa-arrow-left"></i> Quay lại đăng nhập</a>
            </p>
          </div>
        </div>
      </div>
    `;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('forgot-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    try {
      await Api.forgotPassword(e.target.email.value.trim());
      document.querySelector('.auth-form-wrapper').innerHTML = `
        <div class="text-center" style="padding:40px 0">
          <i class="fas fa-envelope-open-text" style="font-size:3rem;color:var(--primary);margin-bottom:16px"></i>
          <h2>Kiểm tra email</h2>
          <p class="text-muted" style="margin:12px 0 24px">Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.</p>
          <a href="#/login" data-link class="btn btn-primary">Quay lại đăng nhập</a>
        </div>
      `;
    } catch (err) {
      Toast.error(err.message || 'Gửi thất bại');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi link đặt lại';
    }
  }
};
