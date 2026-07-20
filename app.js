(function () {
  "use strict";

  const DEFAULTS = {
    nombre_restaurante: "Asados La Fama",
    eslogan: "Sabor y calidad",
    whatsapp: "573053864006",
    mensaje_whatsapp: "Hola, vi el menú digital de Asados La Fama y quiero hacer un pedido.",
    direccion: "Centro Comercial La Gran Manzana\nSegundo piso, local 227\nItagüí, Antioquia",
    horario: "Consulta nuestro horario por WhatsApp",
    texto_domicilios: "Domicilios disponibles",
    instagram: "https://instagram.com/asadoslafamaoficial",
    estado_restaurante: "abierto",
    mensaje_destacado: ""
  };
  const CONFIG = Object.assign({ PRODUCTS_CSV_URL: "", SETTINGS_CSV_URL: "", LOCAL_FALLBACK_URL: "menu-ejemplo.json", CACHE_MINUTES: 5 }, window.MENU_CONFIG || {});
  const state = { products: [], settings: { ...DEFAULTS }, category: "Todos", query: "" };
  const $ = (selector) => document.querySelector(selector);

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    setupEvents();
    setupLogoFallback();
    const [productsResult, settingsResult] = await Promise.allSettled([loadProducts(), loadSettings()]);
    if (settingsResult.status === "fulfilled") state.settings = { ...DEFAULTS, ...settingsResult.value };
    applySettings();
    if (productsResult.status === "fulfilled" && productsResult.value.products.length) {
      state.products = productsResult.value.products;
      if (productsResult.value.fallback) showSourceNotice("Mostramos el menú de respaldo porque Google Sheets no respondió. Puedes seguir consultando y haciendo pedidos.");
      renderAll();
    } else {
      showFatalError();
    }
    $("#loadingState").hidden = true;
  }

  function setupEvents() {
    $("#searchInput").addEventListener("input", (event) => { state.query = normalize(event.target.value); renderProducts(); });
    $("#categoryFilters").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      renderFilters(); renderProducts();
    });
    $("#backToTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => $("#backToTop").classList.toggle("is-visible", window.scrollY > 520), { passive: true });
  }

  function setupLogoFallback() {
    const logo = $("#logo");
    const fallback = $("#brandFallback");
    logo.addEventListener("error", () => { logo.hidden = true; fallback.hidden = false; });
  }

  async function loadProducts() {
    const remoteUrl = cleanUrl(CONFIG.PRODUCTS_CSV_URL);
    if (remoteUrl) {
      try {
        const rows = await fetchCsv(remoteUrl);
        const products = rows.map(normalizeProduct).filter((p) => p.id && p.nombre);
        if (products.length) return { products: sortProducts(products), fallback: false };
        throw new Error("La hoja de productos no contiene filas válidas.");
      } catch (error) { console.warn("No se pudo cargar Google Sheets; se usará el respaldo local.", error); }
    }
    const response = await fetch(CONFIG.LOCAL_FALLBACK_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar el menú local.");
    const data = await response.json();
    return { products: sortProducts((data.productos || data).map(normalizeProduct).filter((p) => p.id && p.nombre)), fallback: Boolean(remoteUrl) };
  }

  async function loadSettings() {
    const remoteUrl = cleanUrl(CONFIG.SETTINGS_CSV_URL);
    if (!remoteUrl) return DEFAULTS;
    try {
      const rows = await fetchCsv(remoteUrl);
      return rows.reduce((acc, row) => {
        const key = normalizeKey(row.clave || row.campo || row.key || "");
        const value = row.valor ?? row.value ?? "";
        if (key) acc[key] = String(value).trim();
        return acc;
      }, {});
    } catch (error) {
      console.warn("No se pudo cargar la configuración remota; se usarán los datos predeterminados.", error);
      return DEFAULTS;
    }
  }

  async function fetchCsv(url) {
    const separator = url.includes("?") ? "&" : "?";
    const cacheMs = Math.max(1, Number(CONFIG.CACHE_MINUTES) || 5) * 60000;
    const response = await fetch(`${url}${separator}_=${Math.floor(Date.now() / cacheMs)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Google Sheets respondió ${response.status}.`);
    return csvToObjects(await response.text());
  }

  function csvToObjects(text) {
    const rows = []; let row = []; let field = ""; let quoted = false;
    const source = String(text).replace(/^\uFEFF/, "");
    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      if (char === '"' && quoted && source[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { row.push(field); field = ""; }
      else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && source[i + 1] === "\n") i += 1;
        row.push(field); field = ""; if (row.some((cell) => cell.trim() !== "")) rows.push(row); row = [];
      } else field += char;
    }
    row.push(field); if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    if (rows.length < 2) return [];
    const headers = rows[0].map(normalizeKey);
    return rows.slice(1).map((cells) => headers.reduce((obj, header, index) => { if (header) obj[header] = (cells[index] || "").trim(); return obj; }, {}));
  }

  function normalizeProduct(raw) {
    return {
      id: String(raw.id || "").trim(), categoria: String(raw.categoria || "Sin categoría").trim(),
      nombre: String(raw.nombre || "").trim(), descripcion: String(raw.descripcion || "").trim(),
      precio: parsePrice(raw.precio), imagen: safeImageUrl(raw.imagen), disponible: parseBoolean(raw.disponible, true),
      etiqueta: String(raw.etiqueta || "").trim(), destacado: parseBoolean(raw.destacado, false),
      orden: Number.parseFloat(String(raw.orden || "9999").replace(",", ".")) || 9999,
      agotado_modo: normalize(raw.agotado_modo || "mostrar")
    };
  }

  function sortProducts(products) { return products.sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es")); }
  function parseBoolean(value, fallback) { if (value === undefined || value === null || value === "") return fallback; return ["si", "sí", "true", "1", "yes", "x"].includes(normalize(value)); }
  function parsePrice(value) { const digits = String(value ?? "0").replace(/[^0-9-]/g, ""); return Number(digits) || 0; }
  function safeImageUrl(value) { const url = String(value || "").trim(); return /^(https?:\/\/|assets\/img\/)/i.test(url) ? url : ""; }
  function cleanUrl(value) { const url = String(value || "").trim(); return !url || url.includes("PEGA_AQUI") ? "" : url; }
  function normalize(value) { return String(value || "").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function normalizeKey(value) { return normalize(value).replace(/\s+/g, "_"); }
  function formatPrice(value) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value).replace(/\s/g, ""); }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }

  function applySettings() {
    const s = state.settings;
    document.title = `${s.nombre_restaurante} | Menú digital`;
    ["#restaurantName", "#footerName"].forEach((id) => $(id).textContent = s.nombre_restaurante);
    $("#slogan").textContent = s.eslogan; $("#footerSlogan").textContent = s.eslogan;
    $("#address").innerHTML = escapeHtml(s.direccion).replace(/\n/g, "<br>");
    $("#schedule").textContent = s.horario; $("#deliveryText").textContent = s.texto_domicilios;
    const daily = $("#dailyMessage"); daily.textContent = s.mensaje_destacado; daily.hidden = !s.mensaje_destacado;
    const status = $("#openStatus"); const isOpen = normalize(s.estado_restaurante) === "abierto";
    status.textContent = isOpen ? "● Abierto hoy" : "● Cerrado en este momento — puedes consultar el menú";
    status.classList.toggle("is-open", isOpen); status.hidden = false;
    const phone = String(s.whatsapp).replace(/\D/g, "") || DEFAULTS.whatsapp;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(s.mensaje_whatsapp)}`;
    ["#heroWhatsapp", "#footerWhatsapp", "#floatingWhatsapp", "#weeklyWhatsapp"].forEach((id) => $(id).href = whatsappUrl);
    $("#footerWhatsapp").textContent = `WhatsApp: ${formatPhone(phone)}`;
    const instagram = $("#instagramLink"); if (/^https?:\/\//i.test(s.instagram)) { instagram.href = s.instagram; instagram.textContent = "@asadoslafamaoficial"; instagram.hidden = false; }
  }

  function formatPhone(phone) { const local = phone.startsWith("57") ? phone.slice(2) : phone; return local.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3"); }
  function renderAll() { renderFilters(); renderWeeklySpecial(); renderProducts(); }
  function visibleProducts() { return state.products.filter((p) => p.disponible || p.agotado_modo !== "ocultar"); }

  function renderWeeklySpecial() {
    const product = visibleProducts().find((p) => normalize(p.id) === "especial-semana");
    const section = $("#weeklySection");
    if (!product) { section.hidden = true; return; }
    $("#weeklyTitle").textContent = product.nombre;
    $("#weeklyDescription").textContent = product.descripcion || "Cada semana preparamos una opción diferente con el sabor de la casa.";
    $("#weeklyPrice").textContent = formatPrice(product.precio);
    $("#weeklyBadge").textContent = product.disponible ? (product.etiqueta || "Especial") : "Agotado";
    section.classList.toggle("is-sold-out", !product.disponible);
    section.hidden = false;
  }

  function renderFilters() {
    const categories = ["Todos", ...new Set(visibleProducts().filter((p) => normalize(p.id) !== "especial-semana").map((p) => p.categoria))];
    $("#categoryFilters").innerHTML = categories.map((category) => `<button class="category-button" type="button" data-category="${escapeHtml(category)}" aria-pressed="${state.category === category}">${escapeHtml(category)}</button>`).join("");
  }

  function renderProducts() {
    const query = state.query;
    const products = visibleProducts().filter((p) => normalize(p.id) !== "especial-semana").filter((p) => (state.category === "Todos" || p.categoria === state.category) && (!query || normalize(`${p.nombre} ${p.descripcion} ${p.categoria} ${p.etiqueta}`).includes(query)));
    const featured = products.filter((p) => p.destacado && p.disponible);
    const featuredSection = $("#featuredSection"); featuredSection.hidden = featured.length === 0 || state.category !== "Todos" || Boolean(query);
    $("#featuredGrid").innerHTML = featured.slice(0, 6).map(productCard).join("");
    const grouped = products.reduce((acc, product) => { (acc[product.categoria] ||= []).push(product); return acc; }, {});
    $("#menuSections").innerHTML = Object.entries(grouped).map(([category, items]) => `<section class="category-section" aria-labelledby="cat-${slugify(category)}"><h3 class="category-title" id="cat-${slugify(category)}">${escapeHtml(category)}</h3><div class="product-grid">${items.map(productCard).join("")}</div></section>`).join("");
    $("#emptyState").hidden = products.length > 0;
    attachImageFallbacks();
  }

  function productCard(product) {
    const sold = !product.disponible;
    const label = sold ? "Agotado" : product.etiqueta;
    const image = product.imagen ? `<img src="${escapeHtml(product.imagen)}" alt="${escapeHtml(product.nombre)}" loading="lazy" decoding="async">` : "";
    return `<article class="product-card${sold ? " is-sold-out" : ""}"><div class="product-card__media${image ? " has-image" : ""}" data-icon="${categoryIcon(product.categoria)}">${image}${label ? `<span class="badge${sold ? " badge--sold" : ""}">${escapeHtml(label)}</span>` : ""}</div><div class="product-card__body"><div class="product-card__top"><h3>${escapeHtml(product.nombre)}</h3><span class="product-card__price">${formatPrice(product.precio)}</span></div>${product.descripcion ? `<p class="product-card__description">${escapeHtml(product.descripcion)}</p>` : ""}</div></article>`;
  }

  function categoryIcon(category) {
    const value = normalize(category);
    if (value.includes("cerveza")) return "🍺";
    if (value.includes("bebida")) return value.includes("sin alcohol") ? "🧃" : "🥤";
    return "🍖";
  }

  function attachImageFallbacks() { document.querySelectorAll(".product-card__media img").forEach((img) => img.addEventListener("error", () => { img.parentElement.classList.remove("has-image"); img.remove(); }, { once: true })); }
  function slugify(value) { return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "categoria"; }
  function showSourceNotice(message) { const notice = $("#sourceNotice"); notice.textContent = message; notice.hidden = false; }
  function showFatalError() { showSourceNotice("No pudimos cargar el menú en este momento. Intenta recargar la página o escríbenos por WhatsApp."); $("#menuSections").innerHTML = ""; }
})();
