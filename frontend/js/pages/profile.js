// ===== Profile Page =====

const ProfilePage = {
  _tab: 'info',

  async render(container) {
    container.innerHTML = `<div class="container">${renderLoading()}</div>`;
    try {
      const user = await Api.getProfile();
      Store.setUser(user);
      this._user = user;
      this._renderContent(container);
    } catch (err) {
      container.innerHTML = `<div class="container"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div></div>`;
    }
  },

  _renderContent(container) {
    const u = this._user;
    container.innerHTML = `
      <div class="container">
        <div class="page-header">
          <div class="breadcrumbs"><a href="#/" data-link>Trang chủ</a><i class="fas fa-chevron-right text-xs"></i><span>Tài khoản</span></div>
          <h1>Tài khoản của tôi</h1>
        </div>
        <div class="profile-layout">
          <div class="profile-sidebar">
            <div class="profile-avatar-section" style="text-align:center;padding:24px">
              <div class="profile-avatar" style="width:100px;height:100px;border-radius:50%;margin:0 auto 12px;overflow:hidden;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--primary)">
                ${u.avatarUrl ? `<img src="${getImageUrl(u.avatarUrl)}" style="width:100%;height:100%;object-fit:cover" />` : getInitials(u.fullName || u.email)}
              </div>
              <h3>${sanitizeHTML(u.fullName || '')}</h3>
              <p class="text-muted text-sm">${sanitizeHTML(u.email)}</p>
              <label class="btn btn-secondary btn-sm" style="margin-top:12px;cursor:pointer">
                <i class="fas fa-camera"></i> Đổi ảnh
                <input type="file" accept="image/*" style="display:none" onchange="ProfilePage.uploadAvatar(this)" />
              </label>
            </div>
            <nav class="profile-nav" style="padding:0 12px 12px">
              <button class="profile-tab ${this._tab === 'info' ? 'active' : ''}" onclick="ProfilePage.switchTab('info')"><i class="fas fa-user"></i> Thông tin</button>
              <button class="profile-tab ${this._tab === 'password' ? 'active' : ''}" onclick="ProfilePage.switchTab('password')"><i class="fas fa-lock"></i> Đổi mật khẩu</button>
            </nav>
          </div>
          <div class="profile-content" id="profile-tab-content">
            ${this._tab === 'info' ? this._renderInfo(u) : this._renderPassword()}
          </div>
        </div>
      </div>
    `;
  },

  _renderInfo(u) {
    return `
      <div class="card" style="padding:24px">
        <h3 style="margin-bottom:20px">Thông tin cá nhân</h3>
        <form id="profile-form" onsubmit="ProfilePage.updateProfile(event)">
          <div class="form-group">
            <label>Họ và tên</label>
            <input type="text" name="fullName" value="${sanitizeHTML(u.fullName || '')}" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" value="${sanitizeHTML(u.email)}" class="form-control" disabled />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input type="tel" name="phone" value="${sanitizeHTML(u.phone || '')}" class="form-control" />
          </div>
          <div class="form-group">
            <label>Địa chỉ</label>
            <textarea name="address" rows="3" class="form-control">${sanitizeHTML(u.address || '')}</textarea>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Lưu thay đổi</button>
        </form>
      </div>
    `;
  },

  _renderPassword() {
    return `
      <div class="card" style="padding:24px">
        <h3 style="margin-bottom:20px">Đổi mật khẩu</h3>
        <form id="password-form" onsubmit="ProfilePage.changePassword(event)">
          <div class="form-group">
            <label>Mật khẩu hiện tại</label>
            <input type="password" name="currentPassword" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input type="password" name="newPassword" class="form-control" required minlength="6" />
          </div>
          <div class="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input type="password" name="confirmPassword" class="form-control" required minlength="6" />
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-key"></i> Đổi mật khẩu</button>
        </form>
      </div>
    `;
  },

  switchTab(tab) {
    this._tab = tab;
    this._renderContent(document.getElementById('main-content'));
  },

  async updateProfile(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    try {
      const data = {
        fullName: form.fullName.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim()
      };
      const updated = await Api.updateProfile(data);
      Store.setUser(updated);
      this._user = updated;
      Toast.success('Cập nhật thành công');
      Header.render(document.getElementById('header'));
    } catch (err) {
      Toast.error(err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
    }
  },

  async changePassword(e) {
    e.preventDefault();
    const form = e.target;
    if (form.newPassword.value !== form.confirmPassword.value) {
      Toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    try {
      await Api.changePassword({
        currentPassword: form.currentPassword.value,
        newPassword: form.newPassword.value
      });
      Toast.success('Đổi mật khẩu thành công');
      form.reset();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-key"></i> Đổi mật khẩu';
    }
  },

  async uploadAvatar(input) {
    if (!input.files || !input.files[0]) return;
    try {
      const result = await Api.uploadAvatar(input.files[0]);
      Toast.success('Đã cập nhật ảnh đại diện');
      ProfilePage.render(document.getElementById('main-content'));
      Header.render(document.getElementById('header'));
    } catch (err) {
      Toast.error(err.message);
    }
  }
};
