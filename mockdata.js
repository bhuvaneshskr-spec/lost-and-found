/**
 * VIT Find - Campus Lost & Found Hub
 * Mock Dataset & Campus Geolocation Graph for VIT Vellore
 */

// Helper to generate hostel blocks
function generateHostelBlocks(prefix, gender, startChar, endChar, baseCoords, zone) {
  const blocks = [];
  const startCode = startChar.charCodeAt(0);
  const endCode = endChar.charCodeAt(0);
  let step = 0;

  for (let code = startCode; code <= endCode; code++) {
    const char = String.fromCharCode(code);
    blocks.push({
      id: `${prefix.toLowerCase()}-${char.toLowerCase()}`,
      name: `${gender} Hostel ${char} Block`,
      shortName: `${prefix}-${char}`,
      zone: zone,
      zones: [zone],
      x: baseCoords.x + (step % 5) * 15,
      y: baseCoords.y + Math.floor(step / 5) * 25,
      description: `${gender} residential block ${char}`
    });
    step++;
  }
  return blocks;
}

const BOYS_HOSTELS = generateHostelBlocks("MH", "Boys", "A", "T", { x: 120, y: 120 }, "Men's Hostels (MH)");
const GIRLS_HOSTELS = generateHostelBlocks("LH", "Girls", "A", "S", { x: 420, y: 150 }, "Ladies' Hostels (LH)");

const CAMPUS_LOCATIONS = [
  // Academic & Core Campus Blocks
  { id: "sjt", name: "SJT (Silver Jubilee Tower)", shortName: "SJT", zone: "Academic Block", zones: ["Academic Block"], x: 380, y: 380, description: "Silver Jubilee Tower, CSE/IT labs & lecture halls" },
  { id: "tt", name: "TT (Technology Tower)", shortName: "TT", zone: "Academic Block", zones: ["Academic Block"], x: 270, y: 220, description: "Technology Tower & faculty cabins" },
  { id: "mb", name: "MB (Main Building)", shortName: "MB", zone: "Academic Block", zones: ["Academic Block"], x: 200, y: 200, description: "Main Administrative Building & auditorium" },
  { id: "mgb", name: "MGB (Mahatma Gandhi Block)", shortName: "MGB", zone: "Academic Block", zones: ["Academic Block"], x: 220, y: 290, description: "Mahatma Gandhi Block classrooms & labs" },
  { id: "smv", name: "SMV (Sir M. Visvesvaraya Block)", shortName: "SMV", zone: "Academic Block", zones: ["Academic Block"], x: 250, y: 170, description: "SMV civil & mechanical engineering labs" },
  { id: "gdn", name: "GDN (G.D. Naidu Block)", shortName: "GDN", zone: "Academic Block", zones: ["Academic Block"], x: 290, y: 180, description: "GD Naidu science & biotech laboratories" },
  { id: "prp", name: "PRP (Dr. P.R. Paul Raj Block)", shortName: "PRP", zone: "Academic Block", zones: ["Academic Block"], x: 320, y: 290, description: "PRP Block seminar halls and departments" },
  { id: "prp-annexe", name: "PRP Annexe", shortName: "PRP Annexe", zone: "Academic Block", zones: ["Academic Block"], x: 335, y: 305, description: "PRP Annexe lecture rooms and offices" },

  // Central Campus
  { id: "anna-lib", name: "Anna Library", shortName: "Anna Lib", zone: "Central Campus", zones: ["Central Campus"], x: 240, y: 230, description: "Central Anna Library & reference reading halls" },
  { id: "kc-lawn", name: "KC Lawn", shortName: "KC Lawn", zone: "Central Campus", zones: ["Central Campus"], x: 245, y: 245, description: "Knowledge City lawn & open amphitheater" },

  // Hangouts
  // foodys comes under only hangout
  { id: "foodys", name: "Foodys", shortName: "Foodys", zone: "Hangout", zones: ["Hangout"], x: 250, y: 260, description: "Central Foodys student hangout & lounge area" },
  // sjt foodys comes under hangout and food
  { id: "sjt-foodys", name: "SJT Foodys", shortName: "SJT Foodys", zone: "Food & Hangout", zones: ["Hangout", "Food"], x: 395, y: 390, description: "SJT ground floor cafeteria, eateries & hangout spot" },

  // Food (only food is dominos, dc, fc, darling cafe, darling canteen, amul and places near dominos)
  { id: "dominos", name: "Dominos", shortName: "Dominos", zone: "Food", zones: ["Food"], x: 230, y: 270, description: "Dominos Pizza outlet near men's hostels" },
  { id: "dc", name: "DC (Dining Commons)", shortName: "DC", zone: "Food", zones: ["Food"], x: 190, y: 240, description: "Dining Commons student mess and catering" },
  { id: "fc", name: "FC (Food Court)", shortName: "FC", zone: "Food", zones: ["Food"], x: 260, y: 270, description: "Main campus food court and food stalls" },
  { id: "darling-cafe", name: "Darling Cafe", shortName: "Darling Cafe", zone: "Food", zones: ["Food"], x: 220, y: 250, description: "Darling Cafe bakery, snacks, and beverages" },
  { id: "darling-canteen", name: "Darling Canteen", shortName: "Darling Canteen", zone: "Food", zones: ["Food"], x: 215, y: 260, description: "Darling Canteen South & North Indian dining" },
  { id: "amul", name: "Amul", shortName: "Amul", zone: "Food", zones: ["Food"], x: 240, y: 265, description: "Amul ice cream & dairy kiosk" },
  { id: "places-near-dominos", name: "Places near Dominos", shortName: "Near Dominos", zone: "Food", zones: ["Food"], x: 235, y: 275, description: "Fast-food stalls and eateries around Dominos circle" },

  // Stationary (stationary is balaji stores and shops near gdn)
  { id: "balaji-stores", name: "Balaji Stores", shortName: "Balaji", zone: "Stationary", zones: ["Stationary"], x: 205, y: 245, description: "Balaji bookstore, stationery, printing & reprography" },
  { id: "shops-near-gdn", name: "Shops near GDN", shortName: "Near GDN", zone: "Stationary", zones: ["Stationary"], x: 285, y: 185, description: "Stationery shops, lab essentials & xerox near GDN" },

  // Boys Hostels (A to T)
  ...BOYS_HOSTELS,

  // Girls Hostels (A to S)
  ...GIRLS_HOSTELS
];

const CATEGORIES = [
  { id: "all", name: "All Categories", icon: "sparkles" },
  { id: "electronics", name: "Electronics & Tech", icon: "laptop" },
  { id: "ids-wallets", name: "VIT ID & Cards", icon: "credit-card" },
  { id: "stationery", name: "Stationary & Supplies", icon: "book-open" },
  { id: "keys", name: "Hostel Keys & Fobs", icon: "key" },
  { id: "bags", name: "Backpacks & Pouches", icon: "briefcase" },
  { id: "books", name: "Textbooks & Notes", icon: "book-open" },
  { id: "apparel", name: "Apparel & Eyewear", icon: "shirt" },
  { id: "bottles", name: "Bottles & Flasks", icon: "cup-soda" },
  { id: "other", name: "Other Items", icon: "help-circle" }
];

const INITIAL_ITEMS = [
  {
    id: "VF-2041",
    title: "Space Gray MacBook Air M2",
    type: "found",
    category: "electronics",
    location: "SJT (Silver Jubilee Tower)",
    locationDetail: "4th Floor Lab 412, left on corner table near projector",
    coordinates: { x: 380, y: 380 },
    date: "2026-10-22T14:30:00",
    description: "MacBook Air M2 with a matte black protective case and a GitHub sticker. Deposited at SJT 1st floor security / lab in-charge desk.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    finderName: "Rohan Verma (SCOPE Dept)",
    contact: "rohan.v2023@vitstudent.ac.in",
    status: "found",
    tags: ["Apple", "MacBook", "SJT", "Laptop", "Space Gray", "Academic"],
    claimQuestion: "What is the lock screen wallpaper name and second sticker next to GitHub?"
  },
  {
    id: "VF-2042",
    title: "Sony WH-1000XM4 Noise-Canceling Headphones",
    type: "lost",
    category: "electronics",
    location: "TT (Technology Tower)",
    locationDetail: "2nd Floor Faculty Lounge benches",
    coordinates: { x: 270, y: 220 },
    date: "2026-10-22T11:15:00",
    description: "Black over-ear Sony headphones in original gray zipper case. Left behind after digital signal processing lecture.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    finderName: "Aditya Nair",
    contact: "aditya.nair2024@vitstudent.ac.in | +91 98765 43210",
    status: "lost",
    tags: ["Sony", "Headphones", "TT", "Audio"],
    reward: "₹500 treat at Dominos"
  },
  {
    id: "VF-2043",
    title: "VIT Student ID Card & RFID Lanyard",
    type: "found",
    category: "ids-wallets",
    location: "Foodys",
    locationDetail: "Table near fresh juice counter",
    coordinates: { x: 250, y: 260 },
    date: "2026-10-21T18:40:00",
    description: "VIT ID Card for registration number '22BCE1892' with blue VIT lanyard and hostel turnstile RFID card. Given to Foodys billing desk.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    finderName: "Foodys Supervisor",
    contact: "foodys-desk@vit.ac.in",
    status: "found",
    tags: ["VIT ID", "RFID", "Foodys", "Card", "Hangout"],
    claimQuestion: "Verify student full name and branch mentioned on the card."
  },
  {
    id: "VF-2044",
    title: "Teal Hydro Flask (32 oz) with Stickers",
    type: "lost",
    category: "bottles",
    location: "KC Lawn",
    locationDetail: "Stone seating near the central gazebo",
    coordinates: { x: 245, y: 245 },
    date: "2026-10-21T16:00:00",
    description: "Pacific Teal Hydro Flask with black straw lid. Has stickers from Gravitas, Riviera, and an IEEE club crest.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    finderName: "Sneha Reddy",
    contact: "sneha.reddy@vitstudent.ac.in",
    status: "lost",
    tags: ["Hydro Flask", "KC Lawn", "Riviera", "Bottle"]
  },
  {
    id: "VF-2045",
    title: "Hostel Brass Room Keys & Godrej Lock Key",
    type: "found",
    category: "keys",
    location: "Boys Hostel Q Block",
    locationDetail: "Left on water purifier ledge, 2nd floor",
    coordinates: { x: 160, y: 290 },
    date: "2026-10-21T09:20:00",
    description: "Set of three keys on a blue carabiner with room tag 'Q-214' and a small black cycle lock key. Handed to Q Block Warden Office.",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    finderName: "Q Block Caretaker",
    contact: "warden.mhq@vit.ac.in",
    status: "found",
    tags: ["Keys", "Hostel", "Q Block", "Carabiner"]
  },
  {
    id: "VF-2046",
    title: "The North Face Borealis Backpack (Navy)",
    type: "found",
    category: "bags",
    location: "Girls Hostel D Block",
    locationDetail: "Lobby waiting sofa near biometric gate",
    coordinates: { x: 450, y: 170 },
    date: "2026-10-20T22:15:00",
    description: "Navy blue North Face backpack containing engineering drawing instruments, notebook, and Casio fx-991CW calculator. Safe with LH D Block security.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    finderName: "LH D Block Security",
    contact: "lh-security@vit.ac.in",
    status: "claimed",
    tags: ["Backpack", "Girls Hostel", "LH D", "North Face"],
    claimedAt: "2026-10-22T10:00:00",
    claimQuestion: "Confirm the serial model number on the Casio calculator inside the front pocket."
  },
  {
    id: "VF-2047",
    title: "Thomas Calculus 14th Edition Hardcover",
    type: "lost",
    category: "books",
    location: "Anna Library",
    locationDetail: "2nd Floor silent reading section, desk 34",
    coordinates: { x: 240, y: 230 },
    date: "2026-10-20T17:30:00",
    description: "Calculus textbook with green highlighter tabs on integration chapters. Has 'MAT1011 notes' handwritten on index page.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    finderName: "Kavya Menon",
    contact: "kavya.m@vitstudent.ac.in",
    status: "lost",
    tags: ["Textbook", "Calculus", "Anna Library", "Math"]
  },
  {
    id: "VF-2048",
    title: "Ray-Ban Classic Clubmaster Sunglasses",
    type: "found",
    category: "apparel",
    location: "SJT Foodys",
    locationDetail: "Corner table near waffle counter",
    coordinates: { x: 395, y: 390 },
    date: "2026-10-20T13:00:00",
    description: "Black and gold frame Ray-Ban Clubmaster in leather case. Found during lunch break. Left with SJT Foodys manager.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    finderName: "SJT Foodys Counter Staff",
    contact: "sjtfoodys@vit.ac.in",
    status: "found",
    tags: ["Ray-Ban", "Sunglasses", "SJT Foodys", "Eyewear", "Hangout", "Food"]
  },
  {
    id: "VF-2049",
    title: "Scientific Calculator Casio fx-991EX ClassWiz",
    type: "lost",
    category: "electronics",
    location: "SMV (Sir M. Visvesvaraya Block)",
    locationDetail: "Room 208, 3rd row desk slot",
    coordinates: { x: 250, y: 170 },
    date: "2026-10-19T15:10:00",
    description: "Black and white Casio fx-991EX ClassWiz. Has small white marker initials 'AK' on the slide cover.",
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    finderName: "Aman Kapoor",
    contact: "aman.kapoor@vitstudent.ac.in",
    status: "lost",
    tags: ["Casio", "Calculator", "SMV", "ClassWiz"]
  },
  {
    id: "VF-2050",
    title: "Apple Watch Series 8 (Midnight Aluminum 45mm)",
    type: "found",
    category: "electronics",
    location: "GDN (G.D. Naidu Block)",
    locationDetail: "GDN Auditorium stairs, row G",
    coordinates: { x: 290, y: 180 },
    date: "2026-10-19T19:30:00",
    description: "Midnight dark aluminum Apple Watch with dark sports band. Battery in Power Reserve. Deposited at GDN Security Desk.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    finderName: "GDN Security Personnel",
    contact: "gdn-security@vit.ac.in",
    status: "found",
    tags: ["Apple Watch", "GDN", "Smartwatch"]
  },
  {
    id: "VF-2051",
    title: "Vintage Denim Jacket with Riviera Badges",
    type: "lost",
    category: "apparel",
    location: "PRP Annexe",
    locationDetail: "Classroom 104 back chair hook",
    coordinates: { x: 335, y: 305 },
    date: "2026-10-18T18:00:00",
    description: "Faded blue denim jacket (Size L) with Riviera fest pin and a music note embroidered patch on right cuff.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    finderName: "Pooja Sharma",
    contact: "pooja.sharma2023@vitstudent.ac.in",
    status: "lost",
    tags: ["Jacket", "Denim", "PRP Annexe", "Riviera"]
  },
  {
    id: "VF-2052",
    title: "AirPods Pro 2nd Gen in Sage Silicone Case",
    type: "found",
    category: "electronics",
    location: "MB (Main Building)",
    locationDetail: "Benches outside Finance Office / Main Hall",
    coordinates: { x: 200, y: 200 },
    date: "2026-10-18T12:00:00",
    description: "White AirPods Pro in a matte sage green silicone case with small lanyard loop. Left at Main Building Security.",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    finderName: "Main Building Security Post",
    contact: "mb-security@vit.ac.in | ext 1022",
    status: "found",
    tags: ["AirPods", "MB", "Main Building", "Apple"]
  },
  // Newly Added Food & Stationary Specific Locations
  {
    id: "VF-2053",
    title: "Brown Leather Cardholder with Domino's Order Bill",
    type: "found",
    category: "ids-wallets",
    location: "Dominos",
    locationDetail: "Booth table #4 next to pick-up counter",
    coordinates: { x: 230, y: 270 },
    date: "2026-10-22T20:15:00",
    description: "Saddle-brown leather card sleeve containing a debit card, hostel room swipe tag, and a Domino's order receipt. Handed over to Dominos billing counter manager.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    finderName: "Dominos Shift In-Charge",
    contact: "dominos.vit@vit.ac.in",
    status: "found",
    tags: ["Dominos", "Food", "Wallet", "Cardholder"],
    claimQuestion: "Name on the debit card and last digits of Domino's order receipt."
  },
  {
    id: "VF-2054",
    title: "Classmate Pulse Spiral Notebook & Drawing Pens Set",
    type: "found",
    category: "stationery",
    location: "Balaji Stores",
    locationDetail: "Stationery billing shelf next to photocopy machines",
    coordinates: { x: 205, y: 245 },
    date: "2026-10-22T16:45:00",
    description: "Thick A4 spiral notebook with physics notes, along with a transparent pouch containing 0.5mm micro pens and Faber-Castell highlighters.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    finderName: "Balaji Stores Cashier",
    contact: "balaji-stores@vit.ac.in",
    status: "found",
    tags: ["Balaji Stores", "Stationary", "Notebook", "Supplies"],
    claimQuestion: "Subject title written on the first page of the spiral notebook."
  },
  {
    id: "VF-2055",
    title: "White Chemistry Lab Coat & Safety Goggles",
    type: "lost",
    category: "stationery",
    location: "Shops near GDN",
    locationDetail: "Left on counter of the Xerox shop opposite GDN block",
    coordinates: { x: 285, y: 185 },
    date: "2026-10-22T13:20:00",
    description: "Standard white lab coat (Size 38) with embroidery 'VIT Chemistry Dept' and a pair of clear safety goggles in front pocket.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    finderName: "Manish Kumar",
    contact: "manish.k2024@vitstudent.ac.in",
    status: "lost",
    tags: ["Lab Coat", "Shops near GDN", "Stationary", "GDN"]
  },
  {
    id: "VF-2056",
    title: "Milton Thermosteel Hot & Cold Flask (Silver)",
    type: "lost",
    category: "bottles",
    location: "Darling Cafe",
    locationDetail: "High-top cafe stool table outside Darling Cafe",
    coordinates: { x: 220, y: 250 },
    date: "2026-10-21T17:15:00",
    description: "750ml stainless steel flask with a small dent on the bottom rim and black cap with carry handle. Lost during evening tea break.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    finderName: "Rahul Sen",
    contact: "rahul.sen@vitstudent.ac.in",
    status: "lost",
    tags: ["Darling Cafe", "Food", "Bottle", "Milton"]
  },
  {
    id: "VF-2057",
    title: "Black Automatic Golf Umbrella",
    type: "found",
    category: "other",
    location: "DC (Dining Commons)",
    locationDetail: "Umbrella stand near DC entrance turnstiles",
    coordinates: { x: 190, y: 240 },
    date: "2026-10-21T21:00:00",
    description: "Large black windproof umbrella with wooden curved handle and one-touch push button. Handed over to DC security supervisor.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    finderName: "DC Security Team",
    contact: "dc-mess@vit.ac.in",
    status: "found",
    tags: ["DC", "Dining Commons", "Food", "Umbrella"],
    claimQuestion: "Brand engraved on the metal tip collar."
  },
  {
    id: "VF-2058",
    title: "Hercules Cycle Brass Key with Amul Mascot Keychain",
    type: "found",
    category: "keys",
    location: "Amul",
    locationDetail: "Ice cream parlor wooden railing",
    coordinates: { x: 240, y: 265 },
    date: "2026-10-21T15:30:00",
    description: "Single cycle key attached to a vintage Amul butter mascot rubber keychain. Left with Amul parlor cashier.",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    finderName: "Amul Parlor Cashier",
    contact: "amul-kiosk@vit.ac.in",
    status: "found",
    tags: ["Amul", "Food", "Keys", "Cycle"]
  },
  {
    id: "VF-2059",
    title: "Earphone Zipper Case with Fast Charging Type-C Cable",
    type: "lost",
    category: "electronics",
    location: "Places near Dominos",
    locationDetail: "Concrete round bench in the open courtyard near Dominos",
    coordinates: { x: 235, y: 275 },
    date: "2026-10-20T19:45:00",
    description: "Round black carbon-fiber pattern pouch containing a 65W red braided Type-C cable and silicone earbuds.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    finderName: "Siddharth Jain",
    contact: "siddharth.jain2023@vitstudent.ac.in",
    status: "lost",
    tags: ["Places near Dominos", "Food", "Electronics", "Cable"]
  }
];

const PRESET_SAMPLE_IMAGES = [
  { label: "Laptop / MacBook", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" },
  { label: "Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
  { label: "Keys / Fobs", url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80" },
  { label: "Water Flask", url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80" },
  { label: "Backpack", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80" },
  { label: "VIT ID / Card", url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80" },
  { label: "Stationary / Book", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80" },
  { label: "Calculator / Tech", url: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80" }
];
