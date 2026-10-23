# 🎓 VIT Find — Campus Lost & Found Hub for VIT Vellore

A modern, high-performance, responsive web application designed specifically for the **Vellore Institute of Technology (VIT)** campus community to report, search, filter, and claim lost or found belongings across academic blocks, food courts, libraries, and hostels.

Built with **modern semantic HTML5**, **vanilla CSS3 design tokens**, and **clean modular ES6+ JavaScript** with **zero build step dependencies**.

---

## 🏛️ Comprehensive VIT Vellore Campus Coverage

VIT Find includes comprehensive coverage and geolocation tracking for the entire campus:

### 🏢 Academic & Central Blocks
- **Academic Blocks**: **SJT** (Silver Jubilee Tower), **TT** (Technology Tower), **MB** (Main Building), **MGB** (Mahatma Gandhi Block), **SMV** (Sir M. Visvesvaraya Block), **GDN** (G.D. Naidu Block), **PRP** (Dr. P.R. Paul Raj Block), **PRP Annexe**
- **Central Campus**: **Anna Library** (Central Library), **KC Lawn** (Knowledge City Amphitheater & Lawns)

### ☕ Hangout & 🍕 Food Categorization
- **Hangout**: **Foodys** (only hangout), **SJT Foodys** (hangout and food)
- **Food**: **Dominos**, **DC** (Dining Commons), **FC** (Food Court), **Darling Cafe**, **Darling Canteen**, **Amul**, **Places near Dominos** (only food), and **SJT Foodys** (hangout and food)
- **🍕 Treat Option**: Students posting a lost item can offer a treat / incentive to the finder. Per campus guidelines, treats are **strictly selectable only from Food places** (`Dominos`, `DC`, `FC`, `Darling Cafe`, `Darling Canteen`, `Amul`, `Places near Dominos`, `SJT Foodys`) and **never from Hangout-only places** (`Foodys`).

### 📚 Stationary & Stores
- **Stationary**: **Balaji Stores**, **Shops near GDN**

### 🛏️ Residential Hostels
- **Men's Hostels (MH)**: Blocks **A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T** (20 residential blocks).
- **Ladies' Hostels (LH)**: Blocks **A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S** (19 residential blocks).

---

## 🚀 Quick Start / Running Locally

Since VIT Find has zero external dependencies, you can run it immediately with any static server or Python:

```bash
# Clone the repository (or navigate to the project directory)
cd c:\Users\Dell\firefox

# Start the local server
py -m http.server 8080

# Open in your browser:
# http://localhost:8080
```

*Note: You can also open `index.html` directly in any web browser.*

---

## ✨ Features & Requirements Breakdown

### 🎯 Base Requirements
- [x] **Student Verification Entry Page (`index.html`)**: Clean, interactive gateway page requesting Student Name and VIT Registration Number, complete with live dynamic virtual VIT ID card preview, school department detection (SCOPE, SITE, SMEC, SELECT, SENSE, etc.), fast demo test profiles, and automatic redirection to the Home Page.
- [x] **Campus Home Page (`home.html`)**: Rich campus lost & found dashboard personalized with the logged-in student's identity badge, hero welcome banner, and auto-populated reporting contact details.
- [x] **Item Cards**: Rich cards with high-res photo, item title, status badge (`Lost`, `Found`, `Claimed`), category icon, campus building location, relative timestamp, and interactive actions.
- [x] **Search & Multi-Filter**: 
  - Real-time search across item titles, descriptions, locations, and tags.
  - Filter by status (`All`, `Lost`, `Found`, `Claimed`).
  - Filter by category (`Electronics`, `VIT ID & Cards`, `Hostel Keys`, `Backpacks`, `Textbooks`, `Apparel`, `Bottles`, `Other`).
  - Filter by campus location / building with categorized `<optgroup>` listings.
- [x] **Post Item Form**: Complete modal form allowing students/staff to report lost or found items with custom locations, date-time, and verification questions.
- [x] **Mock JSON & Local Persistence**: Pre-populated with 12 realistic VIT campus items and saved to `localStorage` (`vitfind_items_v5`) for instant persistence across page refreshes.

### 🌟 Brownie Points Achieved
- [x] **Debounced Search**: 300ms debounce buffer with loading spinner and `/` keyboard shortcut for rapid searching without UI lag.
- [x] **Nearest / Proximity Campus Sorting**:
  - Campus geolocation coordinates mapped for all VIT academic blocks and hostels.
  - Select "Your Spot" in the top bar (e.g. *SJT*, *TT*, *Foodys*, or your specific hostel block).
  - Every card dynamically displays estimated walking distance & minutes (e.g., `0.2 mi • 3 min walk`).
  - Sorting by **"Nearest to You 📍"** dynamically calculates Euclidean distance from your chosen location.
- [x] **Image Preview Before Submission**:
  - Drag-and-drop or file upload using `FileReader` with instant Base64 preview.
  - Image removal button.
  - 8 one-click campus preset sample photos for rapid testing.
- [x] **Skeleton Loading State**: Animated shimmer skeleton placeholders displayed on initial load and filter transitions.
- [x] **Informative Empty States**: Friendly SVG illustrations and advice when search/filters yield zero results, complete with a "Clear All Filters" button.
- [x] **Live Form Validation**:
  - Real-time visual feedback (green/red borders) on blur and typing.
  - Character counters for title (`X/80`) and description (`X/400`).
  - Contextual error messages for required fields, date sanity, and contact info.
- [x] **Responsive Layout**: Designed mobile-first, adapting seamlessly from mobile viewports (single column) to tablets and widescreen desktop monitors.
- [x] **Claim Verification Flow**:
  - Dedicated claim modal requiring ownership proof/distinguishing marks; updates item to `Claimed` and triggers celebratory toast alerts.
- [x] **Dark / Light Mode**: Instant theme toggle with CSS variable adaptation and preference persistence.

---

## 🏛️ Component & File Architecture

```
c:\Users\Dell\firefox\
├── index.html              # Student Verification Entry Gateway (Name & Reg No -> redirect to home.html)
├── home.html               # Main VIT Find Campus Hub & Lost/Found Dashboard
├── login.html              # Clean redirect alias to index.html
├── README.md               # Documentation and architectural overview
├── css/
│   └── style.css           # Design tokens, color system, digital ID card, glassmorphism & responsive grid
└── js/
    ├── mockData.js         # VIT locations (SJT, TT, MB, MGB, Hostels A-T/A-S), items, and presets
    ├── components.js       # Card templates, skeleton loader, distance engine & toast notifications
    ├── formValidator.js    # Live input validation, drag-and-drop dropzone & FileReader image preview
    └── app.js              # Application state machine, user session controller, search & filters
```

### Component Structure Detail:

1. **`App` (`js/app.js`)**:
   - Master state holder (`items`, `filteredItems`, `activeFilters`, `currentUserLocation`).
   - Debounced search controller with cancel tokens.
   - Status tabs, category filters, and location multi-filter logic with categorized optgroups.
   - Proximity sorting engine with dynamic campus coordinate calculation.
   - Modal management (`PostModal`, `ClaimModal`, `DetailModal`).
   - `localStorage` synchronization (`vitfind_items_v3`) and reset mechanisms.

2. **`Components` (`js/components.js`)**:
   - `renderItemCard(item, userLocation)`: Generates semantic cards with distance indicators and status styling.
   - `renderSkeletonCard()`: Produces animated shimmer loading placeholders.
   - `calculateProximity(userLocId, itemLocName)`: Translates campus coordinate vectors into realistic miles and walking times.
   - `showToast(message, type, duration)`: Non-blocking animated alert system.

3. **`FormValidator` (`js/formValidator.js`)**:
   - Live field validators with inline feedback classes (`.valid`, `.invalid`).
   - Drag-and-drop dropzone with `FileReader` for instant photo previews.
   - Preset selector for one-click demo photo population.
   - Grouped location dropdown generator for posting items.
   - Claim verification and security answer validation.

4. **`mockData` (`js/mockData.js`)**:
   - `CAMPUS_LOCATIONS`: 50+ locations spanning SJT, TT, MB, MGB, SMV, GDN, PRP, PRP Annexe, Anna Library, Foodys, KC Lawn, SJT Foodys, Boys Hostels (A to T), and Girls Hostels (A to S).
   - `CATEGORIES`: 8 item categories with corresponding SVG icons.
   - `INITIAL_ITEMS`: Realistic student items at various VIT hotspots.

---

## 🎨 Design System

- **Color Palette**: Modern Indigo (`#4f46e5`) & Cyan (`#06b6d4`) campus gradient with HSL-tailored status accents:
  - **Lost**: Rose / Amber (`#f43f5e` / `#f59e0b`)
  - **Found**: Emerald (`#10b981`)
  - **Claimed**: Violet (`#8b5cf6`)
- **Typography**: Google Font `Plus Jakarta Sans` for clean, high-legibility interface typography.
- **Micro-Animations**: Hover elevations, glassmorphic blurs, pulsing live network indicators, and smooth modal transitions.
