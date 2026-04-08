// ===== Admin Products =====

const AdminProductsPage = {
  _page: 0,
  _keyword: '',
  _categoryId: '',

  async render(container) {
    container.innerHTML = renderLoading();
    try {
      const [categories] = await Promise.all([Api.getCategories()]);
      this._categories = categories;
      await this._loadProducts(container);
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  async _loadProducts(container) {
    const data = await Api.adminGetProducts({ page: this._page, size: Config.ADMIN_ITEMS_PER_PAGE || 10, keyword: this._keyword, categoryId: this._categoryId });
    const products = data.content || data || [];
    const totalPages = data.totalPages || 1;

    container.innerHTML = `
      <div class="flex items-center justify-between" style="margin-bottom:24px">
        <h1>Quản lý sản phẩm</h1>
        <button class="btn btn-primary" onclick="AdminProductsPage.showForm()"><i class="fas fa-plus"></i> Thêm mới</button>
      </div>
      <div class="admin-toolbar">
        <input type="text" class="form-control" placeholder="Tìm kiếm..." value="${sanitizeHTML(this._keyword)}" oninput="AdminProductsPage.search(this.value)" style="max-width:300px" />
        <select class="form-control" onchange="AdminProductsPage.filterCategory(this.value)" style="max-width:200px">
          <option value="">Tất cả danh mục</option>
          ${(this._categories || []).map(c => `<option value="${c.id}" ${this._categoryId == c.id ? 'selected' : ''}>${sanitizeHTML(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead><tr><th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${products.length === 0 ? '<tr><td colspan="7" class="text-center text-muted">Không có sản phẩm</td></tr>' :
              products.map(p => `
                <tr>
                  <td><div style="width:50px;height:50px;border-radius:8px;overflow:hidden;background:var(--bg)">${p.imageUrl ? `<img src="${getImageUrl(p.imageUrl)}" style="width:100%;height:100%;object-fit:cover" />` : ''}</div></td>
                  <td><strong>${sanitizeHTML(p.name)}</strong></td>
                  <td>${sanitizeHTML(p.categoryName || '')}</td>
                  <td>${p.salePrice ? `<s class="text-muted">${formatCurrency(p.price)}</s><br>${formatCurrency(p.salePrice)}` : formatCurrency(p.price)}</td>
                  <td>${p.stock}</td>
                  <td><span class="status-badge ${p.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}">${p.status === 'ACTIVE' ? 'Hoạt động' : 'Ẩn'}</span></td>
                  <td class="admin-actions">
                    <button class="btn-action btn-edit" onclick="AdminProductsPage.showForm(${p.id})" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" onclick="AdminProductsPage.delete(${p.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
      <div id="admin-products-pagination"></div>
    `;
    if (totalPages > 1) {
      document.getElementById('admin-products-pagination').innerHTML = renderPagination(this._page + 1, totalPages, (pg) => {
        this._page = pg - 1;
        this._loadProducts(container);
      });
    }
  },

  search: debounce(function(val) {
    AdminProductsPage._keyword = val;
    AdminProductsPage._page = 0;
    AdminProductsPage._loadProducts(document.querySelector('.admin-content') || document.getElementById('main-content'));
  }, 400),

  filterCategory(val) {
    this._categoryId = val;
    this._page = 0;
    this._loadProducts(document.querySelector('.admin-content') || document.getElementById('main-content'));
  },

  async showForm(id) {
    let product = { name: '', slug: '', description: '', price: '', salePrice: '', stock: '', categoryId: '', status: 'ACTIVE' };
    if (id) {
      try { product = await Api.getProduct(id); } catch (_) {}
    }
    const cats = this._categories || [];
    Modal.show(
      id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm',
      `<form id="product-form">
        <div class="form-group">
          <label>Tên sản phẩm *</label>
          <input type="text" name="name" class="form-control" value="${sanitizeHTML(product.name)}" required
            oninput="const slugField = document.querySelector('#product-form [name=slug]'); if (slugField && !slugField.dataset.manual) slugField.value = slugify(this.value);" />
        </div>
        <div class="form-group">
          <label>Slug *</label>
          <input type="text" name="slug" class="form-control" value="${sanitizeHTML(product.slug || slugify(product.name || ''))}" required
            placeholder="ao-so-mi-nam" oninput="this.dataset.manual='true'" />
        </div>
        <div class="form-group"><label>Mô tả</label><textarea name="description" class="form-control" rows="3">${sanitizeHTML(product.description || '')}</textarea></div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Giá *</label><input type="number" name="price" class="form-control" value="${product.price || ''}" required min="0" /></div>
          <div class="form-group" style="flex:1"><label>Giá giảm</label><input type="number" name="salePrice" class="form-control" value="${product.salePrice || ''}" min="0" /></div>
        </div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Kho *</label><input type="number" name="stock" class="form-control" value="${product.stock || 0}" required min="0" /></div>
          <div class="form-group" style="flex:1"><label>Danh mục *</label>
            <select name="categoryId" class="form-control" required>
              <option value="">-- Chọn --</option>
              ${cats.map(c => `<option value="${c.id}" ${product.categoryId == c.id ? 'selected' : ''}>${sanitizeHTML(c.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label>Ảnh sản phẩm</label><input type="file" name="image" accept="image/*" class="form-control" /></div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Modal.hide()">Hủy</button>
       <button class="btn btn-primary" onclick="AdminProductsPage.saveProduct(${id || 'null'})">${id ? 'Cập nhật' : 'Tạo mới'}</button>`
    );
  },

  async saveProduct(id) {
    const form = document.getElementById('product-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    try {
      const name = form.name.value.trim();
      const slug = slugify(form.slug.value.trim() || name);
      if (!slug) {
        Toast.error('Slug sản phẩm không hợp lệ');
        return;
      }

      const payload = {
        name,
        slug,
        description: form.description.value.trim(),
        price: parseFloat(form.price.value),
        salePrice: form.salePrice.value ? parseFloat(form.salePrice.value) : null,
        stock: parseInt(form.stock.value, 10),
        categoryId: parseInt(form.categoryId.value, 10)
      };
      let result;
      if (id) {
        result = await Api.adminUpdateProduct(id, payload);
      } else {
        result = await Api.adminCreateProduct(payload);
      }

      const productId = result?.id || id;
      const imageFile = form.image.files[0];
      if (imageFile && productId) {
        const uploadResult = await Api.uploadProductImage(productId, imageFile);
        if (uploadResult?.fileUrl) {
          await Api.adminUpdateProduct(productId, { imageUrl: uploadResult.fileUrl });
        }
      }

      Modal.hide();
      Toast.success(id ? 'Đã cập nhật' : 'Đã tạo sản phẩm');
      this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async delete(id) {
    Modal.confirm('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này?', async () => {
      try {
        await Api.adminDeleteProduct(id);
        Toast.success('Đã xóa');
        this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
