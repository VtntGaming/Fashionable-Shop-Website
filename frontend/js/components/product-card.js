// ===== Product Card Component =====

function renderProductCard(product) {
  const effectivePrice = product.salePrice || product.effectivePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const imageUrl = getImageUrl(product.imageUrl || (product.images && product.images[0]));

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card-image">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${sanitizeHTML(product.name)}" loading="lazy" onerror="this.style.display='none'" />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:.2"><i class="fas fa-tshirt"></i></div>`
        }
        ${hasDiscount ? `<span class="product-card-sale">-${discountPercent}%</span>` : ''}
        <div class="product-card-overlay">
          <button onclick="event.stopPropagation(); addToCartQuick(${product.id})" title="Thêm vào giỏ">
            <i class="fas fa-shopping-bag"></i>
          </button>
          <button onclick="event.stopPropagation(); Router.navigate('/product/${product.slug || product.id}')" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-card-body">
        ${product.categoryName ? `<span class="product-card-category">${sanitizeHTML(product.categoryName)}</span>` : ''}
        <h3 class="product-card-name">
          <a href="#/product/${product.slug || product.id}" data-link>${sanitizeHTML(product.name)}</a>
        </h3>
        <div class="product-card-rating">
          <span class="stars">${generateStars(product.averageRating || 0)}</span>
          <span class="count">(${product.reviewCount || 0})</span>
        </div>
        <div class="product-card-price">
          <span class="current">${formatCurrency(effectivePrice)}</span>
          ${hasDiscount ? `<span class="original">${formatCurrency(product.price)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

async function addToCartQuick(productId) {
  if (!Store.isAuthenticated()) {
    Toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
    Router.navigate('/login');
    return;
  }
  try {
    const cart = await Api.addToCart(productId, 1);
    Store.setCart(cart);
    Toast.success('Đã thêm vào giỏ hàng');
    Header.render();
  } catch (err) {
    Toast.error(err.message);
  }
}
