/**
 * UniFind - UI Components & Helpers
 * Card renderer, Skeleton loader, Distance calculator, Toast notifications
 */

const Components = {
  // SVG Icon mappings
  getCategoryIcon(iconKey) {
    const icons = {
      sparkles: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
      laptop: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
      "credit-card": `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
      key: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
      briefcase: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      "book-open": `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      shirt: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
      "cup-soda": `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 8 1.75 12.28A2 2 0 0 0 9.73 22h4.54a2 2 0 0 0 1.98-1.72L18 8"/><line x1="5" y1="8" x2="19" y2="8"/></svg>`,
      "help-circle": `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    };
    return icons[iconKey] || icons["help-circle"];
  },

  // Relative Time Formatter (e.g., "3 hours ago", "2 days ago")
  formatRelativeTime(isoDateStr) {
    try {
      const date = new Date(isoDateStr);
      const now = new Date();
      const diffSecs = Math.floor((now - date) / 1000);

      if (isNaN(diffSecs)) return "Recently";
      if (diffSecs < 60) return "Just now";
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      if (diffSecs < 604800) {
        const days = Math.floor(diffSecs / 86400);
        return days === 1 ? "Yesterday" : `${days} days ago`;
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  },

  // Proximity & Distance Calculation between user current spot and item location
  calculateProximity(userLocId, itemLocationName) {
    const userLoc = CAMPUS_LOCATIONS.find(l => l.id === userLocId) || CAMPUS_LOCATIONS[0];
    const itemLoc = CAMPUS_LOCATIONS.find(l => l.name.toLowerCase() === (itemLocationName || "").toLowerCase()) 
      || CAMPUS_LOCATIONS.find(l => (itemLocationName || "").toLowerCase().includes(l.zone.toLowerCase()))
      || { x: userLoc.x + 150, y: userLoc.y + 120 };

    // Euclidean distance in campus grid coordinates (1 unit approx 2.5 meters)
    const dx = userLoc.x - itemLoc.x;
    const dy = userLoc.y - itemLoc.y;
    const distanceMeters = Math.round(Math.sqrt(dx * dx + dy * dy) * 2.8);

    if (distanceMeters < 50) {
      return {
        meters: distanceMeters,
        milesText: "Right here",
        timeText: "Current Building",
        rawMiles: 0.01
      };
    }

    const miles = (distanceMeters * 0.000621371).toFixed(1);
    const minutes = Math.max(1, Math.round(distanceMeters / 80)); // 80 m/min avg campus walk

    return {
      meters: distanceMeters,
      milesText: `${miles} mi away`,
      timeText: `${minutes} min walk`,
      rawMiles: parseFloat(miles)
    };
  },

  // Generate Skeleton Loading Cards
  renderSkeletonCard() {
    return `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-media skeleton-shimmer"></div>
        <div class="skeleton-body">
          <div class="skeleton-line title skeleton-shimmer"></div>
          <div class="skeleton-line text-lg skeleton-shimmer"></div>
          <div class="skeleton-line text-md skeleton-shimmer"></div>
        </div>
        <div class="skeleton-footer">
          <div class="skeleton-btn skeleton-shimmer"></div>
          <div class="skeleton-btn skeleton-shimmer" style="max-width: 90px;"></div>
        </div>
      </div>
    `;
  },

  // Render Single Item Card
  renderItemCard(item, currentUserLocationId) {
    const proximity = this.calculateProximity(currentUserLocationId, item.location);
    const relativeTime = this.formatRelativeTime(item.date);
    const categoryObj = CATEGORIES.find(c => c.id === item.category) || { name: item.category, icon: "help-circle" };
    const categoryIconSvg = this.getCategoryIcon(categoryObj.icon);

    const isClaimed = item.status === "claimed";
    const statusText = item.status.toUpperCase();

    // Safe fallback image if network fails
    const safeImage = item.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

    return `
      <article class="item-card" data-id="${item.id}" data-status="${item.status}" data-category="${item.category}">
        <!-- Media & Badges Header -->
        <div class="card-media">
          <img 
            class="card-img" 
            src="${safeImage}" 
            alt="${this.escapeHtml(item.title)}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';"
          >
          <div class="card-status-badge ${item.status}">
            <span class="status-dot-pulse"></span>
            ${statusText}
          </div>
          <div class="card-category-badge">
            ${categoryIconSvg}
            <span>${categoryObj.name.split(' ')[0]}</span>
          </div>
          <div class="card-proximity-badge" title="Estimated distance from your selected campus location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${proximity.milesText} &bull; ${proximity.timeText}</span>
          </div>
        </div>

        <!-- Body Content -->
        <div class="card-body">
          <h3 class="card-title" title="${this.escapeHtml(item.title)}">${this.escapeHtml(item.title)}</h3>
          <p class="card-desc">${this.escapeHtml(item.description)}</p>

          <div class="card-meta-list">
            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span><strong>${this.escapeHtml(item.location)}</strong> ${item.locationDetail ? `(${this.escapeHtml(item.locationDetail)})` : ''}</span>
            </div>

            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Reported <strong>${relativeTime}</strong></span>
            </div>

            ${item.reward ? `
              <div class="card-meta-item" style="color:var(--accent-amber); font-weight:700;">
                <span style="font-size:0.95rem;">🍕</span>
                <span>Treat Offered: <strong>${this.escapeHtml(item.reward)}</strong></span>
              </div>
            ` : ''}
          </div>

          <!-- Card Footer Actions -->
          <div class="card-footer">
            ${isClaimed ? `
              <button class="btn-card-claim claimed" disabled>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Reunited &bull; Claimed</span>
              </button>
            ` : `
              <button class="btn-card-claim primary" onclick="App.openClaimModal('${item.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>${item.status === 'lost' ? "I Found This" : "Claim Item"}</span>
              </button>
            `}
            <button class="btn-card-detail" onclick="App.openDetailModal('${item.id}')" title="View complete details">
              <span>Details</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  },

  // Toast Notification System
  showToast(message, type = "info", duration = 3500) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === "success") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent-emerald);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === "warn") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent-amber);"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary-600);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${this.escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 350);
    }, duration);
  },

  // Escape HTML to prevent XSS
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

window.Components = Components;
