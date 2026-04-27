const SITE_TITLE = "Taller de Programación Competitiva";
const SITE_VERSION = "v1.2.3";
const MOBILE_NAV_BREAKPOINT = 760;
const NAV_ITEMS = [
  { key: "home", label: "Inicio", href: "index.html" },
  { key: "years", label: "Años", href: "years.html" },
  { key: "speakers", label: "Instructores", href: "speakers.html" },
];

let dataCache = null;

function appendChildren(parent, children = []) {
  children.flat().filter(Boolean).forEach((child) => parent.appendChild(child));
  return parent;
}

function renderSiteVersion() {
  document.querySelectorAll("[data-site-version]").forEach((node) => {
    node.textContent = SITE_VERSION;
    node.setAttribute("aria-label", `Versión del sitio ${SITE_VERSION}`);
    node.setAttribute("title", `Versión del sitio ${SITE_VERSION}`);
  });
}

function ensureResponsiveNav(navRoot) {
  if (!navRoot) return;

  const topbarInner = navRoot.closest(".topbar__inner");
  if (!topbarInner) return;

  let toggleButton = document.getElementById("nav-toggle");
  if (!toggleButton) {
    toggleButton = el(
      "button",
      {
        id: "nav-toggle",
        className: "nav-toggle",
        ariaLabel: "Abrir menú de navegación",
        attributes: {
          type: "button",
          "aria-controls": "nav-root",
          "aria-expanded": "false",
        },
      },
      [
        el("span", { className: "nav-toggle__bar" }),
        el("span", { className: "nav-toggle__bar" }),
        el("span", { className: "nav-toggle__bar" }),
      ]
    );
    topbarInner.insertBefore(toggleButton, navRoot);
  }

  const closeMenu = () => {
    navRoot.classList.remove("site-nav--open");
    toggleButton.classList.remove("is-open");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Abrir menú de navegación");
  };

  const toggleMenu = () => {
    const willOpen = !navRoot.classList.contains("site-nav--open");
    navRoot.classList.toggle("site-nav--open", willOpen);
    toggleButton.classList.toggle("is-open", willOpen);
    toggleButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
    toggleButton.setAttribute("aria-label", willOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  };

  if (!navRoot.dataset.responsiveBound) {
    toggleButton.addEventListener("click", toggleMenu);
    navRoot.addEventListener("click", (event) => {
      if (window.innerWidth <= MOBILE_NAV_BREAKPOINT && event.target.closest(".site-nav__link")) {
        closeMenu();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
        closeMenu();
      }
    });
    navRoot.dataset.responsiveBound = "true";
  }

  closeMenu();
}

renderSiteVersion();

export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  if (options.href) node.href = options.href;
  if (options.src) node.src = options.src;
  if (options.alt !== undefined) node.alt = options.alt;
  if (options.target) node.target = options.target;
  if (options.rel) node.rel = options.rel;
  if (options.id) node.id = options.id;
  if (options.ariaLabel) node.setAttribute("aria-label", options.ariaLabel);
  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      node.dataset[key] = value;
    });
  }
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }
  return appendChildren(node, children);
}

export async function fetchJson(name) {
  const response = await fetch(`data/${name}.json`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar data/${name}.json`);
  }
  return response.json();
}

export async function loadSiteData() {
  if (dataCache) {
    return dataCache;
  }

  const [years, courses, sessions, speakers] = await Promise.all([
    fetchJson("years"),
    fetchJson("courses"),
    fetchJson("sessions"),
    fetchJson("speakers"),
  ]);

  dataCache = {
    years: Array.isArray(years) ? years : [],
    courses: Array.isArray(courses) ? courses : [],
    sessions: Array.isArray(sessions) ? sessions : [],
    speakers: Array.isArray(speakers) ? speakers : [],
  };
  return dataCache;
}

export function setPageChrome({ current, title, subtitle = "", breadcrumbs = [], actions = [] }) {
  document.title = `${title} | ${SITE_TITLE}`;

  const navRoot = document.getElementById("nav-root");
  const breadcrumbsRoot = document.getElementById("breadcrumbs-root");
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");
  const pageActions = document.getElementById("page-actions");

  if (navRoot) {
    navRoot.innerHTML = "";
    NAV_ITEMS.forEach((item) => {
      navRoot.appendChild(
        el("a", {
          href: item.href,
          text: item.label,
          className: `site-nav__link${item.key === current ? " is-active" : ""}`,
        })
      );
    });
    ensureResponsiveNav(navRoot);
  }

  if (breadcrumbsRoot) {
    breadcrumbsRoot.innerHTML = "";
    breadcrumbs.forEach((crumb, index) => {
      if (index > 0) {
        breadcrumbsRoot.appendChild(el("span", { className: "breadcrumbs__separator", text: "/" }));
      }

      if (crumb.href) {
        breadcrumbsRoot.appendChild(el("a", { href: crumb.href, text: crumb.label }));
      } else {
        breadcrumbsRoot.appendChild(el("span", { text: crumb.label }));
      }
    });
  }

  if (pageTitle) {
    pageTitle.textContent = title;
  }

  if (pageSubtitle) {
    pageSubtitle.textContent = subtitle;
  }

  if (pageActions) {
    pageActions.innerHTML = "";
    appendChildren(pageActions, actions);
  }
}

export function setMainContent(...nodes) {
  const root = document.getElementById("page-content");
  if (!root) return;
  root.innerHTML = "";
  appendChildren(root, nodes);
}

export function pageUrl(page, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const suffix = query.toString();
  return suffix ? `${page}.html?${suffix}` : `${page}.html`;
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

export function normalizeAssetPath(path) {
  if (!path) return "";
  if (isExternalUrl(path) || path.startsWith("mailto:")) {
    return path;
  }
  return path.replace(/^\/+/, "");
}

export function buildAssetPath(basePath, file) {
  const base = normalizeAssetPath(basePath).replace(/\/+$/, "");
  const relative = String(file || "").replace(/^\/+/, "");
  return relative ? `${base}/${relative}` : base;
}

export function buildSessionAssetPath(sessionPath, file) {
  return buildAssetPath(sessionPath, file);
}

export function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

export function sortByDate(items) {
  return [...items].sort((left, right) => String(left.date || "").localeCompare(String(right.date || "")));
}

export function getCoursesForYear(courses, yearId) {
  return courses.filter((course) => String(course.year) === String(yearId));
}

export function getSessionsForCourse(sessions, courseId) {
  return sortByDate(sessions.filter((session) => session.course_id === courseId));
}

export function getSessionsForSpeaker(sessions, speakerId) {
  return sortByDate(
    sessions.filter((session) => Array.isArray(session.speaker_ids) && session.speaker_ids.includes(speakerId))
  );
}

export function getSpeakerMap(speakers) {
  return new Map(speakers.map((speaker) => [speaker.id, speaker]));
}

export function getCourseMap(courses) {
  return new Map(courses.map((course) => [course.id, course]));
}

export function getSpeakerNames(speakerIds, speakers) {
  const speakerMap = getSpeakerMap(speakers);
  return (speakerIds || []).map((speakerId) => speakerMap.get(speakerId)?.name || speakerId);
}

export function createButtonLink(label, href) {
  return el("a", { href, text: label, className: "button-link" });
}

export function createTagList(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }
  return el(
    "div",
    { className: "tag-list" },
    tags.map((tag) => el("span", { className: "tag", text: tag }))
  );
}

export function createEmptyState(message) {
  return el("section", { className: "empty-state" }, [el("p", { text: message })]);
}

export function createNotFound(title, message, href = null, linkLabel = "Volver") {
  const actions = href ? [createButtonLink(linkLabel, href)] : [];
  return el("section", { className: "not-found stack" }, [
    el("h2", { text: title }),
    el("p", { text: message }),
    ...actions,
  ]);
}

export function createSectionCard(title, bodyNodes = [], extraClass = "") {
  return el("section", { className: `section-card stack${extraClass ? ` ${extraClass}` : ""}` }, [
    el("h2", { className: "section-title", text: title }),
    ...bodyNodes,
  ]);
}

export function createStatsGrid(stats) {
  return el(
    "section",
    { className: "stats-grid" },
    stats.map((stat) =>
      el("article", { className: "stat-card" }, [
        el("span", { className: "stat-card__value", text: String(stat.value) }),
        el("span", { className: "stat-card__label", text: stat.label }),
      ])
    )
  );
}

export function createCard({
  title,
  meta = "",
  text = "",
  tags = [],
  href = "",
  linkLabel = "Ver detalle",
  footer = [],
}) {
  const nodes = [];
  if (meta) nodes.push(el("p", { className: "card__meta", text: meta }));
  nodes.push(el("h3", { className: "card__title", text: title }));
  if (text) nodes.push(el("p", { className: "card__text", text }));
  const tagList = createTagList(tags);
  if (tagList) nodes.push(tagList);

  const footerNodes = [...footer];
  if (href) {
    footerNodes.push(createButtonLink(linkLabel, href));
  }
  if (footerNodes.length > 0) {
    nodes.push(el("div", { className: "card__footer" }, footerNodes));
  }

  return el("article", { className: "card" }, nodes);
}

export function createInfoGrid(items) {
  return el(
    "div",
    { className: "info-grid" },
    items
      .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
      .map((item) =>
        el("div", { className: "info-grid__row" }, [
          el("span", { className: "info-grid__label", text: item.label }),
          el("span", { className: "info-grid__value", text: String(item.value) }),
        ])
      )
  );
}

export function createResourceList(title, items, sessionPath = "") {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const list = el(
    "ul",
    { className: "resource-list" },
    items.map((item) => {
      const href = item.file ? buildSessionAssetPath(sessionPath, item.file) : item.url;
      const link =
        href && isExternalUrl(href)
          ? el("a", { href, text: item.title || href, target: "_blank", rel: "noreferrer noopener" })
          : href
            ? el("a", { href, text: item.title || href })
            : el("span", { text: item.title || "Recurso sin titulo" });

      const note = item.comment ? el("span", { className: "resource-note", text: ` - ${item.comment}` }) : null;
      return el("li", {}, [link, note]);
    })
  );

  return el("section", { className: "section-card stack" }, [
    el("h2", { className: "section-title", text: title }),
    list,
  ]);
}

export function createPlainListSection(title, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return el("section", { className: "section-card stack" }, [
    el("h2", { className: "section-title", text: title }),
    el(
      "ul",
      { className: "plain-list" },
      items.map((item) => el("li", { text: String(item) }))
    ),
  ]);
}

export function createSpoilerList(title, items = []) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return el("section", { className: "section-card stack" }, [
    el("h2", { className: "section-title", text: title }),
    el(
      "div",
      { className: "spoiler-list" },
      items.map((item) =>
        el("details", { className: "spoiler-item" }, [
          el("summary", { className: "spoiler-item__summary", text: item.problem || "Problema" }),
          el("div", { className: "spoiler-item__content", text: item.spoiler || "" }),
        ])
      )
    ),
  ]);
}

export function createSpeakerImage(path, alt, className) {
  const normalizedPath = normalizeAssetPath(path);
  if (!normalizedPath) {
    return el("div", { className: `${className} section-card`, text: "No hay foto disponible." });
  }

  const trigger = el(
    "button",
    {
      className: "speaker-photo-trigger",
      attributes: { type: "button", "aria-label": `Ver foto completa de ${alt || "expositor"}` },
    },
    [
      el("img", { src: normalizedPath, alt, className: "speaker-photo" }),
      el("span", { className: "speaker-photo-trigger__hint", text: "Ampliar" }),
    ]
  );

  trigger.addEventListener("click", () => {
    openPhotoLightbox(normalizedPath, alt, alt);
  });

  return el("div", { className }, [trigger]);
}

let photoLightbox = null;
let photoLightboxUsesHistory = false;

function hidePhotoLightbox() {
  if (!photoLightbox) {
    return;
  }

  photoLightbox.overlay.style.display = "none";
  photoLightbox.overlay.setAttribute("hidden", "hidden");
  document.body.classList.remove("is-lightbox-open");
  photoLightboxUsesHistory = false;
}

function closePhotoLightbox() {
  if (!photoLightbox || photoLightbox.overlay.hasAttribute("hidden")) {
    return;
  }

  const shouldGoBack = photoLightboxUsesHistory;
  hidePhotoLightbox();

  if (shouldGoBack) {
    window.history.back();
  }
}

function ensurePhotoLightbox() {
  if (photoLightbox) {
    return photoLightbox;
  }

  const image = el("img", { className: "photo-lightbox__image", alt: "" });
  const caption = el("p", { className: "photo-lightbox__caption" });
  const closeButton = el(
    "button",
    {
      className: "photo-lightbox__close",
      text: "Cerrar",
      attributes: { type: "button", "aria-label": "Cerrar imagen completa" },
    }
  );
  const surface = el("div", { className: "photo-lightbox__surface" }, [closeButton, image, caption]);
  const overlay = el(
    "div",
    {
      className: "photo-lightbox",
      attributes: { hidden: "hidden", role: "dialog", "aria-modal": "true", "aria-label": "Imagen completa" },
    },
    [surface]
  );

  overlay.addEventListener("click", (event) => {
    if (!event.target.closest(".photo-lightbox__image")) {
      closePhotoLightbox();
    }
  });

  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePhotoLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hasAttribute("hidden")) {
      closePhotoLightbox();
    }
  });

  window.addEventListener("popstate", () => {
    if (photoLightbox && !photoLightbox.overlay.hasAttribute("hidden")) {
      hidePhotoLightbox();
    }
  });

  document.body.appendChild(overlay);
  photoLightbox = { overlay, image, caption };
  return photoLightbox;
}

export function openPhotoLightbox(src, captionText = "", alt = "") {
  if (!src) return;
  const lightbox = ensurePhotoLightbox();
  lightbox.image.src = src;
  lightbox.image.alt = alt || captionText || "Imagen completa";
  lightbox.caption.textContent = captionText || alt || "";
  if (captionText || alt) {
    lightbox.caption.removeAttribute("hidden");
  } else {
    lightbox.caption.setAttribute("hidden", "hidden");
  }
  if (!photoLightboxUsesHistory) {
    window.history.pushState({ photoLightbox: true }, "");
    photoLightboxUsesHistory = true;
  }
  lightbox.overlay.style.display = "grid";
  lightbox.overlay.removeAttribute("hidden");
  document.body.classList.add("is-lightbox-open");
}

export function createPhotoGallery(items = [], basePath = "", fallbackTitle = "Imagen") {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return el(
    "div",
    { className: "photo-gallery" },
    items.map((photo) => {
      const photoPath = buildAssetPath(basePath, photo.file);
      const captionText = photo.comment || photo.file || fallbackTitle;
      const link = el(
        "a",
        {
          className: "photo-gallery__item",
          href: photoPath,
          attributes: { "aria-label": `Ver imagen completa: ${captionText}` },
        },
        [
          el("div", { className: "photo-gallery__thumb" }, [
            el("img", { src: photoPath, alt: captionText }),
            el("span", { className: "photo-gallery__hint", text: "Ver completa" }),
          ]),
          el("div", { className: "photo-gallery__caption", text: captionText }),
        ]
      );

      link.addEventListener("click", (event) => {
        event.preventDefault();
        openPhotoLightbox(photoPath, captionText, fallbackTitle);
      });

      return link;
    })
  );
}
