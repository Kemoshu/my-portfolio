const THEME_KEY = "kr-theme";

const nav = document.getElementById("site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector(".theme-toggle");
const copyButton = document.querySelector(".copy-email");
const yearSlot = document.getElementById("year");

/* theme */

const setTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
};

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

/* mobile nav */

const closeNav = () => {
  nav?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("no-scroll", isOpen);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});

/* active nav link while scrolling */

const sections = document.querySelectorAll("main section[id]");
const navLinks = new Map(
  [...(nav?.querySelectorAll('a[href^="#"]') || [])].map((link) => [
    link.getAttribute("href").slice(1),
    link,
  ]),
);

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((l) => l.classList.remove("active"));
        navLinks.get(entry.target.id)?.classList.add("active");
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );
  sections.forEach((section) => spy.observe(section));
}

/* reveal on scroll */

const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reducedMotion && "IntersectionObserver" in window) {
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealItems.forEach((item) => revealer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

/* copy email */

copyButton?.addEventListener("click", async () => {
  const email = copyButton.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = "Copied";
  } catch (error) {
    copyButton.textContent = email;
  }
  setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 2000);
});

/* footer year */

if (yearSlot) {
  yearSlot.textContent = new Date().getFullYear();
}
