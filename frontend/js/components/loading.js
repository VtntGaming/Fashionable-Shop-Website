// ===== Loading Component =====

function renderLoading() {
  return `
    <div class="loading-page">
      <div class="spinner"></div>
      <span>Đang tải...</span>
    </div>
  `;
}

function renderSkeletonGrid(count = 8) {
  let html = '<div class="grid grid-4 gap-2">';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="card">
        <div class="skeleton" style="aspect-ratio:3/4"></div>
        <div style="padding:16px">
          <div class="skeleton" style="height:14px;width:60%;margin-bottom:8px"></div>
          <div class="skeleton" style="height:18px;width:80%;margin-bottom:8px"></div>
          <div class="skeleton" style="height:14px;width:40%"></div>
        </div>
      </div>
    `;
  }
  html += '</div>';
  return html;
}
