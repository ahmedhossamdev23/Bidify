// ========================================
//        BIDIFY – MAIN.JS (FINAL FIXED)
// ========================================

const auctions = [
  { id:1, title:"iPhone 15 Pro Max", image:"https://www.dxomark.com/wp-content/uploads/medias/post-155689/Apple-iPhone-15-Pro-Max_-blue-titanium_featured-image-packshot-review.jpg", currentBid:850, category:"electronics", endTime: Date.now() + 2*60*60*1000 },
  { id:2, title:"Original Picasso Sketch", image:"https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500", currentBid:12500, category:"art", endTime: Date.now() + 24*60*60*1000 },
  { id:3, title:"Rolex Submariner 2024", image:"https://regalhattongarden.co.uk/cdn/shop/files/IMG_1115.heic?v=1709907590&width=550", currentBid:9800, category:"fashion", endTime: Date.now() + 5*60*60*1000 },
  { id:4, title:"Tesla Model S Plaid", image:"https://images.unsplash.com/photo-1617788138017-80ad4b48a8c8?w=500", currentBid:75000, category:"vehicles", endTime: Date.now() + 48*60*60*1000 },
  { id:5, title:"MacBook Pro M3 Max", image:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", currentBid:2100, category:"electronics", endTime: Date.now() + 3*60*60*1000 },
  { id:6, title:"Vintage Wine Collection", image:"https://images.unsplash.com/photo-1516594915695-74f1b4bb1c83?w=500", currentBid:3200, category:"art", endTime: Date.now() + 12*60*60*1000 },
];

// DOM Elements
const auctionGrid = document.getElementById('auctionGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modal = document.getElementById('bidModal');
const darkModeToggle = document.getElementById('darkModeToggle');

let currentAuction = null;

// Format time left
function formatTimeLeft(ms) {
  if (ms <= 0) return "Auction Ended";

  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);

  // Always show HH:MM:SS format with leading zeros
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");

  return `${hh}:${mm}:${ss} left`;
}


// Update all countdown timers
function updateTimers() {
  document.querySelectorAll('.time-left').forEach(el => {
    const diff = Number(el.dataset.end) - Date.now();
    el.textContent = formatTimeLeft(diff);
    if (diff <= 0) el.style.color = "#e91e63";
  });
  requestAnimationFrame(updateTimers); // smoother than setTimeout
}

// Render Auctions
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
        <button class="btn-primary" data-id="${item.id}" ${isEnded ? 'disabled' : ''}>
          ${isEnded ? 'Ended' : 'Bid Now'}
        </button>
      </div>
    `;
    auctionGrid.appendChild(card);
  });

  attachBidButtons();
  attachWatchlistButtons();
}

// Open Modal – ONLY when user clicks
function openModal(id) {
  currentAuction = auctions.find(a => a.id == id);
  if (!currentAuction || currentAuction.endTime <= Date.now()) return;

  document.getElementById('modalTitle').textContent = currentAuction.title;
  document.getElementById('modalImage').src = currentAuction.image;
  document.getElementById('modalCurrentBid').textContent = '$' + currentAuction.currentBid.toLocaleString();

  // Modal timer
  const timerEl = document.getElementById('modalTimer');
  const updateTimer = () => {
    const diff = currentAuction.endTime - Date.now();
    if (diff <= 0) {
      timerEl.textContent = "AUCTION ENDED";
      timerEl.style.color = "#e91e63";
      document.getElementById('placeBidBtn').disabled = true;
      return;
    }
    timerEl.textContent = formatTimeLeft(diff);
  };
  updateTimer();
  const interval = setInterval(updateTimer, 1000);

  modal.style.display = 'flex';

  // Clean up on close
  const closeModal = () => {
    modal.style.display = 'none';
    clearInterval(interval);
  };
  modal.querySelector('.close').onclick = closeModal;
}

// Attach bid buttons safely
function attachBidButtons() {
  document.querySelectorAll('.btn-primary:not([disabled])').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openModal(btn.dataset.id);
    };
  });
}

// Watchlist
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

// Place Bid
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

  // Update all cards instantly
  renderAuctions(getFilteredAuctions());
};

// Close modal on background click
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
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

// Dark Mode with persistence
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('bidify_darkmode', isDark);
});

// Load saved preference
if (localStorage.getItem('bidify_darkmode') === 'true') {
  document.body.classList.add('dark');
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Header scroll blur
window.addEventListener('scroll', () => {
  document.querySelector('.header').classList.toggle('scrolled', window.scrollY > 50);
});

// INITIALIZE – NO MODAL ON LOAD
renderAuctions(auctions);
updateTimers(); // starts the live countdown  