/**
 * UniFind - Core Application Controller
 * State management, debounced search, filtering, sorting, modals & persistence
 */

const App = {
  // State
  items: [],
  filteredItems: [],
  activeFilters: {
    search: "",
    status: "all", // "all" | "lost" | "found" | "claimed"
    category: "all",
    location: "all",
    sortBy: "newest" // "newest" | "oldest" | "nearest" | "title"
  },
  currentUserLocation: "sjt", // Silver Jubilee Tower (SJT) by default
  currentlyViewingItemId: null,
  currentlyClaimingItemId: null,
  debounceTimer: null,
  isLoading: false,

  // App Initialization
  init() {
    this.initTheme();
    this.loadData();
    this.populateLocationSelectors();
    this.renderCategoryChips();
    this.setupEventListeners();
    FormValidator.init();

    // Initial render with brief realistic skeleton loading state
    this.applyFilters(true);
    this.updateStats();
  },

  // Theme Management (Dark / Light)
  initTheme() {
    const savedTheme = localStorage.getItem("vitfind_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeIcons(savedTheme);

    const toggleBtn = document.getElementById("themeToggleBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("vitfind_theme", newTheme);
        this.updateThemeIcons(newTheme);
        Components.showToast(`Switched to ${newTheme} mode`, "info", 2000);
      });
    }
  },

  updateThemeIcons(theme) {
    const sunIcon = document.getElementById("themeIconSun");
    const moonIcon = document.getElementById("themeIconMoon");
    if (sunIcon && moonIcon) {
      if (theme === "dark") {
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
      } else {
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
      }
    }
  },

  // Load Data from LocalStorage or Fallback to INITIAL_ITEMS
  loadData() {
    const stored = localStorage.getItem("vitfind_items_v5");
    if (stored) {
      try {
        this.items = JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored items, loading initial data:", e);
        this.items = [...INITIAL_ITEMS];
      }
    } else {
      this.items = [...INITIAL_ITEMS];
      this.saveData();
    }
  },

  // Save Data to LocalStorage
  saveData() {
    try {
      localStorage.setItem("vitfind_items_v5", JSON.stringify(this.items));
    } catch (e) {
      console.warn("Storage quota exceeded or unavailable:", e);
    }
  },

  // Populate Location Dropdowns in header and filter bar with clean optgroups
  populateLocationSelectors() {
    const userLocSelect = document.getElementById("userLocationSelect");
    const filterLocSelect = document.getElementById("filterLocationSelect");

    const ZONES_ORDER = [
      "Academic Block",
      "Central Campus",
      "Hangout",
      "Food",
      "Stationary",
      "Men's Hostels (MH)",
      "Ladies' Hostels (LH)"
    ];

    const buildGroupedOptions = (includeAll = false, selectedVal = null, useId = false) => {
      let html = includeAll ? '<option value="all">All Campus Locations</option>' : '';
      ZONES_ORDER.forEach(zone => {
        const matchingLocs = CAMPUS_LOCATIONS.filter(l => (l.zones && l.zones.includes(zone)) || l.zone === zone);
        if (matchingLocs.length > 0) {
          html += `<optgroup label="${zone}">`;
          matchingLocs.forEach(loc => {
            const val = useId ? loc.id : loc.name;
            const isSelected = val === selectedVal ? 'selected' : '';
            html += `<option value="${val}" ${isSelected}>${loc.name}</option>`;
          });
          html += `</optgroup>`;
        }
      });
      return html;
    };

    if (userLocSelect && typeof CAMPUS_LOCATIONS !== "undefined") {
      userLocSelect.innerHTML = buildGroupedOptions(false, this.currentUserLocation, true);

      userLocSelect.addEventListener("change", (e) => {
        this.currentUserLocation = e.target.value;
        const locObj = CAMPUS_LOCATIONS.find(l => l.id === this.currentUserLocation);
        Components.showToast(`Current spot set to ${locObj.name}. Proximity updated!`, "info");
        this.applyFilters(false);
      });
    }

    if (filterLocSelect && typeof CAMPUS_LOCATIONS !== "undefined") {
      filterLocSelect.innerHTML = buildGroupedOptions(true, this.activeFilters.location, false);

      filterLocSelect.addEventListener("change", (e) => {
        this.activeFilters.location = e.target.value;
        this.applyFilters();
      });
    }
  },

  // Render Horizontal Category Chips
  renderCategoryChips() {
    const wrap = document.getElementById("categoryChipsWrap");
    if (!wrap || typeof CATEGORIES === "undefined") return;

    wrap.innerHTML = CATEGORIES.map(cat => {
      const icon = Components.getCategoryIcon(cat.icon);
      const isActive = this.activeFilters.category === cat.id;
      return `
        <button 
          class="category-chip ${isActive ? 'active' : ''}" 
          data-category="${cat.id}"
          type="button"
          aria-pressed="${isActive}"
        >
          ${icon}
          <span>${cat.name}</span>
        </button>
      `;
    }).join('');

    wrap.querySelectorAll(".category-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const catId = btn.dataset.category;
        this.activeFilters.category = catId;

        wrap.querySelectorAll(".category-chip").forEach(b => {
          const active = b.dataset.category === catId;
          b.classList.toggle("active", active);
          b.setAttribute("aria-pressed", active);
        });

        this.applyFilters();
      });
    });
  },

  // Global Event Listeners (Debounced Search, Shortcuts, Tabs, Sort, Modals)
  setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    const searchClearBtn = document.getElementById("searchClearBtn");
    const searchSpinner = document.getElementById("searchSpinner");
    const sortBySelect = document.getElementById("sortBySelect");
    const statusTabs = document.querySelectorAll(".status-segmented-control .segment-btn");

    // 1. Debounced Search (Brownie Point)
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value;
        
        // Toggle Clear button visibility
        if (searchClearBtn) {
          searchClearBtn.classList.toggle("visible", query.length > 0);
        }

        // Show spinner while debouncing
        if (searchSpinner) searchSpinner.classList.add("active");

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.activeFilters.search = query.trim().toLowerCase();
          if (searchSpinner) searchSpinner.classList.remove("active");
          this.applyFilters();
        }, 300); // 300ms debounce
      });

      // Clear search button
      if (searchClearBtn) {
        searchClearBtn.addEventListener("click", () => {
          searchInput.value = "";
          searchClearBtn.classList.remove("visible");
          this.activeFilters.search = "";
          this.applyFilters();
          searchInput.focus();
        });
      }
    }

    // Keyboard shortcut: '/' to focus search input
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === "Escape") {
        this.closeAllModals();
      }
    });

    // 2. Status Segmented Tabs
    statusTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        statusTabs.forEach(t => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        this.activeFilters.status = tab.dataset.status;
        this.applyFilters();
      });
    });

    // 3. Sort Select
    if (sortBySelect) {
      sortBySelect.addEventListener("change", (e) => {
        this.activeFilters.sortBy = e.target.value;
        this.applyFilters(false); // No skeleton needed for instant reorder
      });
    }

    // 4. Modal Triggers
    document.getElementById("openPostModalBtn").addEventListener("click", () => this.openPostModal());
    document.getElementById("closePostModalBtn").addEventListener("click", () => this.closePostModal());
    document.getElementById("closeClaimModalBtn").addEventListener("click", () => this.closeClaimModal());
    document.getElementById("closeDetailModalBtn").addEventListener("click", () => this.closeDetailModal());

    // Close modal on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          this.closeAllModals();
        }
      });
    });

    // Reset filters buttons
    document.getElementById("resetAllFiltersBtn").addEventListener("click", () => this.resetFilters());
    document.getElementById("emptyStateResetBtn").addEventListener("click", () => this.resetFilters());

    // Reset Mock Data Button
    document.getElementById("resetMockDataBtn").addEventListener("click", () => {
      if (confirm("Reset to default campus sample items? Any custom posted items will be cleared.")) {
        this.items = [...INITIAL_ITEMS];
        this.saveData();
        this.resetFilters();
        Components.showToast("Sample campus dataset restored!", "success");
      }
    });

    // Scroll to Top
    document.getElementById("scrollToTopBtn").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Brand click scrolls to top and resets filters
    document.getElementById("brandHomeBtn").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.resetFilters();
    });
  },

  // Apply Filters, Debounced Search, and Proximity Sorting
  applyFilters(showSkeleton = false) {
    const grid = document.getElementById("itemsGrid");
    const emptyState = document.getElementById("emptyState");
    const resultsCountEl = document.getElementById("resultsCount");

    // Brownie Point: Skeleton loading state
    if (showSkeleton) {
      grid.innerHTML = Array(6).fill(0).map(() => Components.renderSkeletonCard()).join('');
      emptyState.style.display = "none";
    }

    const executeFilter = () => {
      const { search, status, category, location, sortBy } = this.activeFilters;

      let results = this.items.filter(item => {
        // Status filter
        if (status !== "all" && item.status !== status) {
          return false;
        }

        // Category filter
        if (category !== "all" && item.category !== category) {
          return false;
        }

        // Location filter
        if (location !== "all" && item.location !== location) {
          return false;
        }

        // Search filter (searches title, description, location, tags, finderName)
        if (search) {
          const searchableText = [
            item.title,
            item.description,
            item.location,
            item.locationDetail || "",
            item.finderName || "",
            ...(item.tags || [])
          ].join(" ").toLowerCase();

          if (!searchableText.includes(search)) {
            return false;
          }
        }

        return true;
      });

      // Brownie Point: Proximity & Smart Sorting
      results.sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.date) - new Date(a.date);
        } else if (sortBy === "oldest") {
          return new Date(a.date) - new Date(b.date);
        } else if (sortBy === "nearest") {
          const distA = Components.calculateProximity(this.currentUserLocation, a.location).rawMiles;
          const distB = Components.calculateProximity(this.currentUserLocation, b.location).rawMiles;
          return distA - distB;
        } else if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });

      this.filteredItems = results;
      this.renderItems(results);
      this.renderActiveFilterChips();
      this.updateStats();

      // Results count text
      if (resultsCountEl) {
        resultsCountEl.innerHTML = `Showing <span>${results.length}</span> ${results.length === 1 ? 'item' : 'campus items'}`;
      }
    };

    if (showSkeleton) {
      setTimeout(executeFilter, 280); // Realistic smooth transition
    } else {
      executeFilter();
    }
  },

  // Render Item Cards or Empty State
  renderItems(itemsToRender) {
    const grid = document.getElementById("itemsGrid");
    const emptyState = document.getElementById("emptyState");

    if (!grid) return;

    if (itemsToRender.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "flex";
      return;
    }

    emptyState.style.display = "none";
    grid.innerHTML = itemsToRender.map(item => Components.renderItemCard(item, this.currentUserLocation)).join('');
  },

  // Render Active Filter Chips
  renderActiveFilterChips() {
    const bar = document.getElementById("activeFiltersBar");
    const list = document.getElementById("activeFilterTagsList");
    if (!bar || !list) return;

    const chips = [];
    const { search, status, category, location } = this.activeFilters;

    if (search) {
      chips.push({
        label: `Search: "${search}"`,
        onRemove: () => {
          document.getElementById("searchInput").value = "";
          document.getElementById("searchClearBtn").classList.remove("visible");
          this.activeFilters.search = "";
          this.applyFilters();
        }
      });
    }

    if (status !== "all") {
      chips.push({
        label: `Status: ${status.toUpperCase()}`,
        onRemove: () => {
          this.activeFilters.status = "all";
          document.querySelectorAll(".segment-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.status === "all");
          });
          this.applyFilters();
        }
      });
    }

    if (category !== "all") {
      const catObj = CATEGORIES.find(c => c.id === category);
      chips.push({
        label: `Category: ${catObj ? catObj.name : category}`,
        onRemove: () => {
          this.activeFilters.category = "all";
          this.renderCategoryChips();
          this.applyFilters();
        }
      });
    }

    if (location !== "all") {
      chips.push({
        label: `Location: ${location}`,
        onRemove: () => {
          this.activeFilters.location = "all";
          document.getElementById("filterLocationSelect").value = "all";
          this.applyFilters();
        }
      });
    }

    if (chips.length > 0) {
      bar.classList.add("has-filters");
      list.innerHTML = chips.map((c, idx) => `
        <span class="active-filter-tag">
          ${Components.escapeHtml(c.label)}
          <button class="active-filter-remove" data-index="${idx}" aria-label="Remove filter">&times;</button>
        </span>
      `).join('');

      list.querySelectorAll(".active-filter-remove").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index, 10);
          if (chips[idx]) chips[idx].onRemove();
        });
      });
    } else {
      bar.classList.remove("has-filters");
      list.innerHTML = "";
    }
  },

  // Reset All Filters
  resetFilters() {
    this.activeFilters = {
      search: "",
      status: "all",
      category: "all",
      location: "all",
      sortBy: "newest"
    };

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = "";
      document.getElementById("searchClearBtn").classList.remove("visible");
    }

    const filterLocSelect = document.getElementById("filterLocationSelect");
    if (filterLocSelect) filterLocSelect.value = "all";

    const sortBySelect = document.getElementById("sortBySelect");
    if (sortBySelect) sortBySelect.value = "newest";

    document.querySelectorAll(".segment-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.status === "all");
    });

    this.renderCategoryChips();
    this.applyFilters(true);
    Components.showToast("All filters reset", "info");
  },

  // Update Statistics Banner and Tab Counts
  updateStats() {
    const total = this.items.length;
    const lost = this.items.filter(i => i.status === "lost").length;
    const found = this.items.filter(i => i.status === "found").length;
    const claimed = this.items.filter(i => i.status === "claimed").length;

    // Numbers in hero stats
    document.getElementById("statTotalCount").textContent = total;
    document.getElementById("statLostCount").textContent = lost;
    document.getElementById("statFoundCount").textContent = found;
    document.getElementById("statClaimedCount").textContent = claimed;

    // Badges in segmented control
    document.getElementById("tabCountAll").textContent = total;
    document.getElementById("tabCountLost").textContent = lost;
    document.getElementById("tabCountFound").textContent = found;
    document.getElementById("tabCountClaimed").textContent = claimed;
  },

  // Add a newly posted item to state
  addItem(item) {
    this.items.unshift(item);
    this.saveData();
    this.applyFilters(true);
  },

  // Open Post Item Modal
  openPostModal() {
    const modal = document.getElementById("postModal");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      document.getElementById("itemTitleInput").focus();
    }, 150);
  },

  closePostModal() {
    const modal = document.getElementById("postModal");
    modal.classList.remove("open");
    document.body.style.overflow = "";
  },

  // Open Claim Item Modal
  openClaimModal(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    this.currentlyClaimingItemId = itemId;
    const modal = document.getElementById("claimModal");

    // Populate modal summary info
    document.getElementById("claimItemImg").src = item.image;
    document.getElementById("claimItemTitle").textContent = item.title;
    document.getElementById("claimItemLocation").textContent = `${item.location} • Logged ${Components.formatRelativeTime(item.date)}`;

    const questionBox = document.getElementById("claimQuestionBox");
    const questionText = document.getElementById("claimVerificationQuestionText");
    if (item.claimQuestion) {
      questionText.textContent = item.claimQuestion;
      questionBox.style.display = "flex";
    } else {
      questionBox.style.display = "none";
    }

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  closeClaimModal() {
    const modal = document.getElementById("claimModal");
    modal.classList.remove("open");
    document.body.style.overflow = "";
    this.currentlyClaimingItemId = null;
    document.getElementById("claimItemForm").reset();
  },

  // Process and Confirm Claim
  confirmClaimCurrentItem(claimantInfo) {
    const item = this.items.find(i => i.id === this.currentlyClaimingItemId);
    if (!item) return;

    item.status = "claimed";
    item.claimedAt = new Date().toISOString();
    item.claimant = claimantInfo;

    this.saveData();
    this.closeClaimModal();
    this.applyFilters(false);
    this.updateStats();

    // Trigger celebration toast
    Components.showToast(`Success! "${item.title}" marked as Claimed. Check your email for retrieval pass #${item.id}`, "success", 6000);
  },

  // Open Details Modal
  openDetailModal(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    this.currentlyViewingItemId = itemId;
    const modal = document.getElementById("detailModal");

    document.getElementById("detailModalSubtitle").textContent = `ID: #${item.id}`;
    document.getElementById("detailImg").src = item.image;
    document.getElementById("detailTitle").textContent = item.title;
    document.getElementById("detailDescription").textContent = item.description;

    const catObj = CATEGORIES.find(c => c.id === item.category) || { name: item.category };
    document.getElementById("detailCategoryBadge").textContent = catObj.name;

    const statusBadge = document.getElementById("detailStatusBadge");
    statusBadge.textContent = item.status.toUpperCase();
    statusBadge.className = `card-status-badge ${item.status}`;

    document.getElementById("detailLocation").textContent = item.location;
    document.getElementById("detailSpot").textContent = item.locationDetail || "General Building Area";
    document.getElementById("detailDate").textContent = new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

    const proximity = Components.calculateProximity(this.currentUserLocation, item.location);
    document.getElementById("detailDistance").textContent = `${proximity.milesText} • ${proximity.timeText}`;

    document.getElementById("detailReporter").textContent = item.finderName || "Campus Member";
    document.getElementById("detailContact").textContent = item.contact || "Campus Safety Desk";

    // Setup action buttons inside detail modal
    const claimBtn = document.getElementById("detailClaimActionBtn");
    if (item.status === "claimed") {
      claimBtn.textContent = "Item Already Reunited";
      claimBtn.disabled = true;
      claimBtn.style.opacity = "0.6";
    } else {
      claimBtn.textContent = item.status === "lost" ? "I Found This" : "Claim This Item";
      claimBtn.disabled = false;
      claimBtn.style.opacity = "1";
      claimBtn.onclick = () => {
        this.closeDetailModal();
        this.openClaimModal(item.id);
      };
    }

    // Share link button
    document.getElementById("detailShareBtn").onclick = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?item=${item.id}`);
        Components.showToast("Direct item link copied to clipboard!", "success");
      } else {
        Components.showToast(`Item Reference: #${item.id}`, "info");
      }
    };

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  closeDetailModal() {
    const modal = document.getElementById("detailModal");
    modal.classList.remove("open");
    document.body.style.overflow = "";
    this.currentlyViewingItemId = null;
  },

  closeAllModals() {
    this.closePostModal();
    this.closeClaimModal();
    this.closeDetailModal();
  }
};

// Expose to window for inline onclick handlers
window.App = App;

// Launch when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
