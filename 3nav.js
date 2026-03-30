// ============================================================
// 3nav.js – Nav dùng chung, tự inject vào tất cả trang
// ============================================================
(function () {
  // Không inject nav vào trang có layout riêng
  if (window.NO_NAV) return;
  if (document.body && (
    document.body.classList.contains('nv-body') ||
    document.body.classList.contains('admin-body')
  )) return;

  var NAV_HTML = `
<nav id="mainNav">
  <a class="logo" href="1trangchu.html" style="display:flex;align-items:center;gap:9px;text-decoration:none">
    <div style="width:34px;height:34px;background:#e8f5ee;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d8a4e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </div>
    <div style="line-height:1;font-size:0.95rem;font-weight:800">
      <span style="color:#2d8a4e">Vietnam</span><span style="color:#1a1a1a">Travel</span>
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="1tourdulich.html">Tour Du Lịch</a></li>
    <li><a href="1uudai.html">Ưu đãi</a></li>
    <li><a href="1canhan.html">Tour của tôi</a></li>
    <li><a href="1vechungtoi.html">Về chúng tôi</a></li>
  </ul>
  <div class="nav-cta">
    <!-- Chưa đăng nhập -->
    <div id="navGuest" style="display:none;align-items:center;gap:8px;">
      <button class="btn-login-nav" onclick="window.location.href='1dangnhap.html'">Đăng nhập</button>
      <button class="btn-register-nav" onclick="window.location.href='1dangky.html'">Đăng ký</button>
    </div>
    <!-- Đã đăng nhập -->
    <div id="navUser" style="display:none;align-items:center;gap:10px;position:relative;">
      <button class="btn-register-nav" onclick="window.location.href='1tourdulich.html'">Bắt đầu đặt tour</button>
      <div class="nav-user-info" onclick="toggleUserMenu()">
        <div class="nav-avatar" id="navAvatarEl">U</div>
      </div>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          <div class="user-dropdown-name" id="dropName">—</div>
          <div class="user-dropdown-email" id="dropEmail">—</div>
        </div>
        <a class="user-dropdown-item" href="1canhan.html">👤 Hồ sơ cá nhân</a>
        <a class="user-dropdown-item" href="1trangchu.html">🏠 Trang chủ</a>
        <a class="user-dropdown-item" id="adminMenuBtn" href="1admin.html" style="display:none">⚙️ Quản trị Admin</a>
        <a class="user-dropdown-item logout-item" onclick="doLogout()">🚪 Đăng xuất</a>
      </div>
    </div>
  </div>
</nav>`;

  // Thêm style cho navUser và guest avatar
  var styleTag = document.createElement('style');
  styleTag.textContent = `
    #navUser{position:relative;}
    .nav-avatar-guest{width:36px;height:36px;border-radius:50%;border:1.5px solid #ddd;background:#f5f5f5;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#888;transition:border-color .2s,color .2s;}
    .nav-avatar-guest:hover{border-color:var(--green);color:var(--green);}
    .nav-cta{display:flex;align-items:center;gap:10px;}
  `;
  document.head.appendChild(styleTag);
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  // Thêm padding-top cho body để tránh bị nav che
  document.body.style.paddingTop = '82px';

  // Active nav theo trang hiện tại
  (function() {
    var path = window.location.pathname.split('/').pop() || '';
    var map = {
      '1tourdulich.html': 'Tour Du Lịch',
      '1halong.html':     'Tour Du Lịch',
      '1hoian.html':      'Tour Du Lịch',
      '1sapa.html':       'Tour Du Lịch',
      '1hanoi.html':      'Tour Du Lịch',
      '1danang.html':     'Tour Du Lịch',
      '1ninhbinh.html':   'Tour Du Lịch',
      '1mientay.html':    'Tour Du Lịch',
      '1dalat.html':      'Tour Du Lịch',
      '1nhatrang.html':   'Tour Du Lịch',
      '1hue.html':        'Tour Du Lịch',
      '1phuquoc.html':    'Tour Du Lịch',
      '1uudai.html':      'Ưu đãi',
      '1canhan.html':     'Tour của tôi',
      '1vechungtoi.html': 'Về chúng tôi',
    };
    var active = map[path];
    if (active) {
      document.querySelectorAll('.nav-links a').forEach(function(a) {
        if (a.textContent.trim() === active) {
          a.style.color = '#2d8a4e';
          a.style.fontWeight = '700';
        }
      });
    }
  })();

  // 3data.js load sau sẽ tự gọi initNav()
  // Dùng setTimeout để chắc chắn 3data.js đã sẵn sàng
  setTimeout(function() {
    if (typeof initNav === 'function') initNav();
  }, 0);

})();