/* ============================= */
/*          FOOTER YEAR          */
/* ============================= */

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ============================= */
/*            MAIL               */
/* ============================= */

function sendMail(e) {
  e.preventDefault();

  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const msg = document.getElementById("message")?.value.trim();

  if (!name || !email || !msg) return;

  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${msg}`
  );

  window.location.href =
    `mailto:gizem@gueney.org?subject=Portfolio Kontakt – ${encodeURIComponent(name)}&body=${body}`;
}

/* ============================= */
/*        SCROLL REVEAL           */
/* ============================= */

(function () {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

  els.forEach(el => io.observe(el));
})();

/* ============================= */
/*          THEME TOGGLE          */
/* ============================= */

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  });
}

/* ============================= */
/*         HEADER SCROLL          */
/* ============================= */

const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  const scrolled = window.scrollY > 60;

  // Header Blur
  header.classList.toggle("scrolled-glass", scrolled);

  // Page-Scroll State (für Überschriften)
  document.body.classList.toggle("page-scrolled", scrolled);
});


/* ============================= */
/*        SCROLLBAR STATE         */
/* ============================= */

let scrollbarActivated = false;
window.addEventListener("scroll", () => {
  if (!scrollbarActivated && window.scrollY > 20) {
    document.documentElement.classList.add("has-scrolled");
    scrollbarActivated = true;
  }
});

/* ============================= */
/*         DONUT LOADER           */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("donut-loader");
  const video = loader?.querySelector("video");

  if (loader) loader.classList.remove("active");

  document.querySelectorAll("a[href]").forEach(link => {
    const url = link.getAttribute("href");
    if (!url || url.startsWith("#") || link.target === "_blank") return;

    link.addEventListener("click", () => {
      if (!loader) return;
      loader.classList.add("active");
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
  });
});

/*Alter*/
(function () {
  const birthDate = new Date(2004, 0, 5); // 05.01.2004 (Monat = 0!)
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
     today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  const ageEl = document.getElementById("age");
  if (ageEl) {
    ageEl.textContent = age;
  }
})();

/*scroll to top*/

const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > window.innerHeight / 2) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
