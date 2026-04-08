// ===== Admin Categories =====

const AdminCategoriesPage = {
  async render(container) {
    container.innerHTML = renderLoading();
    try {
      const categories = await Api.getCategories();
      container.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:24px">
          <h1>Quản lý danh mục</h1>
          <button class="btn btn-primary" onclick="AdminCategoriesPage.showForm()"><i class="fas fa-plus"></i> Thêm mới</button>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead><tr><th>ID</th><th>Tên</th><th>Mô tả</th><th>Số SP</th><th>Thao tác</th></tr></thead>
            <tbody>
              ${categories.length === 0 ? '<tr><td colspan="5" class="text-center text-muted">Không có danh mục</td></tr>' :
                categories.map(c => `
                  <tr>
                    <td>${c.id}</td>
                    <td><strong>${sanitizeHTML(c.name)}</strong></td>
                    <td class="text-muted">${sanitizeHTML(truncate(c.description || '', 60))}</td>
                    <td>${c.productCount || 0}</td>
                    <td class="admin-actions">
                      <button class="btn-action btn-edit" onclick='AdminCategoriesPage.showForm(${JSON.stringify(c).replace(/'/g, "&#39;")})' title="Sửa"><i class="fas fa-edit"></i></button>
                      <button class="btn-action btn-delete" onclick="AdminCategoriesPage.delete(${c.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  showForm(cat) {
    const isEdit = !!cat;
    const c = cat || { name: '', slug: '', description: '' };
    const initialSlug = c.slug || slugify(c.name || '');
    Modal.show(
      isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục',
      `<form id="category-form">
        <div class="form-group">
          <label>Tên danh mục *</label>
          <input type="text" name="name" class="form-control" value="${sanitizeHTML(c.name)}" required
            oninput="const slugField = document.querySelector('#category-form [name=slug]'); if (slugField && !slugField.dataset.manual) slugField.value = slugify(this.value);" />
        </div>
        <div class="form-group">
          <label>Slug *</label>
          <input type="text" name="slug" class="form-control" value="${sanitizeHTML(initialSlug)}" required
            placeholder="vi-du-thoi-trang-nu" oninput="this.dataset.manual='true'" />
        </div>
        <div class="form-group"><label>Mô tả</label><textarea name="description" class="form-control" rows="3">${sanitizeHTML(c.description || '')}</textarea></div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Modal.hide()">Hủy</button>
       <button class="btn btn-primary" onclick="AdminCategoriesPage.save(${isEdit ? c.id : 'null'})">${isEdit ? 'Cập nhật' : 'Tạo mới'}</button>`
    );
  },

  async save(id) {
    const form = document.getElementById('category-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    try {
      const name = form.name.value.trim();
      const slug = slugify(form.slug.value.trim() || name);
      if (!slug) {
        Toast.error('Slug danh mục không hợp lệ');
        return;
      }

      const data = {
        name,
        slug,
        description: form.description.value.trim()
      };

      if (id) {
        await Api.adminUpdateCategory(id, data);
      } else {
        await Api.adminCreateCategory(data);
      }
      Modal.hide();
      Toast.success(id ? 'Đã cập nhật' : 'Đã tạo danh mục');
      this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async delete(id) {
    Modal.confirm('Xóa danh mục', 'Bạn có chắc muốn xóa danh mục này? Các sản phẩm trong danh mục sẽ không còn danh mục.', async () => {
      try {
        await Api.adminDeleteCategory(id);
        Toast.success('Đã xóa');
        this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
