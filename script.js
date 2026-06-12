// ===========================
// ===== HOTEL DATA =====
// ===========================

const ROOM_PRICES = { Single: 1500, Double: 2500, Suite: 5000, Deluxe: 3500 };

const DEFAULT_ROOMS = [
  { number: '101', type: 'Single',  price: 1500, status: 'available', guest: '' },
  { number: '102', type: 'Single',  price: 1500, status: 'available', guest: '' },
  { number: '103', type: 'Single',  price: 1500, status: 'available', guest: '' },
  { number: '201', type: 'Double',  price: 2500, status: 'available', guest: '' },
  { number: '202', type: 'Double',  price: 2500, status: 'available', guest: '' },
  { number: '203', type: 'Double',  price: 2500, status: 'available', guest: '' },
  { number: '301', type: 'Deluxe',  price: 3500, status: 'available', guest: '' },
  { number: '302', type: 'Deluxe',  price: 3500, status: 'available', guest: '' },
  { number: '303', type: 'Deluxe',  price: 3500, status: 'available', guest: '' },
  { number: '401', type: 'Suite',   price: 5000, status: 'available', guest: '' },
  { number: '402', type: 'Suite',   price: 5000, status: 'available', guest: '' },
  { number: '403', type: 'Suite',   price: 5000, status: 'available', guest: '' },
];

// ===== LOAD FROM STORAGE =====
let rooms    = JSON.parse(localStorage.getItem('hotel_rooms'))    || DEFAULT_ROOMS;
let bookings = JSON.parse(localStorage.getItem('hotel_bookings')) || [];

// ===== SAVE TO STORAGE =====
function save() {
  localStorage.setItem('hotel_rooms',    JSON.stringify(rooms));
  localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
}

// ===========================
// ===== NAVIGATION =====
// ===========================

function showPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');

  document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (page === 'home')       renderHome();
  if (page === 'rooms')      renderRooms();
  if (page === 'mybookings') renderBookings();
  if (page === 'admin')      renderAdmin();
  if (page === 'booking') {
    setMinDates();
    document.getElementById('booking-error').style.display   = 'none';
    document.getElementById('booking-success').style.display = 'none';
    document.getElementById('price-summary').style.display   = 'none';
  }
}

// ===========================
// ===== HOME PAGE =====
// ===========================

function renderHome() {
  const available = rooms.filter(r => r.status === 'available').length;
  const booked    = rooms.filter(r => r.status === 'booked').length;

  document.getElementById('stat-total').textContent     = rooms.length;
  document.getElementById('stat-available').textContent = available;
  document.getElementById('stat-booked').textContent    = booked;
  document.getElementById('stat-bookings').textContent  = bookings.length;
}

// ===========================
// ===== ROOMS PAGE =====
// ===========================

function renderRooms() {
  const typeFilter   = document.getElementById('filter-type').value;
  const statusFilter = document.getElementById('filter-status').value;

  let filtered = rooms;
  if (typeFilter   !== 'all') filtered = filtered.filter(r => r.type === typeFilter);
  if (statusFilter !== 'all') filtered = filtered.filter(r => r.status === statusFilter);

  const grid = document.getElementById('rooms-grid');
  grid.innerHTML = filtered.map(room => `
    <div class="room-card ${room.status}">
      <div class="room-number">Room ${room.number}</div>
      <div class="room-type">${room.type}</div>
      <div class="room-price">₹${room.price.toLocaleString('en-IN')} / night</div>
      <span class="room-status ${room.status}">${room.status === 'available' ? '✅ Available' : '🔴 Booked'}</span>
      ${room.guest ? `<div class="room-guest">👤 ${room.guest}</div>` : ''}
    </div>
  `).join('');
}

// ===========================
// ===== BOOKING PAGE =====
// ===========================

function setMinDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkin').min  = today;
  document.getElementById('checkout').min = today;
  document.getElementById('checkin').value  = '';
  document.getElementById('checkout').value = '';
}

function updateAvailableRooms() {
  const type = document.getElementById('book-room-type').value;
  const sel  = document.getElementById('book-room-number');

  if (!type) { sel.innerHTML = '<option value="">Choose type first</option>'; return; }

  const available = rooms.filter(r => r.type === type && r.status === 'available');

  if (available.length === 0) {
    sel.innerHTML = '<option value="">No rooms available</option>';
  } else {
    sel.innerHTML = available.map(r =>
      `<option value="${r.number}">Room ${r.number}</option>`
    ).join('');
  }

  updatePrice();
}

function updatePrice() {
  const type     = document.getElementById('book-room-type').value;
  const roomNum  = document.getElementById('book-room-number').value;
  const checkin  = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const summary  = document.getElementById('price-summary');

  if (!type || !roomNum || !checkin || !checkout) { summary.style.display = 'none'; return; }

  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) { summary.style.display = 'none'; return; }

  const price = ROOM_PRICES[type];
  const total = price * nights;

  document.getElementById('sum-type').textContent    = type;
  document.getElementById('sum-room').textContent    = 'Room ' + roomNum;
  document.getElementById('sum-checkin').textContent = formatDate(checkin);
  document.getElementById('sum-checkout').textContent= formatDate(checkout);
  document.getElementById('sum-nights').textContent  = nights + (nights === 1 ? ' night' : ' nights');
  document.getElementById('sum-total').textContent   = '₹' + total.toLocaleString('en-IN');

  summary.style.display = 'block';
}

function bookRoom() {
  const name     = document.getElementById('guest-name').value.trim();
  const phone    = document.getElementById('guest-phone').value.trim();
  const email    = document.getElementById('guest-email').value.trim();
  const type     = document.getElementById('book-room-type').value;
  const roomNum  = document.getElementById('book-room-number').value;
  const checkin  = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const guests   = document.getElementById('num-guests').value;

  const errEl = document.getElementById('booking-error');
  const sucEl = document.getElementById('booking-success');
  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  // Validation
  if (!name)    { showError(errEl, 'Please enter guest name.'); return; }
  if (!phone || phone.length < 10) { showError(errEl, 'Please enter a valid 10-digit phone number.'); return; }
  if (!email)   { showError(errEl, 'Please enter email address.'); return; }
  if (!type)    { showError(errEl, 'Please select a room type.'); return; }
  if (!roomNum) { showError(errEl, 'Please select a room.'); return; }
  if (!checkin) { showError(errEl, 'Please select check-in date.'); return; }
  if (!checkout){ showError(errEl, 'Please select check-out date.'); return; }

  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) { showError(errEl, 'Check-out must be after check-in.'); return; }

  const price = ROOM_PRICES[type];
  const total = price * nights;
  const bookingId = 'BK' + Date.now().toString().slice(-6);

  // Mark room as booked
  const room = rooms.find(r => r.number === roomNum);
  room.status = 'booked';
  room.guest  = name;

  // Save booking
  bookings.push({ id: bookingId, name, phone, email, type, roomNum, checkin, checkout, nights, guests, total, bookedAt: new Date().toISOString() });
  save();

  // Show success
  sucEl.textContent   = `✅ Booking confirmed! ID: ${bookingId} | Room ${roomNum} | ₹${total.toLocaleString('en-IN')}`;
  sucEl.style.display = 'block';

  // Reset form
  document.getElementById('guest-name').value  = '';
  document.getElementById('guest-phone').value = '';
  document.getElementById('guest-email').value = '';
  document.getElementById('book-room-type').value   = '';
  document.getElementById('book-room-number').innerHTML = '<option value="">Choose type first</option>';
  document.getElementById('checkin').value  = '';
  document.getElementById('checkout').value = '';
  document.getElementById('price-summary').style.display = 'none';
}

// ===========================
// ===== MY BOOKINGS =====
// ===========================

function renderBookings() {
  const list = document.getElementById('bookings-list');

  if (bookings.length === 0) {
    list.innerHTML = '<p class="no-bookings">No bookings yet. Book a room to get started! 🏨</p>';
    return;
  }

  const sorted = [...bookings].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

  list.innerHTML = sorted.map(b => `
    <div class="booking-card">
      <div class="booking-info">
        <h3>👤 ${b.name} — Room ${b.roomNum} (${b.type})</h3>
        <p>📅 Check-in: ${formatDate(b.checkin)} → Check-out: ${formatDate(b.checkout)} (${b.nights} night${b.nights > 1 ? 's' : ''})</p>
        <p>📞 ${b.phone} &nbsp;|&nbsp; ✉️ ${b.email} &nbsp;|&nbsp; 👥 ${b.guests} guest${b.guests > 1 ? 's' : ''}</p>
        <div class="booking-id">Booking ID: ${b.id} | Booked on: ${formatDateTime(b.bookedAt)}</div>
      </div>
      <div>
        <div class="booking-amount">₹${b.total.toLocaleString('en-IN')}<span>Total Amount</span></div>
        <button class="btn btn-danger" style="margin-top:10px; width:100%;" onclick="cancelBooking('${b.id}')">Cancel</button>
      </div>
    </div>
  `).join('');
}

function cancelBooking(id) {
  if (!confirm('Cancel this booking?')) return;
  const booking = bookings.find(b => b.id === id);
  if (!booking) return;

  // Free up the room
  const room = rooms.find(r => r.number === booking.roomNum);
  if (room) { room.status = 'available'; room.guest = ''; }

  bookings = bookings.filter(b => b.id !== id);
  save();
  renderBookings();
}

function clearBookings() {
  if (bookings.length === 0) return;
  if (!confirm('Clear ALL bookings and free all rooms?')) return;
  bookings = [];
  rooms.forEach(r => { r.status = 'available'; r.guest = ''; });
  save();
  renderBookings();
}

// ===========================
// ===== ADMIN PAGE =====
// ===========================

function renderAdmin() {
  const available = rooms.filter(r => r.status === 'available').length;
  const booked    = rooms.filter(r => r.status === 'booked').length;
  const revenue   = bookings.reduce((sum, b) => sum + b.total, 0);

  document.getElementById('admin-total-rooms').textContent = rooms.length;
  document.getElementById('admin-available').textContent   = available;
  document.getElementById('admin-booked').textContent      = booked;
  document.getElementById('admin-revenue').textContent     = '₹' + revenue.toLocaleString('en-IN');

  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = rooms.map(room => {
    const booking = bookings.find(b => b.roomNum === room.number);
    return `
      <tr>
        <td><strong>Room ${room.number}</strong></td>
        <td>${room.type}</td>
        <td>₹${room.price.toLocaleString('en-IN')}</td>
        <td><span class="badge ${room.status === 'available' ? 'badge-available' : 'badge-booked'}">${room.status}</span></td>
        <td>${room.guest || '—'}</td>
        <td>
          ${room.status === 'booked'
            ? `<button class="btn btn-success" onclick="checkoutRoom('${room.number}')">Checkout</button>`
            : `<span style="color:#bbb; font-size:0.82rem;">Vacant</span>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

function checkoutRoom(roomNum) {
  if (!confirm(`Checkout Room ${roomNum}?`)) return;
  const room = rooms.find(r => r.number === roomNum);
  if (!room) return;
  room.status = 'available';
  room.guest  = '';
  bookings = bookings.filter(b => b.roomNum !== roomNum);
  save();
  renderAdmin();
}

// ===========================
// ===== HELPERS =====
// ===========================

function showError(el, msg) {
  el.textContent   = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ===== INIT =====
renderHome();
