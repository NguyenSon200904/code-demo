// ============================================================
// 3recommend.js – Engine cá nhân hóa VietnamTravel
// Dựa trên: lịch sử xem, booking đã đặt, tour yêu thích
// ============================================================

var REC_KEYS = {
  views:     'vt_rec_views',    // { tourTitle: { count, tags, lastSeen } }
  scores:    'vt_rec_scores',   // { tag: score }
};

// ============================================================
// TRACK – Ghi nhận hành vi người dùng
// ============================================================

// Gọi khi user vào trang chi tiết tour
function recTrackView(tourTitle) {
  var tour = _recFindTour(tourTitle);
  if (!tour) return;

  var views = _recLoad(REC_KEYS.views);
  if (!views[tourTitle]) views[tourTitle] = { count: 0, tags: tour.tags || [], lastSeen: 0 };
  views[tourTitle].count++;
  views[tourTitle].lastSeen = Date.now();
  _recSave(REC_KEYS.views, views);

  _recUpdateScores(tour.tags || [], 3); // xem = +3 điểm mỗi tag
}

// Gọi khi user đặt tour thành công
function recTrackBooking(tourTitle) {
  var tour = _recFindTour(tourTitle);
  if (!tour) return;
  _recUpdateScores(tour.tags || [], 10); // đặt = +10 điểm
}

// Gọi khi user thêm/bỏ yêu thích
function recTrackFavourite(tourTitle, isAdding) {
  var tour = _recFindTour(tourTitle);
  if (!tour) return;
  _recUpdateScores(tour.tags || [], isAdding ? 5 : -2); // yêu thích = +5, bỏ = -2
}

// ============================================================
// SCORE – Tính điểm và lấy gợi ý
// ============================================================

// Trả về mảng tour được gợi ý, sắp xếp theo điểm
function recGetTours(limit, excludeTitle) {
  limit = limit || 4;
  var scores  = _recLoad(REC_KEYS.scores);
  var views   = _recLoad(REC_KEYS.views);
  var u       = typeof loadUser === 'function' ? loadUser() : null;

  // Lấy tags từ yêu thích
  var favTags = [];
  try {
    var favKey  = u ? 'vt_fav_' + u.email : 'vt_fav';
    var favList = JSON.parse(localStorage.getItem(favKey) || '[]');
    favList.forEach(function(f) {
      var t = _recFindTour(f.title);
      if (t && t.tags) favTags = favTags.concat(t.tags);
    });
  } catch(e) {}

  // Lấy tags từ booking
  var bookingTags = [];
  try {
    if (u && u.email) {
      var bk = JSON.parse(localStorage.getItem('vt_bookings_' + u.email) || '[]');
      bk.forEach(function(b) {
        var t = _recFindTour(b.tourName);
        if (t && t.tags) bookingTags = bookingTags.concat(t.tags);
      });
    }
  } catch(e) {}

  // Tính điểm tổng hợp cho mỗi tour
  var allTours = typeof getActiveTours === 'function' ? getActiveTours() : [];
  var scored = allTours.map(function(tour) {
    if (tour.title === excludeTitle) return null;
    var score = 0;
    var tags  = tour.tags || [];

    // Điểm từ lịch sử view
    tags.forEach(function(tag) { score += (scores[tag] || 0); });

    // Điểm thêm từ yêu thích
    favTags.forEach(function(tag) { if (tags.indexOf(tag) !== -1) score += 4; });

    // Điểm thêm từ booking
    bookingTags.forEach(function(tag) { if (tags.indexOf(tag) !== -1) score += 6; });

    // Boost tour chưa xem
    if (!views[tour.title]) score += 2;

    // Boost tour được đánh giá cao
    if (tour.stars && tour.stars.indexOf('★★★★★') !== -1) score += 1;

    return { tour: tour, score: score };
  }).filter(Boolean);

  // Nếu không có dữ liệu hành vi, fallback tour phổ biến
  var hasData = Object.keys(scores).length > 0 || favTags.length > 0 || bookingTags.length > 0;
  if (!hasData) {
    // Trả về tour ngẫu nhiên theo ratings
    return allTours
      .filter(function(t) { return t.title !== excludeTitle; })
      .sort(function() { return Math.random() - 0.5; })
      .slice(0, limit);
  }

  scored.sort(function(a, b) { return b.score - a.score; });
  return scored.slice(0, limit).map(function(s) { return s.tour; });
}

// ============================================================
// RENDER – Hiển thị gợi ý
// ============================================================

// Render section gợi ý vào container có id `gridId`
function recRender(gridId, excludeTitle, limit) {
  var grid = document.getElementById(gridId);
  if (!grid) return;
  var tours = recGetTours(limit || 4, excludeTitle);
  if (!tours.length) return;
  if (typeof renderTours === 'function') {
    renderTours(tours, gridId);
  }
}

// Render nhãn lý do gợi ý
function recGetReason() {
  var scores  = _recLoad(REC_KEYS.scores);
  var u       = typeof loadUser === 'function' ? loadUser() : null;

  var hasBooking = false;
  var hasFav     = false;
  var hasView    = Object.keys(_recLoad(REC_KEYS.views)).length > 0;

  try {
    if (u && u.email) {
      var bk = JSON.parse(localStorage.getItem('vt_bookings_' + u.email) || '[]');
      hasBooking = bk.length > 0;
    }
    var favKey = u ? 'vt_fav_' + u.email : 'vt_fav';
    var fav = JSON.parse(localStorage.getItem(favKey) || '[]');
    hasFav = fav.length > 0;
  } catch(e) {}

  if (hasBooking) return 'Dựa trên các chuyến đi bạn đã đặt';
  if (hasFav)     return 'Dựa trên tour yêu thích của bạn';
  if (hasView)    return 'Dựa trên lịch sử xem của bạn';
  return 'Tour phổ biến dành cho bạn';
}

// ============================================================
// INJECT – Thêm section gợi ý vào trang
// ============================================================

// Thêm section "Dành riêng cho bạn" vào trang chủ (sau tourSection)
function recInjectHomepage() {
  var u = typeof loadUser === 'function' ? loadUser() : null;
  var tours = recGetTours(4);
  if (!tours.length) return;

  var existing = document.getElementById('recSection');
  if (existing) {
    existing.style.display = 'block';
    recRender('recGrid');
    var sub = document.getElementById('recSubtitle');
    if (sub) sub.textContent = recGetReason();
    return;
  }

  var section = document.createElement('section');
  section.id = 'recSection';
  section.innerHTML = [
    '<div class="section-header">',
      '<div>',
        '<div class="section-tag">Chỉ dành cho bạn</div>',
        '<h2 class="section-title">✨ Gợi Ý Cá Nhân</h2>',
        '<p class="tours-desc" id="recSubtitle">' + recGetReason() + '</p>',
      '</div>',
      '<a class="view-all" href="1tourdulich.html">Xem tất cả →</a>',
    '</div>',
    '<div class="tours-grid" id="recGrid"></div>'
  ].join('');

  var tourSection = document.getElementById('tourSection');
  if (tourSection && tourSection.parentNode) {
    tourSection.parentNode.insertBefore(section, tourSection);
  }

  recRender('recGrid');
}

// Thêm section "Bạn có thể thích" vào trang chi tiết tour
function recInjectDetailPage(currentTourTitle) {
  if (document.getElementById('recDetailSection')) return;

  var tours = recGetTours(4, currentTourTitle);
  if (!tours.length) return;

  var section = document.createElement('section');
  section.id = 'recDetailSection';
  section.style.cssText = 'padding:48px 5%;border-top:1px solid #f0f0f0;';
  section.innerHTML = [
    '<div class="section-header" style="margin-bottom:28px">',
      '<div>',
        '<div class="section-tag">Khám phá thêm</div>',
        '<h2 class="section-title">Bạn Có Thể Thích</h2>',
      '</div>',
    '</div>',
    '<div class="tours-grid" id="recDetailGrid"></div>'
  ].join('');

  // Chèn trước footer
  var footer = document.querySelector('footer');
  if (footer) footer.parentNode.insertBefore(section, footer);

  recRender('recDetailGrid', currentTourTitle, 4);
}

// Thêm section gợi ý vào trang hồ sơ cá nhân
function recInjectProfile() {
  var u = typeof loadUser === 'function' ? loadUser() : null;
  if (!u) return;

  var tours = recGetTours(3);
  if (!tours.length) return;

  if (document.getElementById('recProfileSection')) return;

  var section = document.createElement('div');
  section.id = 'recProfileSection';
  section.className = 'cp-card';
  section.style.marginTop = '20px';
  section.innerHTML = [
    '<div class="cp-card-header">',
      '<h2>✨ Gợi Ý Cho Bạn</h2>',
      '<p id="recProfileSubtitle">' + recGetReason() + '</p>',
    '</div>',
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:16px" id="recProfileGrid"></div>'
  ].join('');

  // Chèn vào tab info
  var tabInfo = document.getElementById('tab-info');
  if (tabInfo) tabInfo.appendChild(section);

  recRender('recProfileGrid', null, 3);
}

// ============================================================
// UTILS
// ============================================================

function _recFindTour(title) {
  if (!title) return null;
  var all = typeof getActiveTours === 'function' ? getActiveTours() : [];
  return all.find(function(t) { return t.title === title; }) || null;
}

function _recUpdateScores(tags, delta) {
  var scores = _recLoad(REC_KEYS.scores);
  tags.forEach(function(tag) {
    scores[tag] = (scores[tag] || 0) + delta;
    if (scores[tag] < 0) scores[tag] = 0; // không âm
  });
  _recSave(REC_KEYS.scores, scores);
}

function _recLoad(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { return {}; }
}

function _recSave(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
}

// Reset dữ liệu cá nhân hóa
function recReset() {
  Object.values(REC_KEYS).forEach(function(k) { localStorage.removeItem(k); });
}

// Debug – xem điểm hiện tại
function recDebug() {
  console.table(_recLoad(REC_KEYS.scores));
  console.log('Views:', _recLoad(REC_KEYS.views));
}