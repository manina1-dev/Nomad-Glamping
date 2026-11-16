let lang = "el";

/* ---------- Language switch (Greek is the HTML default) ---------- */
const i18nNodes = [...document.querySelectorAll("[data-en]")];
i18nNodes.forEach((n) => { n.dataset.el = n.textContent; });
const altNodes = [...document.querySelectorAll("img[data-alt-en]")];
altNodes.forEach((n) => { n.dataset.altEl = n.alt; });
const langBtn = document.getElementById("lang");

function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  i18nNodes.forEach((n) => { n.textContent = n.dataset[lang]; });
  altNodes.forEach((n) => { n.alt = lang === "el" ? n.dataset.altEl : n.dataset.altEn; });
  langBtn.textContent = lang === "el" ? "EN" : "ΕΛ";
  langBtn.setAttribute("aria-label", lang === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά");
  document.title = lang === "el"
    ? "Nomad Glamping | Glamping με ιδιωτική πισίνα | Σχοινιάς"
    : "Nomad Glamping | property with private pool | Schinias, Greece";
  const waText = lang === "el"
    ? "Γεια σας! Ενδιαφέρομαι για διαμονή στο Nomad Glamping.\nΗμερομηνίες: \nΆτομα: "
    : "Hello! I am interested in staying at Nomad Glamping.\nDates: \nGuests: ";
  document.querySelectorAll("a[data-wa]").forEach((a) => {
    a.href = "https://wa.me/306974046224?text=" + encodeURIComponent(waText);
  });
  try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
}
langBtn.addEventListener("click", () => setLang(lang === "el" ? "en" : "el"));

let saved = null;
try { saved = localStorage.getItem("lang"); } catch (e) { /* ignore */ }
const browserEl = (navigator.language || "el").toLowerCase().startsWith("el");
setLang(saved || (browserEl ? "el" : "en"));

/* ---------- Nav ---------- */
const nav = document.getElementById("nav");
const menu = document.getElementById("menu");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open) {
  menu.classList.toggle("open", open);
  nav.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

/* ---------- Gallery lightbox ---------- */
const box = document.getElementById("lightbox");
const boxImg = document.getElementById("lbImg");
const boxCap = document.getElementById("lbCap");
const shots = [...document.querySelectorAll("#grid a")];
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
document.getElementById("lbPrev").addEventListener("click", () => show(current - 1));
document.getElementById("lbNext").addEventListener("click", () => show(current + 1));
document.getElementById("lbClose").addEventListener("click", () => box.close());
box.addEventListener("click", (e) => { if (e.target === box) box.close(); });

let touchX = null;
box.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
box.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

document.addEventListener("keydown", (e) => {
  if (box.open) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  } else if (e.key === "Escape") {
    setMenu(false);
  }
});

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".section h2, .prose, .collage, .card, .note, .contact-box");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.1 });
  revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

document.getElementById("year").textContent = new Date().getFullYear();
