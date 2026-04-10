// ============================================================
// 3nav.js – Nav dùng chung, tự inject vào tất cả trang
// ============================================================
(function () {
  if (window.NO_NAV) return;
  if (document.body && (
    document.body.classList.contains('nv-body') ||
    document.body.classList.contains('admin-body')
  )) return;

  var NAV_HTML = `
<nav id="mainNav">
  <a class="logo" href="1trangchu.html" style="display:flex;align-items:center;gap:9px;text-decoration:none">
    <div style="width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg fill="#2d8a4e" height="34px" width="34px" viewBox="0 0 268.321 268.321" xmlns="http://www.w3.org/2000/svg">
        <path d="M259.342,39.744l0.159-0.154c9.298-9.305,9.598-24.138,0.668-33.07c-4.204-4.204-9.86-6.52-15.92-6.52c-6.421,0-12.514,2.553-17.152,7.188l-20.41,21.81l-73-21.854l-15.131,15.135c-1.907,1.902-2.956,4.437-2.956,7.131c0,2.696,1.049,5.227,2.956,7.129l0.664,0.664l52.728,29.018l-7.715,8.372c-10.226-6.622-21.62-11.498-33.85-14.282c-7.724-1.761-15.624-2.652-23.479-2.652c-3.963,0-7.874,0.238-11.734,0.664l-0.366-0.406c-0.172,0.154-0.366,0.328-0.555,0.505c-43.823,5.198-79.893,37.113-89.931,81.18c-6.252,27.427-1.446,55.647,13.528,79.458c14.974,23.809,38.329,40.362,65.758,46.609c7.724,1.761,15.625,2.652,23.479,2.652c49.415,0,91.602-33.689,102.589-81.927c1.962-8.606,2.833-17.291,2.643-25.89c0.6-2.204,0.496-4.607-0.436-7.224c-1.49-16.284-6.776-32.106-15.735-46.347c-1.089-1.73-2.235-3.415-3.415-5.061l7.832-7.219l29.254,53.151l0.67,0.668c1.905,1.898,4.435,2.945,7.122,2.945c2.687,0,5.211-1.045,7.12-2.947l15.14-15.137l-21.999-73.498L259.342,39.744z"/>
      </svg>
    </div>
    <div style="line-height:1;font-size:0.95rem;font-weight:800">
      <span style="color:#2d8a4e">Vietnam</span><span style="color:#1a1a1a">Travel</span>
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="1tourdulich.html">Tour Du Lịch</a></li>
    <li><a href="1uudai.html">Ưu đãi</a></li>
    <li id="navLichSu" style="display:none"><a href="1lichsu.html">Lịch sử tour</a></li>
    <li><a href="1vechungtoi.html">Về chúng tôi</a></li>
    <li id="navYeuThich" style="display:none"><a href="1canhan.html">Yêu thích</a></li>
  </ul>
  <div class="nav-cta">
    <div id="navGuest" style="display:none;align-items:center;gap:8px;">
      <button class="btn-login-nav nav-desktop-only" onclick="window.location.href='1dangnhap.html'">Đăng nhập</button>
      <button class="btn-register-nav nav-desktop-only" onclick="window.location.href='1dangky.html'">Đăng ký</button>
    </div>
    <div id="navUser" style="display:none;align-items:center;gap:10px;position:relative;">
      <button class="btn-register-nav nav-desktop-only" onclick="window.location.href='1tourdulich.html'">Bắt đầu đặt tour</button>
      <div class="nav-user-info" onclick="toggleUserMenu()">
        <div class="nav-avatar" id="navAvatarEl">U</div>
        <span class="nav-username" id="navUsernameEl"></span>
      </div>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          <div class="user-dropdown-name" id="dropName">—</div>
          <div class="user-dropdown-email" id="dropEmail">—</div>
        </div>
        <a class="user-dropdown-item" href="1canhan.html">👤 Hồ sơ cá nhân</a>
        <a class="user-dropdown-item" href="1lichsu.html">📋 Lịch sử đặt tour</a>
        <a class="user-dropdown-item" href="1canhan.html">❤️ Tour yêu thích</a>
        <a class="user-dropdown-item" id="adminMenuBtn" href="1admin.html" style="display:none">⚙️ Quản trị Admin</a>
        <a class="user-dropdown-item" id="staffMenuBtn" href="1nhanvien.html" style="display:none">🗂️ Quản lý đơn hàng</a>
        <a class="user-dropdown-item logout-item" onclick="doLogout()">🚪 Đăng xuất</a>
      </div>
    </div>
    <button class="nav-hamburger" id="navHamburger" onclick="toggleMobileMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="nav-mobile-menu" id="navMobileMenu">
  <a href="1tourdulich.html">Tour Du Lịch</a>
  <a href="1uudai.html">Ưu đãi</a>
  <a href="1vechungtoi.html">Về chúng tôi</a>
  <div class="nav-mobile-divider"></div>
  <div id="navMobileGuest">
    <a href="1dangnhap.html" class="nav-mobile-btn-outline">Đăng nhập</a>
    <a href="1dangky.html" class="nav-mobile-btn-green">Đăng ký</a>
  </div>
  <div id="navMobileUser" style="display:none">
    <a href="1tourdulich.html" class="nav-mobile-btn-green">Bắt đầu đặt tour</a>
    <a href="1lichsu.html">📋 Lịch sử tour</a>
    <a href="1canhan.html">❤️ Tour yêu thích</a>
    <a href="1canhan.html">👤 Hồ sơ cá nhân</a>
    <a onclick="doLogout()" style="color:#e55;cursor:pointer">🚪 Đăng xuất</a>
  </div>
</div>`;

  var styleTag = document.createElement('style');
  styleTag.textContent = `
    #navUser{position:relative;}
    .nav-cta{display:flex;align-items:center;gap:10px;}

    /* Hamburger */
    .nav-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;z-index:301;}
    .nav-hamburger span{display:block;width:22px;height:2px;background:var(--dark);border-radius:2px;transition:all .3s;}
    .nav-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
    .nav-hamburger.open span:nth-child(2){opacity:0;}
    .nav-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

    /* Mobile menu */
    .nav-mobile-menu{position:fixed;top:72px;left:0;right:0;background:white;z-index:299;padding:16px 5% 24px;box-shadow:0 8px 24px rgba(0,0,0,0.1);display:flex;flex-direction:column;gap:0;transform:translateY(-110%);opacity:0;transition:transform .3s ease,opacity .3s ease;pointer-events:none;}
    .nav-mobile-menu.open{transform:translateY(0);opacity:1;pointer-events:all;}
    .nav-mobile-menu a{padding:13px 0;font-size:1rem;font-weight:500;color:var(--dark);text-decoration:none;border-bottom:1px solid #f0f0f0;display:block;}
    .nav-mobile-menu a:hover{color:var(--green);}
    .nav-mobile-divider{height:1px;background:#eee;margin:8px 0;}
    .nav-mobile-btn-outline{border:1.5px solid var(--green) !important;color:var(--green) !important;border-radius:8px;padding:11px 0 !important;text-align:center;margin-top:4px;}
    .nav-mobile-btn-green{background:var(--green) !important;color:white !important;border-radius:8px;padding:11px 0 !important;text-align:center;margin-top:8px;}

    @media(max-width:768px){
      .nav-links{display:none !important;}
      .nav-desktop-only{display:none !important;}
      .nav-hamburger{display:flex !important;}
    }
  `;
  document.head.appendChild(styleTag);
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  document.body.style.paddingTop = '72px';

  // Active nav
  (function() {
    var path = window.location.pathname.split('/').pop() || '';
    var map = {
      '1tourdulich.html':'Tour Du Lịch','1halong.html':'Tour Du Lịch','1hoian.html':'Tour Du Lịch',
      '1sapa.html':'Tour Du Lịch','1hanoi.html':'Tour Du Lịch','1danang.html':'Tour Du Lịch',
      '1ninhbinh.html':'Tour Du Lịch','1mientay.html':'Tour Du Lịch','1dalat.html':'Tour Du Lịch',
      '1nhatrang.html':'Tour Du Lịch','1hue.html':'Tour Du Lịch','1phuquoc.html':'Tour Du Lịch',
      '1uudai.html':'Ưu đãi','1canhan.html':'Tour của tôi','1lichsu.html':'Tour của tôi',
      '1vechungtoi.html':'Về chúng tôi',
    };
    var active = map[path];
    if (active) {
      document.querySelectorAll('.nav-links a').forEach(function(a) {
        if (a.textContent.trim() === active) { a.style.color='#2d8a4e'; a.style.fontWeight='700'; }
      });
    }
  })();

  // Mobile menu toggle
  window.toggleMobileMenu = function() {
    var menu = document.getElementById('navMobileMenu');
    var btn  = document.getElementById('navHamburger');
    if (!menu) return;
    menu.classList.toggle('open');
    btn.classList.toggle('open');
  };
  // Close menu on outside click
  document.addEventListener('click', function(e) {
    var menu = document.getElementById('navMobileMenu');
    var btn  = document.getElementById('navHamburger');
    if (menu && menu.classList.contains('open') &&
        !menu.contains(e.target) && btn && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });

  setTimeout(function() {
    if (typeof initNav === 'function') initNav();
    // Sync mobile menu user state
    var u = typeof loadUser === 'function' ? loadUser() : null;
    var mg = document.getElementById('navMobileGuest');
    var mu = document.getElementById('navMobileUser');
    if (mg && mu) { mg.style.display = u ? 'none' : 'block'; mu.style.display = u ? 'block' : 'none'; }
    // Hiện nav links khi đã đăng nhập
    var lichSu   = document.getElementById('navLichSu');
    var yeuThich = document.getElementById('navYeuThich');
    if (u) {
      if (lichSu)   lichSu.style.display   = 'list-item';
      if (yeuThich) yeuThich.style.display = 'list-item';
      // Hiện tên user trên nav
      var usernameEl = document.getElementById('navUsernameEl');
      if (usernameEl) usernameEl.textContent = u.name ? u.name.split(' ').slice(-1)[0] : '';
      // Hiện staff menu
      var staffBtn = document.getElementById('staffMenuBtn');
      if (staffBtn && (u.role === 'staff' || u.role === 2)) staffBtn.style.display = 'block';
    }
  }, 0);

})();