async function includePartials() {
  const includeEls = document.querySelectorAll("[data-include]");

  for (const el of includeEls) {
    const url = el.getAttribute("data-include");
    if (!url) continue;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      el.innerHTML = `<!-- Failed to load partial: ${url} -->`;
      continue;
    }

    const html = await res.text();
    el.innerHTML = html;
  }

  // Mobile menu toggle (works once header is injected)
  const btn = document.querySelector("[data-mobile-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (btn && menu) {
    btn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  }

  // Footer year (works once footer is injected)
  const yearEl = document.querySelector("[data-current-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", includePartials);
