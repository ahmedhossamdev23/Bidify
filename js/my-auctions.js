// js/my-auctions.js — LIVE COUNTDOWN WITH SECONDS (FIXED 2025)

let auctions = JSON.parse(localStorage.getItem("auctions")) || [];
let currentAuction = null;
let countdownInterval = null;

// Create end timestamp from minutes
function createEndTime(minutes) {
  return Date.now() + minutes * 60 * 1000;
}

// BEAUTIFUL LIVE COUNTDOWN – SECONDS ALWAYS VISIBLE
function formatTimeLeft(endTime) {
  const diff = endTime - Date.now();

  if (diff <= 0) {
    return '<span style="color:#ef4444;font-weight:bold">Auction Ended</span>';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0)    return `${days}d ${hours}h ${minutes}m left`;
  if (hours > 0)   return `${hours}h ${minutes}m ${seconds}s left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `<span style="color:#f59e0b;font-weight:bold">${seconds}s left</span>`;
}

// Live update every second
function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    document.querySelectorAll(".time-left").forEach(el => {
      const end = Number(el.dataset.end);
      el.innerHTML = formatTimeLeft(end);
    });
  }, 1000);
}

// Save to localStorage
function saveAuctions() {
  localStorage.setItem("auctions", JSON.stringify(auctions));
}

// Render all auctions
function renderAuctions() {
  const grid = document.getElementById("auctionGrid");
  grid.innerHTML = "";

  if (auctions.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <p>No auctions yet. Create your first one above!</p>
      </div>`;
    return;
  }

  auctions.forEach(auction => {
    const card = document.createElement("div");
    card.className = "auction-card";

    card.innerHTML = `
      <img src="${auction.image}" alt="${auction.title}">
      <div class="info">
        <h3>${auction.title}</h3>
        <p>${auction.description}</p>
        <p><strong>Category:</strong> ${auction.category}</p>
        <p><strong>Current Bid:</strong> $${auction.currentBid.toFixed(2)}</p>
        <p class="time-left" data-end="${auction.endTime}">${formatTimeLeft(auction.endTime)}</p>

        <div class="buttons">
          <button class="bid-btn">Bid Now</button>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      </div>
    `;

    // Button actions
    card.querySelector(".bid-btn").onclick = () => openBidModal(auction);
    card.querySelector(".edit-btn").onclick = () => editAuction(auction);
    card.querySelector(".delete-btn").onclick = () => deleteAuction(auction.id);

    grid.appendChild(card);
  });

  startCountdown(); // Restart timer on every render
}

// Modal
function openBidModal(auction) {
  currentAuction = auction;
  document.getElementById("modalTitle").textContent = auction.title;
  document.getElementById("modalImage").src = auction.image;
  document.getElementById("modalCurrentBid").textContent = "$" + auction.currentBid.toFixed(2);
  document.getElementById("modalTimer").innerHTML = formatTimeLeft(auction.endTime);
  document.getElementById("bidModal").style.display = "flex";
}

// Edit auction
function editAuction(auction) {
  const title = prompt("New title:", auction.title);
  const desc = prompt("New description:", auction.description);
  if (title !== null && desc !== null && title.trim() && desc.trim()) {
    auction.title = title.trim();
    auction.description = desc.trim();
    saveAuctions();
    renderAuctions();
  }
}

// Delete auction
function deleteAuction(id) {
  if (confirm("Delete this auction permanently?")) {
    auctions = auctions.filter(a => a.id !== id);
    saveAuctions();
    renderAuctions();
  }
}

// ADD NEW AUCTION
document.getElementById("addAuctionForm")?.addEventListener("submit", function(e) {
  e.preventDefault();

  const file = document.getElementById("auctionImageFile").files[0];
  if (!file) return alert("Please select an image!");

  const reader = new FileReader();
  reader.onload = function() {
    const minutes = parseInt(document.getElementById("timeLeft").value) || 10;

    const newAuction = {
      id: Date.now().toString(),
      title: document.getElementById("auctionTitle").value.trim(),
      description: document.getElementById("auctionDescription").value.trim(),
      category: document.getElementById("auctionCategory").value,
      currentBid: parseFloat(document.getElementById("startingBid").value) || 0,
      image: reader.result,
      endTime: createEndTime(minutes)
    };

    auctions.unshift(newAuction); // newest on top
    saveAuctions();
    renderAuctions();
    e.target.reset();
    alert("Auction created – live countdown started!");
  };

  reader.readAsDataURL(file);
});

// PLACE BID
document.getElementById("placeBidBtn")?.addEventListener("click", () => {
  const bid = parseFloat(document.getElementById("bidAmount").value);

  if (!bid || bid <= currentAuction.currentBid) {
    document.getElementById("bidMessage").textContent = "Bid must be higher than current!";
    document.getElementById("bidMessage").style.color = "#ef4444";
    return;
  }

  currentAuction.currentBid = bid;
  saveAuctions();
  renderAuctions();

  document.getElementById("bidMessage").textContent = `Success! New bid: $${bid.toFixed(2)}`;
  document.getElementById("bidMessage").style.color = "#10b981";
  document.getElementById("bidAmount").value = "";
});

// CLOSE MODAL
document.getElementById("closeModal")?.addEventListener("click", () => {
  document.getElementById("bidModal").style.display = "none";
});

document.getElementById("bidModal")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("bidModal")) {
    document.getElementById("bidModal").style.display = "none";
  }
});

// INIT
document.addEventListener("DOMContentLoaded", () => {
  renderAuctions();
});