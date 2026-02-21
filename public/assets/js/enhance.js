(() => {
  const $ = (id) => document.getElementById(id);

  // Sticky "Call" button (bottom-right)
  const stickyBtn = $("stickyCallBtn") || $("stickyBookBtn");
const scalpBtn = $("stickyScalpBtn");
  function updateSticky() {
  if (stickyBtn) stickyBtn.style.display = window.scrollY > 450 ? "block" : "none";
  if (scalpBtn)  scalpBtn.style.display  = window.scrollY > 120 ? "block" : "none";
}
  updateSticky();
  window.addEventListener("scroll", updateSticky);

  const lb = $("lightbox");
  const lbImg = $("lightboxImg");
  const lbClose = $("lightboxClose");

  // ---------- Lightbox ----------
  function openLightbox(src, alt) {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || "Photo";
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() {
    if (!lb || !lbImg) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
  }

  lbClose?.addEventListener("click", closeLightbox);
  lb?.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });

  // Enable lightbox for instagram images
  document.querySelectorAll('img[src*="instagram-"]').forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(img.src, img.alt);
    });
  });

  // ---------- Reveal-on-scroll ----------
  const revealTargets = document.querySelectorAll(
    ".section-content, .hero-foreground, .card, img.w-100, .faq"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) ent.target.classList.add("reveal-in");
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("reveal-in"));
  }

  //===== Price Box under each service duration selector =====
  const PRICE_TABLE = {
    "Swedish Massage": { "30min": "$50", "60min": "$70", "90min": "$100", "120min": "$140" },
    "Deep Tissue Massage": { "30min": "$50", "60min": "$70", "90min": "$100", "120min": "$140" },
    "Couples Massage": { "60min": "$130", "90min": "$190", "120min": "$260" },
    "Foot Massage": { "60min": "$60" },
    "Combo Massage": { "70min": "$90", "90min": "$120", "120min": "$150" },
  };

  const SERVICE_HINT_TABLE = {
    "Swedish Massage": {
      "30min": "30 min swedish body",
      "60min": "60 min swedish body",
      "90min": "90 min swedish body",
      "120min": "120 min swedish body",
    },
    "Deep Tissue Massage": {
      "30min": "30 min deep tissue body",
      "60min": "60 min deep tissue body",
      "90min": "90 min deep tissue body",
      "120min": "120 min deep tissue body",
    },
    "Couples Massage": {
      "60min": "60 min body couples session",
      "90min": "90 min body couples session",
      "120min": "120 min body couples session",
    },
    "Foot Massage": {
      "60min": "60 min foot",
    },
    "Combo Massage": {
      "70min": "30 min facial + 40 min body",
      "90min": "30 min facial + 60 min body",
      "120min": "30 min facial + 90 min body",
    },
  };

  function normalizeDuration(val) {
    return String(val || "").toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
  }

  function normalizeServiceName(name) {
    return String(name || "").replace(/\s+/g, " ").trim();
  }

  function ensurePriceBox(section, groupEl, serviceName) {
    // If one already exists in this section, reuse it
    let box = section.querySelector('.price-box[data-service="' + serviceName + '"]')
      || section.querySelector(".price-box");

    if (box) {
      // Ensure required children exist (for older boxes)
      if (!box.querySelector("[data-price-value]") && !box.querySelector(".price-box-value")) {
        const val = document.createElement("div");
        val.className = "price-box-value";
        val.setAttribute("data-price-value", "");
        val.textContent = "—";
        box.appendChild(val);
      } else if (!box.querySelector("[data-price-value]") && box.querySelector(".price-box-value")) {
        box.querySelector(".price-box-value").setAttribute("data-price-value", "");
      }

      if (!box.querySelector(".price-box-hint")) {
        const hint = document.createElement("div");
        hint.className = "price-box-hint";
        hint.textContent = "Select a duration above";
        box.appendChild(hint);
      }
      return box;
    }

    // Create a new one
    box = document.createElement("div");
    box.className = "price-box mt-4";
    box.setAttribute("data-service", serviceName);
    box.innerHTML = `
      <div class="price-box-label">Price</div>
      <div class="price-box-value" data-price-value>—</div>
      <div class="price-box-hint">Select a duration above</div>
    `;

    // IMPORTANT: Insert BELOW the button row (mobile-safe)
    const row = groupEl.closest(".d-flex") || groupEl.parentElement;
    if (row && row.insertAdjacentElement) {
      row.insertAdjacentElement("afterend", box);
    } else {
      groupEl.parentElement.appendChild(box);
    }

    return box;
  }

  function updatePriceBox(groupEl) {
    const section =
      groupEl.closest("section") || groupEl.closest("[data-service]") || groupEl.parentElement;

    const h1 = section && section.querySelector("h1") ? section.querySelector("h1") : null;
    const serviceName = normalizeServiceName(
      (h1 && h1.textContent) ? h1.textContent : (groupEl.dataset.service || "Massage")
    );

    const selectedBtn =
      groupEl.querySelector(".btn.selected") || groupEl.querySelector(".btn.btn-light.selected");
    const durationKey = normalizeDuration(
      selectedBtn?.dataset.value || selectedBtn?.getAttribute("data-value") || "60min"
    );

    const box = ensurePriceBox(section, groupEl, serviceName);
    if (!box) return;

    const valueEl = box.querySelector("[data-price-value]") || box.querySelector(".price-box-value");
    const hintEl = box.querySelector(".price-box-hint");

    const price = PRICE_TABLE?.[serviceName]?.[durationKey] ?? "";
    if (valueEl) valueEl.textContent = price ? price : "—";

    if (hintEl) {
      const hintText =
        SERVICE_HINT_TABLE?.[serviceName]?.[durationKey] ||
        `${durationKey.replace("min", " min")}`;
      hintEl.textContent = `Selected: ${hintText}`;
    }
  }

  // Attach to all duration groups in Services
  document.querySelectorAll("#services .radio-buttons-group").forEach((groupEl) => {
    const section = groupEl.closest("section");
    const h1 = section ? section.querySelector("h1") : null;
    const serviceName = normalizeServiceName(h1 ? h1.textContent : "Massage");

    // Ensure box exists (and is in the right place)
    if (section) ensurePriceBox(section, groupEl, serviceName);

    groupEl.addEventListener("change", () => updatePriceBox(groupEl));
    groupEl.addEventListener("click", () => setTimeout(() => updatePriceBox(groupEl), 0));

    updatePriceBox(groupEl);
  });

  // ESC closes overlay/lightbox
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
})();