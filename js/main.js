let lang = "el";

/* ---------- Language switch (Greek is the HTML default) ---------- */
const i18nNodes = [...document.querySelectorAll("[data-en]")];
i18nNodes.forEach((n) => { n.dataset.el = n.textContent; });
const altNodes = [...document.querySelectorAll("img[data-alt-en]")];
altNodes.forEach((n) => { n.dataset.altEl = n.alt; });
const langButtons = [...document.querySelectorAll(".lang")];
const moreBtn = document.getElementById("moreBtn");
const grid = document.getElementById("grid");
const shots = grid ? [...grid.querySelectorAll("a")] : [];

function moreLabel() {
  if (grid.classList.contains("open")) return lang === "el" ? "Λιγότερες φωτογραφίες" : "Show fewer photos";
  return (lang === "el" ? "Όλες οι φωτογραφίες" : "Show all photos") + ` (${shots.length})`;
}

function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  i18nNodes.forEach((n) => { n.textContent = n.dataset[lang]; });
  altNodes.forEach((n) => { n.alt = lang === "el" ? n.dataset.altEl : n.dataset.altEn; });
  langButtons.forEach((b) => {
    b.textContent = lang === "el" ? "EN" : "ΕΛ";
    b.setAttribute("aria-label", lang === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά");
  });
  const root = document.documentElement.dataset;
  document.title = lang === "el"
    ? (root.titleEl || "Nomad Glamping | Glamping με ιδιωτική πισίνα | Σχοινιάς")
    : (root.titleEn || "Nomad Glamping | property with private pool | Schinias, Greece");
  const waText = lang === "el"
    ? "Γεια σας! Ενδιαφέρομαι για διαμονή στο Nomad Glamping.\nΗμερομηνίες: \nΆτομα: "
    : "Hello! I am interested in staying at Nomad Glamping.\nDates: \nGuests: ";
  const giftText = lang === "el"
    ? "Γεια σας! Θα ήθελα μια δωροκάρτα για διαμονή στο Nomad Glamping.\nΔιανυκτερεύσεις: \nΆτομα: "
    : "Hello! I would like a gift card for a stay at Nomad Glamping.\nNights: \nGuests: ";
  document.querySelectorAll("a[data-wa]").forEach((a) => {
    const text = a.dataset.wa === "gift" ? giftText : waText;
    a.href = "https://wa.me/306974046224?text=" + encodeURIComponent(text);
  });
  const map = document.querySelector(".map-frame iframe");
  if (map) {
    const src = map.getAttribute("src").replace(/hl=(el|en)/, "hl=" + lang);
    if (src !== map.getAttribute("src")) map.setAttribute("src", src);
  }
  if (moreBtn) moreBtn.textContent = moreLabel();
  document.dispatchEvent(new CustomEvent("langchange"));
  try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
}
langButtons.forEach((b) => b.addEventListener("click", () => setLang(lang === "el" ? "en" : "el")));

let saved = null;
try { saved = localStorage.getItem("lang"); } catch (e) { /* ignore */ }
const browserEl = (navigator.language || "el").toLowerCase().startsWith("el");
setLang(saved || (browserEl ? "el" : "en"));

/* ---------- Header & full-screen menu ---------- */
const nav = document.getElementById("nav");
const menu = document.getElementById("menu");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add("open"));
  } else {
    menu.classList.remove("open");
    setTimeout(() => { if (!menu.classList.contains("open")) menu.hidden = true; }, 350);
  }
}
toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.querySelector(".nav .book").addEventListener("click", () => setMenu(false));

/* ---------- Gallery: show 12, expand to all ---------- */
if (moreBtn) moreBtn.addEventListener("click", () => {
  const opening = !grid.classList.contains("open");
  grid.classList.toggle("open", opening);
  moreBtn.textContent = moreLabel();
  if (!opening) document.getElementById("gallery").scrollIntoView();
});

/* ---------- Lightbox ---------- */
const box = document.getElementById("lightbox");
const boxImg = document.getElementById("lbImg");
const boxCap = document.getElementById("lbCap");
let current = 0;

function show(i) {
  current = (i + shots.length) % shots.length;
  const thumb = shots[current].querySelector("img");
  boxImg.src = shots[current].href;
  boxImg.alt = thumb.alt;
  boxCap.textContent = `${thumb.alt} · ${current + 1} / ${shots.length}`;
}
shots.forEach((a, i) => a.addEventListener("click", (e) => {
  e.preventDefault();
  show(i);
  box.showModal();
}));
document.getElementById("lbPrev")?.addEventListener("click", () => show(current - 1));
document.getElementById("lbNext")?.addEventListener("click", () => show(current + 1));
document.getElementById("lbClose")?.addEventListener("click", () => box.close());
box?.addEventListener("click", (e) => { if (e.target === box) box.close(); });

let touchX = null;
box?.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
box?.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

document.addEventListener("keydown", (e) => {
  if (box && box.open) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  } else if (e.key === "Escape" && !menu.hidden) {
    setMenu(false);
  }
});

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".intro-head > *, .duo-main, .duo-side, .specs, .center-head, .room, .band-copy, .info-grid, .cal, .gift-grid, .contact-grid, .location, .area-head, .place, .area-cta");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

/* ---------- Availability calendar (dates only, synced from Airbnb) ---------- */
(function () {
  const cal = document.getElementById("cal");
  if (!cal) return;
  const monthsEl = document.getElementById("calMonths");
  const prev = document.getElementById("calPrev");
  const next = document.getElementById("calNext");
  const empty = document.getElementById("calEmpty");
  const WD = { el: ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"], en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] };
  const MONTHS = {
    el: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  };
  const pad = (n) => String(n).padStart(2, "0");
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const MAX_AHEAD = 11;
  let offset = 0;
  let booked = null;

  function month(y, m) {
    const start = new Date(y, m, 1);
    const lead = (start.getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    let html = `<div class="cal-month"><h3>${MONTHS[lang][m]} ${y}</h3><div class="cal-grid">`;
    html += WD[lang].map((w) => `<span class="wd">${w}</span>`).join("");
    for (let i = 0; i < lead; i++) html += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const k = key(date);
      const cls = date < today ? "past" : booked.has(k) ? "booked" : "free";
      const label = cls === "booked" ? (lang === "el" ? "κλεισμένο" : "booked") : cls === "free" ? (lang === "el" ? "διαθέσιμο" : "available") : "";
      html += `<span class="d ${cls}${k === key(today) ? " today" : ""}"${label ? ` aria-label="${d} ${MONTHS[lang][m]}: ${label}"` : ""}>${d}</span>`;
    }
    return html + "</div></div>";
  }

  function render() {
    if (!booked) return;
    const a = new Date(first.getFullYear(), first.getMonth() + offset, 1);
    const b = new Date(a.getFullYear(), a.getMonth() + 1, 1);
    monthsEl.innerHTML = month(a.getFullYear(), a.getMonth()) + month(b.getFullYear(), b.getMonth());
    prev.disabled = offset <= 0;
    next.disabled = offset >= MAX_AHEAD;
    prev.setAttribute("aria-label", lang === "el" ? "Προηγούμενος μήνας" : "Previous month");
    next.setAttribute("aria-label", lang === "el" ? "Επόμενος μήνας" : "Next month");
  }

  function showEmpty() { cal.classList.add("is-empty"); empty.hidden = false; }

  prev.addEventListener("click", () => { if (offset > 0) { offset--; render(); } });
  next.addEventListener("click", () => { if (offset < MAX_AHEAD) { offset++; render(); } });
  document.addEventListener("langchange", render);

  const remote = "https://raw.githubusercontent.com/manina1-dev/Nomad-Glamping/gh-pages/assets/availability.json";
  const load = (url) => fetch(url + "?t=" + Date.now(), { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  load(remote).catch(() => load("assets/availability.json")).then((data) => {
    if (!data || !Array.isArray(data.unavailable)) return showEmpty();
    booked = new Set();
    data.unavailable.forEach(([s, e]) => {
      const [ys, ms, ds] = s.split("-").map(Number);
      const [ye, me, de] = e.split("-").map(Number);
      for (let d = new Date(ys, ms - 1, ds), end = new Date(ye, me - 1, de); d < end; d.setDate(d.getDate() + 1)) booked.add(key(d));
    });
    render();
  }).catch(showEmpty);
})();

document.getElementById("year").textContent = new Date().getFullYear();
