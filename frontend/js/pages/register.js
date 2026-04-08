// ===== Register Page =====

const RegisterPage = {
  render(container) {
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-illustration">
          <div class="auth-illustration-content">
            <i class="fas fa-user-plus" style="font-size:4rem;margin-bottom:24px"></i>
            <h2>Tham gia cùng chúng tôi!</h2>
            <p>Tạo tài khoản để trải nghiệm mua sắm thời trang tuyệt vời</p>
          </div>
        </div>
        <div class="auth-form-section">
          <div class="auth-form-wrapper">
            <div class="auth-logo"><a href="#/" data-link>Fashionable<span>.</span></a></div>
            <h1>Đăng ký</h1>
            <p class="text-muted" style="margin-bottom:24px">Tạo tài khoản mới</p>

            <form id="register-form" onsubmit="RegisterPage.handleSubmit(event)">
              <div class="form-group">
                <label>Họ và tên</label>
                <input type="text" name="fullName" class="form-control" placeholder="Nguyễn Văn A" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" class="form-control" placeholder="your@email.com" required />
              </div>
              <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" name="password" class="form-control" placeholder="Tối thiểu 6 ký tự" required minlength="6" />
              </div>
              <div class="form-group">
                <label>Xác nhận mật khẩu</label>
                <input type="password" name="confirmPassword" class="form-control" placeholder="Nhập lại mật khẩu" required minlength="6" />
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" name="phone" class="form-control" placeholder="0912345678" />
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%" id="register-btn">
                <i class="fas fa-user-plus"></i> Đăng ký
              </button>
            </form>

            <p class="text-center" style="margin-top:24px">
              Đã có tài khoản? <a href="#/login" data-link style="color:var(--primary);font-weight:600">Đăng nhập</a>
            </p>
          </div>
        </div>
      </div>
    `;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (form.password.value !== form.confirmPassword.value) {
      Toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng ký...';
    try {
      await Auth.register({
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        phone: form.phone.value.trim()
      });
      Toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      Router.navigate('/login');
    } catch (err) {
      Toast.error(err.message || 'Đăng ký thất bại');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng ký';
    }
  }
};
