// ========================================
//        BIDIFY – MAIN.JS (ULTIMATE FINAL 2025)
// ========================================

const auctions = [
  { id:1, title:"iPhone 15 Pro Max", image:"https://www.dxomark.com/wp-content/uploads/medias/post-155689/Apple-iPhone-15-Pro-Max_-blue-titanium_featured-image-packshot-review.jpg", currentBid:850, category:"electronics", endTime: Date.now() + 2*60*60*1000 },
  { id:2, title:"Original Picasso Sketch", image:"https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500", currentBid:12500, category:"art", endTime: Date.now() + 24*60*60*1000 },
  { id:3, title:"Rolex Submariner 2024", image:"https://regalhattongarden.co.uk/cdn/shop/files/IMG_1115.heic?v=1709907590&width=550", currentBid:9800, category:"fashion", endTime: Date.now() + 5*60*60*1000 },
  { id:4, title:"Tesla Model S Plaid", image:"https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/22264050/Screen_Shot_2021_01_27_at_3.26.14_PM.png?quality=90&strip=all&crop=11.306818181818%2C0%2C77.386363636364%2C100&w=2400", currentBid:75000, category:"vehicles", endTime: Date.now() + 48*60*60*1000 },
  { id:5, title:"MacBook Pro M3 Max", image:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", currentBid:2100, category:"electronics", endTime: Date.now() + 3*60*60*1000 },
  { id:6, title:"Vintage Wine Collection", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD3zfHUFMzRxwYonoG8Ci2aTOdUQor7Al_NQ&s", currentBid:3200, category:"art", endTime: Date.now() + 12*60*60*1000 },
];

// DOM Elements
const auctionGrid = document.getElementById('auctionGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modal = document.getElementById('bidModal');
const darkModeToggle = document.getElementById('darkModeToggle');

let currentAuction = null;
let modalTimerInterval = null;

// Format time as 01:23:45 left
function formatTimeLeft(ms) {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} left`;
}

// Live countdown timers on all cards
function updateTimers() {
  document.querySelectorAll('.time-left').forEach(el => {
    const diff = Number(el.dataset.end) - Date.now();
    if (diff <= 0) {
      el.textContent = "Auction Ended";
      el.style.color = "#e91e63";
    } else {
      el.textContent = formatTimeLeft(diff);
    }
  });
  requestAnimationFrame(updateTimers);
}

// Render auction cards
function renderAuctions(items) {
  auctionGrid.innerHTML = '';
  items.forEach(item => {
    const isEnded = item.endTime <= Date.now();
    const card = document.createElement('div');
    card.className = 'auction-card';
    card.innerHTML = `
      <button class="watchlist-btn" data-id="${item.id}"><i class="far fa-heart"></i></button>
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="auction-info">
        <h3>${item.title}</h3>
        <p class="current-bid">$${item.currentBid.toLocaleString()}</p>
        <p class="time-left" data-end="${item.endTime}">Calculating...</p>
        <button class="btn-primary bid-btn" data-id="${item.id}" ${isEnded ? 'disabled' : ''}>
          ${isEnded ? 'Ended' : 'Bid Now'}
        </button>
      </div>
    `;
    auctionGrid.appendChild(card);
  });
  attachBidButtons();
  attachWatchlistButtons();
}

// Open modal with smooth animation
function openModal(id) {
  currentAuction = auctions.find(a => a.id == id);
  if (!currentAuction || currentAuction.endTime <= Date.now()) return;

  document.getElementById('modalTitle').textContent = currentAuction.title;
  document.getElementById('modalImage').src = currentAuction.image;
  document.getElementById('modalCurrentBid').textContent = '$' + currentAuction.currentBid.toLocaleString();
  document.getElementById('bidAmount').value = '';
  document.getElementById('bidMessage').textContent = '';

  const timerEl = document.getElementById('modalTimer');
  const updateTimer = () => {
    const diff = currentAuction.endTime - Date.now();
    if (diff <= 0) {
      timerEl.textContent = "AUCTION ENDED";
      timerEl.style.color = "#e91e63";
      document.getElementById('placeBidBtn').disabled = true;
      clearInterval(modalTimerInterval);
    } else {
      timerEl.textContent = formatTimeLeft(diff);
    }
  };
  updateTimer();
  modalTimerInterval = setInterval(updateTimer, 1000);

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

// Close modal smoothly
function closeModal() {
  modal.classList.remove('open');
  clearInterval(modalTimerInterval);
  setTimeout(() => { modal.style.display = 'none'; }, 450);
}

// Attach event listeners
function attachBidButtons() {
  document.querySelectorAll('.bid-btn:not([disabled])').forEach(btn => {
    btn.onclick = () => openModal(btn.dataset.id);
  });
}

function attachWatchlistButtons() {
  document.querySelectorAll('.watchlist-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
      btn.innerHTML = btn.classList.contains('active')
        ? '<i class="fas fa-heart"></i>'
        : '<i class="far fa-heart"></i>';
    };
  });
}

// Place bid
document.getElementById('placeBidBtn').onclick = () => {
  const input = document.getElementById('bidAmount');
  const bid = parseInt(input.value);
  const msg = document.getElementById('bidMessage');

  if (!bid || bid <= currentAuction.currentBid) {
    msg.style.color = '#e91e63';
    msg.textContent = 'Bid must be higher than current price!';
    return;
  }

  currentAuction.currentBid = bid;
  msg.style.color = '#10b981';
  msg.textContent = `Success! New bid: $${bid.toLocaleString()}`;
  input.value = '';

  renderAuctions(getFilteredAuctions());
  document.getElementById('modalCurrentBid').textContent = '$' + bid.toLocaleString();
};

// Close modal
document.querySelector('.close').onclick = closeModal;
window.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// Search & Filter
function getFilteredAuctions() {
  const query = searchInput.value.toLowerCase();
  const cat = categoryFilter.value;
  return auctions.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(query);
    const matchesCat = cat === 'all' || a.category === cat;
    return matchesSearch && matchesCat;
  });
}

searchInput.addEventListener('input', () => renderAuctions(getFilteredAuctions()));
categoryFilter.addEventListener('change', () => renderAuctions(getFilteredAuctions()));

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('bidify_darkmode', isDark);
});

// Load saved dark mode
if (localStorage.getItem('bidify_darkmode') === 'true') {
  document.body.classList.add('dark');
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Header scroll effect
window.addEventListener('scroll', () => {
  document.querySelector('.header').classList.toggle('scrolled', window.scrollY > 50);
});

// Initialize
renderAuctions(auctions);
updateTimers();