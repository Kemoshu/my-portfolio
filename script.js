const nav = document.getElementById("site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector(".theme-toggle");
const repoList = document.querySelector("[data-repo-list]") || document.querySelector(".repo-list");
const repoEmpty = document.querySelector("[data-repo-empty]") || document.querySelector(".repo-empty");
const contactForm = document.querySelector(".contact-form");
const feedback = document.querySelector(".form-feedback");
const yearSlot = document.getElementById("year");

const GITHUB_USERNAME = "Kemoshu";
const THEME_STORAGE_KEY = "portfolio-theme";

const focusableSelectors = "a[href], button:not([disabled]), input, select, textarea";

const state = {
  navOpen: false,
  theme: "dark",
};

const getRepoLimit = () => {
  if (!repoList) return 5;
  const limit = Number.parseInt(repoList.dataset.repoLimit || "5", 10);
  return Number.isNaN(limit) || limit <= 0 ? 5 : limit;
};

const repoLimit = getRepoLimit();

const applyTheme = (theme) => {
  state.theme = theme;
  document.body.classList.toggle("theme-dark", theme === "dark");
  document.body.classList.toggle("theme-light", theme === "light");
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (themeToggle) {
    const icon = theme === "dark" ? "☀️" : "🌙";
    themeToggle.querySelector(".theme-toggle-icon").textContent = icon;
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }
};

const initTheme = () => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = stored || (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);
};

const toggleNav = (forceState) => {
  if (!nav) return;
  const isOpen = typeof forceState === "boolean" ? forceState : !state.navOpen;
  state.navOpen = isOpen;
  nav.classList.toggle("open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("no-scroll", isOpen);

  if (isOpen) {
    document.addEventListener("click", handleOutsideNavClick);
    const focusable = nav.querySelectorAll(focusableSelectors);
    focusable[0]?.focus();
  } else {
    document.removeEventListener("click", handleOutsideNavClick);
    menuToggle?.focus();
  }
};

const handleOutsideNavClick = (event) => {
  if (!nav.contains(event.target) && !(menuToggle && menuToggle.contains(event.target))) {
    toggleNav(false);
  }
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

const renderRepos = (repos) => {
  if (!repoList) {
    return;
  }

  repoList.innerHTML = "";
  if (!repos.length) {
    if (repoEmpty) {
      repoEmpty.innerHTML = "<p>No repositories found yet. Try adding some public projects.</p>";
      repoEmpty.hidden = false;
    }
    return;
  }

  if (repoEmpty) {
    repoEmpty.hidden = true;
  }

  repos.forEach((repo) => {
    const tags = [];
    if (repo.language) {
      tags.push(repo.language);
    }

    const card = document.createElement("article");
    card.className = "repo-card";
    card.innerHTML = `
      <div class="repo-header">
        <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noopener">
          ${repo.name}
        </a>
        <span class="repo-meta">Updated ${formatDate(repo.pushed_at)}</span>
      </div>
      <p>${repo.description ? repo.description : "No description yet."}</p>
      ${tags.length ? `<div class="repo-tags">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>` : ""}
    `;
    repoList.appendChild(card);
  });
};

const fetchRepos = async () => {
  if (!repoList) return;

  if (repoEmpty) {
    repoEmpty.hidden = false;
    repoEmpty.innerHTML = "<p>Loading repositories...</p>";
  }

  if (!GITHUB_USERNAME || GITHUB_USERNAME === "your-github-username") {
    if (repoEmpty) {
      repoEmpty.innerHTML =
        "<p>Update <code>GITHUB_USERNAME</code> in <code>script.js</code> to load your repositories.</p>";
    }
    return;
  }

  try {
    const perPage = Math.min(Math.max(repoLimit, 1), 100);
    const apiUrl = new URL(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos`,
    );
    apiUrl.searchParams.set("sort", repoList.dataset.repoSort || "updated");
    apiUrl.searchParams.set("per_page", String(perPage));

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    let repos = Array.isArray(data) ? data : [];
    if (repoList.dataset.includeForks !== "true") {
      repos = repos.filter((repo) => !repo.fork);
    }
    renderRepos(repos);
  } catch (error) {
    if (repoEmpty) {
      repoEmpty.innerHTML = `<p>Unable to load repositories. ${error.message}</p>`;
      repoEmpty.hidden = false;
    }
  }
};

const validateForm = () => {
  if (!contactForm) return { valid: false, message: "Form not found." };

  const name = contactForm.elements.namedItem("name");
  const email = contactForm.elements.namedItem("email");
  const message = contactForm.elements.namedItem("message");

  if (!name.value.trim()) {
    return { valid: false, message: "Please add your name." };
  }

  if (!email.value.trim()) {
    return { valid: false, message: "Please provide an email address." };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    return { valid: false, message: "That email address doesn’t look right." };
  }

  if (!message.value.trim()) {
    return { valid: false, message: "Let me know how I can help." };
  }

  return { valid: true };
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  if (!feedback) return;

  const result = validateForm();
  feedback.textContent = "";
  feedback.classList.remove("error", "success");

  if (!result.valid) {
    feedback.textContent = result.message;
    feedback.classList.add("error");
    return;
  }

  feedback.textContent = "Thanks! I’ll be in touch soon.";
  feedback.classList.add("success");
  contactForm.reset();
};

const init = () => {
  initTheme();

  menuToggle?.addEventListener("click", () => toggleNav());
  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleNav(false));
  });

  themeToggle?.addEventListener("click", () => {
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });

  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);
  }

  if (yearSlot) {
    yearSlot.textContent = new Date().getFullYear();
  }

  fetchRepos();
};

document.addEventListener("DOMContentLoaded", init);
