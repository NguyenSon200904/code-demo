// ============================================================
// 3booking.js – Booking Modal (kết nối API)
// ============================================================

var currentTour  = '';
var currentPrice = 0;
var currentTourId = '';

function openBookingModal(tourName, price, tourId) {
  // Kiểm tra đăng nhập
  var u = null;
  try { u = JSON.parse(localStorage.getItem('vt_user')); } catch(e) {}
  if (!u) {
    if (typeof showToast === 'function') showToast('⚠️ Vui lòng đăng nhập để đặt tour');
    setTimeout(function(){ window.location.href = '1dangnhap.html'; }, 1200);
    return;
  }

  currentTour    = tourName || '';
  currentPrice   = parseInt((price || '0').replace(/[^\d]/g,'')) || 0;
  currentTourId  = tourId || '';

  document.getElementById('modalTourName').textContent  = currentTour;
  document.getElementById('modalTourPrice').textContent = price || '—';
  document.getElementById('sumTour').textContent        = currentTour;
  document.getElementById('sumPrice').textContent       = price || '—';

  // Inject loại đặt tour nếu chưa có
  if (!document.getElementById('bookingTypeWrap')) {
    var typeWrap = document.createElement('div');
    typeWrap.id = 'bookingTypeWrap';
    typeWrap.style.cssText = 'margin-bottom:16px';
    typeWrap.innerHTML = '<label style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;display:block;margin-bottom:8px">Loại đặt tour</label>' +
      '<div style="display:flex;gap:10px">' +
        '<label id="typePersonalBtn" onclick="switchBookingType(\'personal\')" style="flex:1;border:1.5px solid #2d8a4e;border-radius:9px;padding:10px;cursor:pointer;text-align:center;background:#e8f5ee;transition:all .2s">' +
          '<div style="font-size:1.1rem">🧑</div>' +
          '<div style="font-size:0.78rem;font-weight:700;color:#2d8a4e;margin-top:4px">Cá nhân</div>' +
          '<div style="font-size:0.68rem;color:#aaa">1–4 người</div>' +
        '</label>' +
        '<label id="typeGroupBtn" onclick="switchBookingType(\'group\')" style="flex:1;border:1.5px solid #e8e8e8;border-radius:9px;padding:10px;cursor:pointer;text-align:center;background:#fff;transition:all .2s">' +
          '<div style="font-size:1.1rem">👨‍👩‍👧‍👦</div>' +
          '<div style="font-size:0.78rem;font-weight:700;color:#555;margin-top:4px">Nhóm</div>' +
          '<div style="font-size:0.68rem;color:#aaa">5–20 người</div>' +
        '</label>' +
      '</div>';
    var priceRow = document.querySelector('.modal-price-row');
    if (priceRow) priceRow.parentNode.insertBefore(typeWrap, priceRow);
  }

  // Inject em bé nếu chưa có
  if (!document.getElementById('mBabiesWrap')) {
    var kidsField = document.getElementById('mKids')?.closest('.modal-field');
    if (kidsField) {
      var babiesField = document.createElement('div');
      babiesField.className = 'modal-field';
      babiesField.id = 'mBabiesWrap';
      babiesField.innerHTML = '<label>Em bé <span style="font-size:0.68rem;color:#aaa">(0–2 tuổi, miễn phí)</span></label>' +
        '<select id="mBabies" onchange="updateModalSummary()">' +
          '<option value="0" selected>Không có</option>' +
          '<option value="1">1 em bé</option>' +
          '<option value="2">2 em bé</option>' +
          '<option value="3">3 em bé</option>' +
        '</select>';
      kidsField.parentNode.insertBefore(babiesField, kidsField.nextSibling);
    }
  }

  // Mặc định cá nhân
  switchBookingType('personal');

  // Auto-fill thông tin user
  if (u) {
    if (document.getElementById('mName'))  document.getElementById('mName').value  = u.name  || '';
    if (document.getElementById('mPhone')) document.getElementById('mPhone').value = u.phone || '';
    if (document.getElementById('mEmail')) document.getElementById('mEmail').value = u.email || '';
  }

  // Set ngày tối thiểu
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('mDate')) document.getElementById('mDate').min = today;

  updateModalSummary();
  goStep(1);
  document.getElementById('bookingOverlay').classList.add('open');
  document.getElementById('bookingModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  document.getElementById('bookingOverlay').classList.remove('open');
  document.getElementById('bookingModal').classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalSummary() {
  const adults  = parseInt(document.getElementById('mAdults')?.value)  || 2;
  const kids    = parseInt(document.getElementById('mKids')?.value)    || 0;
  const babies  = parseInt(document.getElementById('mBabies')?.value)  || 0;
  const total   = currentPrice * adults + Math.floor(currentPrice * 0.7) * kids;
  // babies miễn phí
  const people  = adults + ' người lớn' + (kids > 0 ? ', ' + kids + ' trẻ em' : '');

  if (document.getElementById('sumPeople')) document.getElementById('sumPeople').textContent = people;
  if (document.getElementById('sumTotal'))  document.getElementById('sumTotal').textContent  = total.toLocaleString('vi-VN') + 'đ';
  if (document.getElementById('sumTotal2')) document.getElementById('sumTotal2').textContent = total.toLocaleString('vi-VN') + 'đ';
}

function selectPayment(el, method) {
  document.querySelectorAll('.pay-method').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
  const bankInfo = document.getElementById('bankInfo');
  if (bankInfo) bankInfo.style.display = method === 'bank' ? 'block' : 'none';
}

function goStep(n) {
  [1,2,3].forEach(i => {
    const body = document.getElementById('modalStep' + i);
    const dot  = document.getElementById('step' + i + '-dot');
    if (body) body.style.display = (i === n) ? 'block' : 'none';
    if (dot)  { dot.classList.toggle('active', i === n); dot.classList.toggle('done', i < n); }
  });
  if (n === 3) doConfirmBooking();
}

async function doConfirmBooking() {
  const name    = document.getElementById('mName')?.value   || '';
  const phone   = document.getElementById('mPhone')?.value  || '';
  const email   = document.getElementById('mEmail')?.value  || '';
  const date    = document.getElementById('mDate')?.value   || '';
  const adults  = parseInt(document.getElementById('mAdults')?.value) || 2;
  const kids    = parseInt(document.getElementById('mKids')?.value)   || 0;
  const payment = document.querySelector('.pay-method.active input')?.value || 'bank';
  const note    = document.getElementById('mNote')?.value   || '';

  const totalAmt  = currentPrice * adults + Math.floor(currentPrice * 0.7) * kids;
  const totalStr  = totalAmt.toLocaleString('vi-VN') + 'đ';
  const guestStr  = adults + ' người lớn' + (kids > 0 ? ', ' + kids + ' trẻ em' : '');
  const code      = 'VNT-' + Math.floor(10000 + Math.random() * 90000);
  const methodMap = { bank:'Chuyển khoản', card:'Thẻ tín dụng', momo:'MoMo', vnpay:'VNPay', cod:'Tiền mặt' };

  // Hiện mã booking
  if (document.getElementById('bookingCode'))  document.getElementById('bookingCode').textContent  = code;
  if (document.getElementById('confirmEmail')) document.getElementById('confirmEmail').textContent = email;

  // Lưu booking vào localStorage (luôn làm để hiện lịch sử)
  const u = loadUser();
  if (u) {
    const key      = 'vt_bookings_' + u.email;
    const bookings = JSON.parse(localStorage.getItem(key) || '[]');
    bookings.unshift({
      code, tourName: currentTour, date, guests: guestStr,
      total: totalStr, payment: methodMap[payment] || payment,
      status: 'upcoming', bg: 'linear-gradient(135deg,#2d8a4e,#3aaa62)',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(bookings));
  }

  // Gọi API tạo booking (nếu có backend)
  try {
    if (currentTourId) {
      const payMethod = payment === 'momo' ? 1 : 2; // 1=momo, 2=vnpay
      const res = await apiCreateBooking({
        schedule_id: currentTourId,
        passengers: { adults, children: kids, babies: parseInt(document.getElementById('mBabies')?.value)||0 },
        payment_method: payMethod,
        contact_info: { full_name: name, phone, email },
        note
      });
      if (res && res.ok && res.data.result) {
        const { booking, payment_url } = res.data.result;
        // Có payment_url → redirect thanh toán
        if (payment_url) {
          setTimeout(function(){ window.location.href = payment_url; }, 1500);
          return;
        }
      }
    }
  } catch(e) { /* tiếp tục với local flow */ }

  // Redirect trang thành công sau 1.5s
  setTimeout(function() {
    closeBookingModal();
    window.location.href = '1thanhcong.html?code=' + code +
      '&tour=' + encodeURIComponent(currentTour) +
      '&date=' + encodeURIComponent(date) +
      '&guests=' + encodeURIComponent(guestStr) +
      '&total=' + encodeURIComponent(totalStr);
  }, 1500);
}


// ===== LOẠI ĐẶT TOUR =====
var _bookingType = 'personal';

function switchBookingType(type) {
  _bookingType = type;
  var pBtn = document.getElementById('typePersonalBtn');
  var gBtn = document.getElementById('typeGroupBtn');
  var adultsSelect = document.getElementById('mAdults');
  if (!pBtn || !gBtn || !adultsSelect) return;

  var kidsField   = document.getElementById('mKids')?.closest('.modal-field');
  var babiesField = document.getElementById('mBabiesWrap');
  var adultsLabel = adultsSelect.closest('.modal-field')?.querySelector('label');

  if (type === 'personal') {
    pBtn.style.borderColor = '#2d8a4e'; pBtn.style.background = '#e8f5ee';
    pBtn.querySelector('div:nth-child(2)').style.color = '#2d8a4e';
    gBtn.style.borderColor = '#e8e8e8'; gBtn.style.background = '#fff';
    gBtn.querySelector('div:nth-child(2)').style.color = '#555';
    // Options 1-4
    adultsSelect.innerHTML = '<option value="1">1 người lớn</option><option value="2" selected>2 người lớn</option><option value="3">3 người lớn</option><option value="4">4 người lớn</option>';
    if (adultsLabel) adultsLabel.textContent = 'Số người lớn';
    // Hiện trẻ em & em bé
    if (kidsField)   kidsField.style.display   = '';
    if (babiesField) babiesField.style.display = '';
  } else {
    gBtn.style.borderColor = '#2d8a4e'; gBtn.style.background = '#e8f5ee';
    gBtn.querySelector('div:nth-child(2)').style.color = '#2d8a4e';
    pBtn.style.borderColor = '#e8e8e8'; pBtn.style.background = '#fff';
    pBtn.querySelector('div:nth-child(2)').style.color = '#555';
    // Options 5-20
    var opts = '';
    for (var i = 5; i <= 20; i++) opts += '<option value="' + i + '"' + (i===5?' selected':'') + '>' + i + ' người</option>';
    adultsSelect.innerHTML = opts;
    if (adultsLabel) adultsLabel.textContent = 'Tổng số người trong nhóm';
    // Ẩn trẻ em & em bé (nhóm tính chung)
    if (kidsField)   kidsField.style.display   = 'none';
    if (babiesField) babiesField.style.display = 'none';
    // Reset về 0
    var kidsEl = document.getElementById('mKids');
    var babiesEl = document.getElementById('mBabies');
    if (kidsEl)   kidsEl.value   = '0';
    if (babiesEl) babiesEl.value = '0';
  }
  updateModalSummary();
}