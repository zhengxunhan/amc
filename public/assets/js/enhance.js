(() => {
  const $ = (id) => document.getElementById(id);

  // Sticky "Call" button (bottom-right)
  // (Fallback to stickyBookBtn id in case an older HTML copy is still in use)
  const stickyBtn = $("stickyCallBtn") || $("stickyBookBtn");

  function updateSticky() {
    if (!stickyBtn) return;
    stickyBtn.style.display = window.scrollY > 450 ? "block" : "none";
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

  // Enable lightbox for instagram images (your site uses instagram-#.jpg)
  document.querySelectorAll('img[src*="instagram-"]').forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(img.src, img.alt);
    });
  });

  // ---------- Reveal-on-scroll ----------
  const revealTargets = document.querySelectorAll(".section-content, .hero-foreground, .card, img.w-100, .faq");
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


  // ===== Price Box under each service duration selector =====
  // Edit the prices below (or leave blank to show "—")
  const PRICE_TABLE = {
    "Swedish Massage": { "30min": "$50", "60min": "$70", "90min": "$100", "120min": "$140" },
    "Deep Tissue Massage": { "30min": "$50", "60min": "$70", "90min": "$100", "120min": "$140" },
    "Couples Massage": { "60min": "$130", "90min": "$190", "120min": "$260" },
    "Foot Massage": {"60min": "$60"}
  };

  function normalizeDuration(val){
    return String(val || "").toLowerCase().replace(/\s+/g,"").replace(/\./g,"");
  }

  function updatePriceBox(groupEl){
    const section = groupEl.closest("section") || groupEl.closest("[data-service]") || groupEl.parentElement;
    // try to infer service name from nearest H1 in this section
    const h1 = (section && section.querySelector("h1")) ? section.querySelector("h1") : null;
    const serviceName = (h1 && h1.textContent) ? h1.textContent.trim() : (groupEl.dataset.service || "Massage");
    const selectedBtn = groupEl.querySelector(".btn.selected") || groupEl.querySelector(".btn.btn-light.selected");
    const durationKey = normalizeDuration(selectedBtn?.dataset.value || selectedBtn?.getAttribute("data-value") || "60min");

    const box = section?.querySelector('.price-box[data-service="'+serviceName+'"]') || section?.querySelector(".price-box");
    if (!box) return;
    const valueEl = box.querySelector("[data-price-value]");
    if (!valueEl) return;

    const price = PRICE_TABLE?.[serviceName]?.[durationKey] ?? "";
    valueEl.textContent = price ? price : "—";
    const hint = box.querySelector(".price-box-hint");
    if (hint) hint.textContent = `Selected: ${durationKey.replace("min"," min")}`;
  }

  // Attach to all duration groups in Services
  document.querySelectorAll("#services .radio-buttons-group").forEach(groupEl => {
    // ensure a price box exists (in case HTML doesn't have it)
    const section = groupEl.closest("section");
    if (section && !section.querySelector(".price-box")) {
      const h1 = section.querySelector("h1");
      const serviceName = h1 ? h1.textContent.trim() : "Massage";
      const box = document.createElement("div");
      box.className = "price-box mt-4";
      box.setAttribute("data-service", serviceName);
      box.innerHTML = `
        <div class="price-box-label">Price</div>
        <div class="price-box-value" data-price-value>—</div>
        <div class="price-box-hint">Select a duration above</div>
      `;
      // insert after group
      groupEl.parentElement.appendChild(box);
    }

    // app.js triggers "change" on the group, but we can also listen for clicks
    groupEl.addEventListener("change", () => updatePriceBox(groupEl));
    groupEl.addEventListener("click", () => setTimeout(() => updatePriceBox(groupEl), 0));
    // initial
    updatePriceBox(groupEl);
  });

  // ESC closes overlay/lightbox
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
    }
  });
})();
