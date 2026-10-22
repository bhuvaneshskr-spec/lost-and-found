/**
 * UniFind - Form Validator & Media Preview Manager
 * Handles real-time input validation, drag-and-drop image uploads, and FileReader previews
 */

const FormValidator = {
  currentImageDataUrl: null,

  init() {
    this.setupPostItemForm();
    this.setupImageDropzone();
    this.setupPresetButtons();
    this.setupClaimForm();
  },

  // Setup Post Form Live Field Validation
  setupPostItemForm() {
    const form = document.getElementById("postItemForm");
    const titleInput = document.getElementById("itemTitleInput");
    const descInput = document.getElementById("itemDescriptionInput");
    const categorySelect = document.getElementById("itemCategorySelect");
    const locationSelect = document.getElementById("itemLocationSelect");
    const dateInput = document.getElementById("itemDateInput");
    const posterName = document.getElementById("itemPosterName");
    const contactInput = document.getElementById("itemContact");
    const itemTypeRadios = document.getElementsByName("itemType");

    // Populate Category Dropdown
    if (categorySelect && typeof CATEGORIES !== "undefined") {
      categorySelect.innerHTML = '<option value="">Select Category...</option>' + 
        CATEGORIES.filter(c => c.id !== "all").map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // Populate Location Dropdown with optgroups
    if (locationSelect && typeof CAMPUS_LOCATIONS !== "undefined") {
      const ZONES_ORDER = [
        "Academic Block",
        "Central Campus",
        "Hangout",
        "Food",
        "Stationary",
        "Men's Hostels (MH)",
        "Ladies' Hostels (LH)"
      ];

      let optHtml = '<option value="">Select Campus Location...</option>';
      ZONES_ORDER.forEach(zone => {
        const matchingLocs = CAMPUS_LOCATIONS.filter(l => (l.zones && l.zones.includes(zone)) || l.zone === zone);
        if (matchingLocs.length > 0) {
          optHtml += `<optgroup label="${zone}">`;
          matchingLocs.forEach(l => {
            optHtml += `<option value="${l.name}">${l.name}</option>`;
          });
          optHtml += `</optgroup>`;
        }
      });
      locationSelect.innerHTML = optHtml;
    }

    // Set default date/time to now (in local ISO format)
    if (dateInput) {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      dateInput.value = localIso;
      dateInput.max = localIso; // Cannot post from the future
    }

    // Populate Treat Food Places Dropdown (ONLY food places, specifically excluding hangout-only places like Foodys!)
    const treatFoodPlaceSelect = document.getElementById("treatFoodPlaceSelect");
    if (treatFoodPlaceSelect && typeof CAMPUS_LOCATIONS !== "undefined") {
      const foodPlaces = CAMPUS_LOCATIONS.filter(l => (l.zones && l.zones.includes("Food")) || l.zone === "Food");
      treatFoodPlaceSelect.innerHTML = foodPlaces.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
    }

    // Treat toggle listener
    const enableTreatToggle = document.getElementById("enableTreatToggle");
    const treatFieldsWrap = document.getElementById("treatFieldsWrap");
    if (enableTreatToggle && treatFieldsWrap) {
      enableTreatToggle.addEventListener("change", (e) => {
        treatFieldsWrap.style.display = e.target.checked ? "block" : "none";
      });
    }

    // Quick treat preset buttons
    document.querySelectorAll(".treat-quick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.val;
        const input = document.getElementById("treatAmountInput");
        if (input) input.value = val;
      });
    });

    // Dynamic field labels based on Lost vs Found
    itemTypeRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        const treatOptionGroup = document.getElementById("treatOptionGroup");
        const foundVerificationGroup = document.getElementById("foundVerificationGroup");
        if (e.target.value === "lost") {
          if (treatOptionGroup) treatOptionGroup.style.display = "block";
          if (foundVerificationGroup) foundVerificationGroup.style.display = "none";
        } else {
          if (treatOptionGroup) treatOptionGroup.style.display = "none";
          if (foundVerificationGroup) foundVerificationGroup.style.display = "block";
        }
      });
    });

    // Character Counter & Live Validation for Title
    titleInput.addEventListener("input", () => {
      const count = titleInput.value.length;
      document.getElementById("titleCharCount").textContent = `${count}/80`;
      this.validateField(titleInput, count >= 3 && count <= 80);
    });

    // Character Counter & Live Validation for Description
    descInput.addEventListener("input", () => {
      const count = descInput.value.length;
      document.getElementById("descCharCount").textContent = `${count}/400`;
      this.validateField(descInput, count >= 10 && count <= 400);
    });

    // Live Validation on change / blur
    categorySelect.addEventListener("change", () => {
      this.validateField(categorySelect, !!categorySelect.value);
    });

    locationSelect.addEventListener("change", () => {
      this.validateField(locationSelect, !!locationSelect.value);
    });

    posterName.addEventListener("input", () => {
      this.validateField(posterName, posterName.value.trim().length >= 2);
    });

    contactInput.addEventListener("input", () => {
      const val = contactInput.value.trim();
      const isValid = val.length >= 4 && (val.includes("@") || /^[0-9\-+ ()]{7,15}$/.test(val));
      this.validateField(contactInput, isValid);
    });

    // Cancel Button
    document.getElementById("cancelPostBtn").addEventListener("click", () => {
      App.closePostModal();
    });

    // Form Submit Handler
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handlePostSubmit();
    });
  },

  // Helper to visually toggle input valid/invalid
  validateField(inputElement, isValid) {
    if (isValid) {
      inputElement.classList.remove("invalid");
      inputElement.classList.add("valid");
    } else {
      inputElement.classList.remove("valid");
      inputElement.classList.add("invalid");
    }
    return isValid;
  },

  // Setup Image Drag and Drop & File Reader Preview
  setupImageDropzone() {
    const dropzone = document.getElementById("imageDropzone");
    const fileInput = document.getElementById("imageFileInput");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreviewImg");
    const removeBtn = document.getElementById("removeImageBtn");

    if (!dropzone || !fileInput) return;

    // Click to browse
    dropzone.addEventListener("click", () => fileInput.click());

    // Drag & Drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        this.processImageFile(files[0]);
      }
    });

    // File Input change
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.processImageFile(e.target.files[0]);
      }
    });

    // Remove Preview
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.clearImagePreview();
    });
  },

  // Process chosen file with FileReader
  processImageFile(file) {
    if (!file.type.startsWith("image/")) {
      Components.showToast("Please select a valid image file (PNG, JPG, WebP)", "warn");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Components.showToast("Image file size should be less than 5MB", "warn");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.setImagePreview(event.target.result);
      Components.showToast("Photo loaded successfully!", "success");
    };
    reader.onerror = () => {
      Components.showToast("Could not read image file", "warn");
    };
    reader.readAsDataURL(file);
  },

  // Display Image in Preview
  setImagePreview(dataUrl) {
    this.currentImageDataUrl = dataUrl;
    const dropzone = document.getElementById("imageDropzone");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreviewImg");

    previewImg.src = dataUrl;
    previewContainer.classList.add("has-image");
    dropzone.style.display = "none";
  },

  // Reset Image Preview
  clearImagePreview() {
    this.currentImageDataUrl = null;
    const dropzone = document.getElementById("imageDropzone");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreviewImg");
    const fileInput = document.getElementById("imageFileInput");

    previewImg.src = "";
    previewContainer.classList.remove("has-image");
    dropzone.style.display = "block";
    fileInput.value = "";
  },

  // Setup Preset Sample Photo buttons
  setupPresetButtons() {
    const row = document.getElementById("presetButtonsRow");
    if (!row || typeof PRESET_SAMPLE_IMAGES === "undefined") return;

    row.innerHTML = PRESET_SAMPLE_IMAGES.map(preset => `
      <button type="button" class="preset-sample-btn" data-url="${preset.url}">
        ${preset.label}
      </button>
    `).join('');

    row.querySelectorAll(".preset-sample-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const url = btn.dataset.url;
        this.setImagePreview(url);
        Components.showToast(`Selected "${btn.textContent.trim()}" preset`, "info");
      });
    });
  },

  // Handle Post Form Submission
  handlePostSubmit() {
    const form = document.getElementById("postItemForm");
    const titleInput = document.getElementById("itemTitleInput");
    const descInput = document.getElementById("itemDescriptionInput");
    const categorySelect = document.getElementById("itemCategorySelect");
    const locationSelect = document.getElementById("itemLocationSelect");
    const dateInput = document.getElementById("itemDateInput");
    const posterName = document.getElementById("itemPosterName");
    const contactInput = document.getElementById("itemContact");
    const locationDetail = document.getElementById("itemLocationDetailInput");
    const extraField = document.getElementById("itemExtraField");
    const itemType = form.querySelector('input[name="itemType"]:checked').value;

    // Validate all required fields
    const isTitleValid = this.validateField(titleInput, titleInput.value.trim().length >= 3);
    const isCategoryValid = this.validateField(categorySelect, !!categorySelect.value);
    const isLocationValid = this.validateField(locationSelect, !!locationSelect.value);
    const isDateValid = this.validateField(dateInput, !!dateInput.value);
    const isDescValid = this.validateField(descInput, descInput.value.trim().length >= 10);
    const isPosterValid = this.validateField(posterName, posterName.value.trim().length >= 2);
    const isContactValid = this.validateField(contactInput, contactInput.value.trim().length >= 4);

    if (!isTitleValid || !isCategoryValid || !isLocationValid || !isDateValid || !isDescValid || !isPosterValid || !isContactValid) {
      Components.showToast("Please fill in all required fields marked with *", "warn");
      return;
    }

    // Default fallback image if none provided
    let finalImageUrl = this.currentImageDataUrl;
    if (!finalImageUrl) {
      // Pick matching preset or default
      const matchedPreset = PRESET_SAMPLE_IMAGES.find(p => p.label.toLowerCase().includes(categorySelect.value)) || PRESET_SAMPLE_IMAGES[0];
      finalImageUrl = matchedPreset.url;
    }

    // Build item object
    const newItem = {
      id: `VF-${Math.floor(1000 + Math.random() * 9000)}`,
      title: titleInput.value.trim(),
      type: itemType,
      category: categorySelect.value,
      location: locationSelect.value,
      locationDetail: locationDetail.value.trim() || undefined,
      date: dateInput.value,
      description: descInput.value.trim(),
      image: finalImageUrl,
      finderName: posterName.value.trim(),
      contact: contactInput.value.trim(),
      status: itemType, // 'lost' or 'found'
      tags: [categorySelect.value, locationSelect.value.split(' ')[0]]
    };

    if (itemType === "lost") {
      const enableTreat = document.getElementById("enableTreatToggle");
      if (enableTreat && enableTreat.checked) {
        const treatPlace = document.getElementById("treatFoodPlaceSelect").value;
        const treatVal = document.getElementById("treatAmountInput").value.trim() || "Treat offered";
        newItem.reward = `${treatVal} at ${treatPlace}`;
        newItem.treatPlace = treatPlace;
        newItem.tags.push("Treat Offered", treatPlace);
      }
    } else if (itemType === "found") {
      const extraField = document.getElementById("itemExtraField");
      if (extraField && extraField.value.trim()) {
        newItem.claimQuestion = extraField.value.trim();
      }
    }

    // Save to App State
    App.addItem(newItem);

    // Reset Form
    form.reset();
    this.clearImagePreview();
    form.querySelectorAll(".valid, .invalid").forEach(el => el.classList.remove("valid", "invalid"));
    document.getElementById("titleCharCount").textContent = "0/80";
    document.getElementById("descCharCount").textContent = "0/400";
    const treatFields = document.getElementById("treatFieldsWrap");
    if (treatFields) treatFields.style.display = "none";
    const enableTreat = document.getElementById("enableTreatToggle");
    if (enableTreat) enableTreat.checked = false;

    // Close Modal
    App.closePostModal();
    Components.showToast(`Your ${itemType} report for "${newItem.title}" has been published!`, "success", 4000);
  },

  // Setup Claim Modal Form
  setupClaimForm() {
    const claimForm = document.getElementById("claimItemForm");
    const proofInput = document.getElementById("claimProofInput");
    const nameInput = document.getElementById("claimantNameInput");
    const emailInput = document.getElementById("claimantEmailInput");

    document.getElementById("cancelClaimBtn").addEventListener("click", () => {
      App.closeClaimModal();
    });

    claimForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const isProofValid = this.validateField(proofInput, proofInput.value.trim().length >= 6);
      const isNameValid = this.validateField(nameInput, nameInput.value.trim().length >= 2);
      const isEmailValid = this.validateField(emailInput, emailInput.value.includes("@") && emailInput.value.includes("."));

      if (!isProofValid || !isNameValid || !isEmailValid) {
        Components.showToast("Please provide your name, valid email, and proof details", "warn");
        return;
      }

      App.confirmClaimCurrentItem({
        claimantName: nameInput.value.trim(),
        claimantEmail: emailInput.value.trim(),
        proof: proofInput.value.trim(),
        pickupSpot: document.getElementById("claimPickupSpotSelect").value
      });
    });
  }
};

window.FormValidator = FormValidator;
