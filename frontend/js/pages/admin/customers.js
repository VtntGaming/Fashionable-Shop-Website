// ===== Admin Customers =====

const AdminCustomersPage = {
  _page: 0,
  _keyword: '',

  async render(container) {
    container.innerHTML = renderLoading();
    await this._load(container);
  },

  async _load(container) {
    try {
      const data = await Api.adminGetUsers({ page: this._page, size: Config.ADMIN_ITEMS_PER_PAGE || 10, keyword: this._keyword });
      const users = data.content || data || [];
      const totalPages = data.totalPages || 1;

      container.innerHTML = `
        <h1 style="margin-bottom:24px">Quản lý khách hàng</h1>
        <div class="admin-toolbar">
          <input type="text" class="form-control" placeholder="Tìm kiếm theo tên, email..." value="${sanitizeHTML(this._keyword)}" oninput="AdminCustomersPage.search(this.value)" style="max-width:300px" />
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead><tr><th>Avatar</th><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              ${users.length === 0 ? '<tr><td colspan="7" class="text-center text-muted">Không có khách hàng</td></tr>' :
                users.map(u => `
                  <tr>
                    <td><div style="width:36px;height:36px;border-radius:50%;overflow:hidden;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:0.8rem;color:var(--primary)">${u.avatarUrl ? `<img src="${getImageUrl(u.avatarUrl)}" style="width:100%;height:100%;object-fit:cover"/>` : getInitials(u.fullName || u.email)}</div></td>
                    <td><strong>${sanitizeHTML(u.fullName || '')}</strong></td>
                    <td>${sanitizeHTML(u.email)}</td>
                    <td>${sanitizeHTML(u.phone || '-')}</td>
                    <td><span class="badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}">${u.role}</span></td>
                    <td>${formatDate(u.createdAt)}</td>
                    <td class="admin-actions">
                      <button class="btn-action btn-edit" onclick="AdminCustomersPage.toggleStatus(${u.id}, '${u.status || 'ACTIVE'}')" title="Đổi trạng thái"><i class="fas fa-user-cog"></i></button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
        <div id="admin-customers-pagination"></div>
      `;
      if (totalPages > 1) {
        document.getElementById('admin-customers-pagination').innerHTML = renderPagination(this._page + 1, totalPages, (pg) => {
          this._page = pg - 1;
          this._load(container);
        });
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  search: debounce(function(val) {
    AdminCustomersPage._keyword = val;
    AdminCustomersPage._page = 0;
    AdminCustomersPage._load(document.querySelector('.admin-content') || document.getElementById('main-content'));
  }, 400),

  toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    Modal.confirm('Đổi trạng thái', `Bạn có chắc muốn ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản này?`, async () => {
      try {
        await Api.adminUpdateUserStatus(id, newStatus);
        Toast.success('Đã cập nhật');
        this._load(document.querySelector('.admin-content') || document.getElementById('main-content'));
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
