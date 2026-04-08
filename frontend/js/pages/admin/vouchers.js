// ===== Admin Vouchers =====

const AdminVouchersPage = {
  async render(container) {
    container.innerHTML = renderLoading();
    try {
      const data = await Api.adminGetVouchers({ page: 0, size: Config.ADMIN_ITEMS_PER_PAGE || 10 });
      const vouchers = data.content || data || [];

      container.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:24px">
          <h1>Quản lý mã giảm giá</h1>
          <button class="btn btn-primary" onclick="AdminVouchersPage.showForm()"><i class="fas fa-plus"></i> Thêm mới</button>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead><tr><th>Mã</th><th>Giảm giá</th><th>Đơn tối thiểu</th><th>Số lượng</th><th>Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              ${(!vouchers || vouchers.length === 0) ? '<tr><td colspan="7" class="text-center text-muted">Không có mã giảm giá</td></tr>' :
                vouchers.map(v => {
                  const endDate = v.endDate || v.expiryDate;
                  const expired = endDate ? new Date(endDate) < new Date() : false;
                  const isActive = !expired && (v.status || 'ACTIVE') === 'ACTIVE';
                  return `
                    <tr>
                      <td><strong>${sanitizeHTML(v.code)}</strong></td>
                      <td>${v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}</td>
                      <td>${v.minOrderValue ? formatCurrency(v.minOrderValue) : '-'}</td>
                      <td>${v.quantity === 0 ? 'Không giới hạn' : (v.quantity ?? '-')}</td>
                      <td>${formatDate(endDate)}</td>
                      <td><span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">${expired ? 'Hết hạn' : (isActive ? 'Hoạt động' : 'Ẩn')}</span></td>
                      <td class="admin-actions">
                        <button class="btn-action btn-edit" onclick="AdminVouchersPage.showForm(${v.id})" title="Sửa"><i class="fas fa-edit"></i></button>
                        <button class="btn-action btn-delete" onclick="AdminVouchersPage.delete(${v.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  async showForm(id) {
    let v = { code: '', discountType: 'PERCENT', discountValue: '', minOrderValue: '', maxDiscount: '', quantity: 0, startDate: '', endDate: '', status: 'ACTIVE' };
    if (id) {
      try {
        const data = await Api.adminGetVouchers({ page: 0, size: 100 });
        const vouchers = data.content || data || [];
        v = vouchers.find(x => x.id === id) || v;
      } catch (_) {}
    }

    const toDateInputValue = (dateValue) => {
      if (!dateValue) return '';
      const date = new Date(dateValue);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${date.getFullYear()}-${month}-${day}`;
    };

    const startVal = toDateInputValue(v.startDate) || toDateInputValue(new Date());
    const endVal = toDateInputValue(v.endDate);

    Modal.show(
      id ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá',
      `<form id="voucher-form">
        <div class="form-group"><label>Mã giảm giá *</label><input type="text" name="code" class="form-control" value="${sanitizeHTML(v.code)}" required style="text-transform:uppercase" /></div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Loại giảm *</label>
            <select name="discountType" class="form-control">
              <option value="PERCENT" ${v.discountType === 'PERCENT' ? 'selected' : ''}>Phần trăm (%)</option>
              <option value="AMOUNT" ${v.discountType === 'AMOUNT' ? 'selected' : ''}>Số tiền cố định</option>
            </select>
          </div>
          <div class="form-group" style="flex:1"><label>Giá trị *</label><input type="number" name="discountValue" class="form-control" value="${v.discountValue || ''}" required min="0.01" step="0.01" /></div>
        </div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Đơn tối thiểu</label><input type="number" name="minOrderValue" class="form-control" value="${v.minOrderValue || ''}" min="0" step="0.01" /></div>
          <div class="form-group" style="flex:1"><label>Số lượng</label><input type="number" name="quantity" class="form-control" value="${v.quantity ?? 0}" min="0" /></div>
        </div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Giảm tối đa</label><input type="number" name="maxDiscount" class="form-control" value="${v.maxDiscount || ''}" min="0" step="0.01" /></div>
          <div class="form-group" style="flex:1"><label>Trạng thái</label>
            <select name="status" class="form-control">
              <option value="ACTIVE" ${(v.status || 'ACTIVE') === 'ACTIVE' ? 'selected' : ''}>Hoạt động</option>
              <option value="INACTIVE" ${v.status === 'INACTIVE' ? 'selected' : ''}>Ẩn</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Ngày bắt đầu *</label><input type="date" name="startDate" class="form-control" value="${startVal}" required /></div>
          <div class="form-group" style="flex:1"><label>Ngày kết thúc *</label><input type="date" name="endDate" class="form-control" value="${endVal}" required /></div>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Modal.hide()">Hủy</button>
       <button class="btn btn-primary" onclick="AdminVouchersPage.save(${id || 'null'})">${id ? 'Cập nhật' : 'Tạo mới'}</button>`
    );
  },

  async save(id) {
    const form = document.getElementById('voucher-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    try {
      const startDate = form.startDate.value ? `${form.startDate.value}T00:00:00` : null;
      const endDate = form.endDate.value ? `${form.endDate.value}T23:59:59` : null;

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        Toast.error('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }

      const data = {
        code: form.code.value.trim().toUpperCase(),
        discountType: form.discountType.value,
        discountValue: parseFloat(form.discountValue.value),
        minOrderValue: form.minOrderValue.value ? parseFloat(form.minOrderValue.value) : null,
        maxDiscount: form.maxDiscount.value ? parseFloat(form.maxDiscount.value) : null,
        quantity: form.quantity.value ? parseInt(form.quantity.value, 10) : 0,
        startDate,
        endDate,
        status: form.status.value
      };

      if (id) {
        await Api.adminUpdateVoucher(id, data);
      } else {
        await Api.adminCreateVoucher(data);
      }
      Modal.hide();
      Toast.success(id ? 'Đã cập nhật' : 'Đã tạo mã giảm giá');
      this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async delete(id) {
    Modal.confirm('Xóa mã giảm giá', 'Bạn có chắc muốn xóa mã giảm giá này?', async () => {
      try {
        await Api.adminDeleteVoucher(id);
        Toast.success('Đã xóa');
        this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
