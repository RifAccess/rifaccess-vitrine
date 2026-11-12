document.documentElement.classList.add("js");

const state = {
  language: localStorage.getItem("rifaccess-language") || "fr",
  messages: null,
  updates: [],
  config: null,
  season: "dry",
  motionReady: false
};

const getValue = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  return response.json();
}

function setTextContent(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getValue(state.messages, element.dataset.i18n);
    if (typeof value === "string") element.textContent = value;
  });

  root.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const value = getValue(state.messages, element.dataset.i18nAlt);
    if (typeof value === "string") element.alt = value;
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const value = getValue(state.messages, element.dataset.i18nAriaLabel);
    if (typeof value === "string") element.setAttribute("aria-label", value);
  });

  root.querySelectorAll("[data-i18n-list]").forEach((list) => {
    const values = getValue(state.messages, list.dataset.i18nList) || [];
    list.replaceChildren(...values.map((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      return item;
    }));
  });
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderMethod() {
  const container = document.querySelector("[data-method-list]");
  if (!container) return;
  const steps = state.messages.method.steps;
  container.replaceChildren(...steps.map((step, index) => {
    const article = makeElement("article", "route-step reveal");
    article.append(
      makeElement("span", "step-number", String(index + 1).padStart(2, "0")),
      makeElement("h3", "", step.title),
      makeElement("p", "", step.description)
    );
    return article;
  }));
}

function renderProvinces() {
  const container = document.querySelector("[data-provinces]");
  if (!container) return;
  container.replaceChildren(...state.messages.territory.provinces.map((province, index) => {
    const article = makeElement("article", "province-panel");
    article.tabIndex = 0;
    article.append(
      makeElement("span", "", `0${index + 1} / 04`),
      makeElement("h3", "", province)
    );
    return article;
  }));
}

function renderCalendar() {
  const container = document.querySelector("[data-calendar]");
  if (!container) return;
  container.replaceChildren(...state.messages.calendar.items.map((item) => {
    const row = makeElement("li", "date-item reveal");
    const body = makeElement("div");
    body.append(makeElement("h3", "", item.title), makeElement("p", "", item.description));
    row.append(makeElement("time", "", item.date), body);
    return row;
  }));
}

function renderTeam() {
  const container = document.querySelector("[data-team]");
  if (!container) return;
  container.replaceChildren(...state.messages.team.members.map((member) => {
    const row = makeElement("article", "team-member reveal");
    row.append(
      makeElement("span", "monogram", member.initials),
      makeElement("h3", "", member.name),
      makeElement("p", "", state.messages.team.role)
    );
    return row;
  }));
}

function renderUpdates() {
  const container = document.querySelector("[data-updates]");
  if (!container) return;
  const formatter = new Intl.DateTimeFormat(state.language === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"
  });
  container.replaceChildren(...state.updates.map((update) => {
    const article = makeElement("article", "update-item reveal");
    const body = makeElement("div", "update-body");
    body.append(
      makeElement("h3", "", update.title[state.language]),
      makeElement("p", "", update.text[state.language])
    );
    const date = formatter.format(new Date(`${update.date}T12:00:00Z`)).replace(".", "");
    article.append(
      makeElement("time", "update-date", date),
      body,
      makeElement("span", "update-tag", update.tag[state.language])
    );
    return article;
  }));
}

function renderCredits() {
  const container = document.querySelector("[data-credits]");
  if (!container) return;
  container.replaceChildren(...state.messages.credits.items.map((credit) => {
    const article = makeElement("article", "credit-item");
    const image = document.createElement("img");
    image.src = credit.image;
    image.alt = credit.alt;
    image.width = 640;
    image.height = 400;
    image.loading = "lazy";
    const body = makeElement("div");
    const meta = makeElement("p", "credit-meta", `${credit.author} · ${credit.licenseName}`);
    const source = makeElement("a", "text-link", state.messages.credits.source);
    source.href = credit.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    const license = makeElement("a", "text-link", state.messages.credits.license);
    license.href = credit.licenseUrl;
    license.target = "_blank";
    license.rel = "noopener noreferrer";
    const links = makeElement("p", "credit-links");
    links.append(source, document.createTextNode(" · "), license);
    body.append(makeElement("h2", "", credit.title), meta, links);
    article.append(image, body);
    return article;
  }));
}

function updateSeasonCopy() {
  const status = document.querySelector(".diagram-status");
  if (status) status.textContent = state.season === "dry" ? state.messages.diagram.dryStatus : state.messages.diagram.rainyStatus;
}

function updateLanguageControls() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === state.language));
  });
}

function updateMetadata() {
  document.title = state.messages.meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = state.messages.meta.description;
}

function updateContact() {
  document.querySelectorAll("[data-contact-link]").forEach((link) => {
    link.href = `mailto:${state.config.contactEmail}`;
  });
  document.querySelectorAll(".app-link").forEach((link) => {
    link.href = state.config.appUrl;
  });
}

function wrapScrubWords() {
  document.querySelectorAll("[data-scrub]").forEach((paragraph) => {
    const words = paragraph.textContent.trim().split(/\s+/);
    paragraph.replaceChildren(...words.flatMap((word, index) => {
      const span = makeElement("span", "scrub-word", word);
      return index === words.length - 1 ? [span] : [span, document.createTextNode(" ")];
    }));
  });
}

function clearMotion() {
  if (!window.ScrollTrigger) return;
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

function setupMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    document.querySelectorAll(".scrub-word").forEach((word) => { word.style.opacity = "1"; });
    return;
  }

  clearMotion();
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(element, { autoAlpha: 0, y: 42 }, {
      autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 88%", once: true }
    });
  });

  gsap.utils.toArray(".image-reveal img").forEach((image) => {
    gsap.timeline({ scrollTrigger: { trigger: image, start: "top 95%", end: "bottom 5%", scrub: 0.8 } })
      .fromTo(image, { scale: 0.82, opacity: 0.45 }, { scale: 1, opacity: 1, ease: "none", duration: 0.5 })
      .to(image, { scale: 1.04, opacity: 0.28, ease: "none", duration: 0.5 });
  });

  const scrubWords = gsap.utils.toArray(".scrub-word");
  if (scrubWords.length) {
    gsap.to(scrubWords, {
      opacity: 1,
      stagger: 0.08,
      ease: "none",
      scrollTrigger: { trigger: "[data-scrub]", start: "top 82%", end: "bottom 38%", scrub: true }
    });
  }

  gsap.utils.toArray(".contours path").forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: { trigger: path.closest("section"), start: "top bottom", end: "bottom top", scrub: 1 }
    });
  });

  const method = document.querySelector(".method");
  const route = document.querySelector(".route-map");
  if (method && route && window.innerWidth > 980) {
    gsap.fromTo(route, { xPercent: 5 }, {
      xPercent: -5,
      ease: "none",
      scrollTrigger: { trigger: method, start: "top 35%", end: "bottom 65%", scrub: 1 }
    });
  }

  state.motionReady = true;
}

async function applyLanguage(language) {
  state.language = language;
  state.messages = await getJson(`/i18n/${language}.json`);
  localStorage.setItem("rifaccess-language", language);
  document.documentElement.lang = language;
  setTextContent();
  updateLanguageControls();
  updateMetadata();
  renderMethod();
  renderProvinces();
  renderCalendar();
  renderTeam();
  renderUpdates();
  renderCredits();
  updateSeasonCopy();
  updateContact();
  wrapScrubWords();
  setupMotion();
}

function setupInteractions() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-nav");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  const diagram = document.querySelector(".access-diagram");
  document.querySelectorAll("[data-season]").forEach((button) => {
    button.addEventListener("click", () => {
      state.season = button.dataset.season;
      document.querySelectorAll("[data-season]").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
      diagram?.classList.toggle("is-rainy", state.season === "rainy");
      updateSeasonCopy();
    });
  });

  document.querySelectorAll(".app-link[aria-disabled='true']").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });
}

async function init() {
  try {
    const [updates, config] = await Promise.all([
      document.querySelector("[data-updates]") ? getJson("/data/updates.json") : Promise.resolve([]),
      getJson("/data/config.json")
    ]);
    state.updates = updates;
    state.config = config;
    setupInteractions();
    await applyLanguage(state.language === "en" ? "en" : "fr");
  } catch (error) {
    console.error(error);
    document.documentElement.classList.remove("js");
  }
}

init();
