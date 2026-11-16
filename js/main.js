/* ------------------------------------------------------------------
   ΣΤΟΙΧΕΙΑ ΕΠΙΚΟΙΝΩΝΙΑΣ — συμπληρώστε τα εδώ.
   Όσα μείνουν κενά εμφανίζονται ως «Σύντομα διαθέσιμο».
------------------------------------------------------------------- */
const CONTACT = {
  email: "",          // π.χ. "info@nomadglamping.gr"
  phone: "",          // π.χ. "+30 690 000 0000"
  place: { el: "", en: "" },   // π.χ. { el: "Πήλιο, Μαγνησία", en: "Pelion, Greece" }
  mapUrl: "",         // σύνδεσμος Google Maps (προαιρετικό)
  instagram: "",      // π.χ. "https://instagram.com/nomadglamping"
  facebook: ""
};

const TODO = { el: "Σύντομα διαθέσιμο", en: "Coming soon" };
let lang = "el";

/* ---------- Contact details ---------- */
function setCell(id, html) {
  const cell = document.getElementById(id);
  if (html) { cell.innerHTML = html; cell.classList.remove("todo"); }
  else { cell.textContent = TODO[lang]; cell.classList.add("todo"); }
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function renderContact() {
  const { email, phone, place, mapUrl, instagram, facebook } = CONTACT;
  setCell("cEmail", email && `<a href="mailto:${esc(email)}">${esc(email)}</a>`);
  setCell("cPhone", phone && `<a href="tel:${esc(phone.replace(/\s/g, ""))}">${esc(phone)}</a>`);
  const placeText = place[lang] || place.el;
  setCell("cPlace", placeText && (mapUrl
    ? `<a href="${esc(mapUrl)}" target="_blank" rel="noopener">${esc(placeText)}</a>`
    : esc(placeText)));
  const social = [["Instagram", instagram], ["Facebook", facebook]]
    .filter(([, url]) => url)
    .map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${name}</a>`)
    .join(" · ");
  setCell("cSocial", social);

  const btn = document.getElementById("mailBtn");
  if (email) {
    const subject = lang === "el" ? "Αίτημα κράτησης" : "Booking request";
    const body = lang === "el"
      ? "Ημερομηνίες:\nΑριθμός ατόμων:\nΣκηνή:\n"
      : "Dates:\nNumber of guests:\nTent:\n";
    btn.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

/* ---------- Language switch (Greek is the HTML default) ---------- */
const i18nNodes = [...document.querySelectorAll("[data-en]")];
i18nNodes.forEach((n) => { n.dataset.el = n.textContent; });
const langBtn = document.getElementById("lang");

function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  i18nNodes.forEach((n) => { n.textContent = n.dataset[lang]; });
  langBtn.textContent = lang === "el" ? "EN" : "ΕΛ";
  langBtn.setAttribute("aria-label", lang === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά");
  document.title = lang === "el"
    ? "Nomad Glamping — Διαμονή στη φύση, με άνεση"
    : "Nomad Glamping — Nature stays, in comfort";
  renderContact();
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
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".section h2, .prose, .perks li, .card, .steps li, .qa, .contact-box");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

document.getElementById("year").textContent = new Date().getFullYear();
