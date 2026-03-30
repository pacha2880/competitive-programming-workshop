const SITE_TITLE = "Taller de Programación Competitiva";
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

export function buildSessionAssetPath(sessionPath, file) {
  const base = normalizeAssetPath(sessionPath).replace(/\/+$/, "");
  const relative = String(file || "").replace(/^\/+/, "");
  return relative ? `${base}/${relative}` : base;
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

export function createSpeakerImage(path, alt, className) {
  const normalizedPath = normalizeAssetPath(path);
  if (!normalizedPath) {
    return el("div", { className: `${className} section-card`, text: "No hay foto disponible." });
  }

  return el("div", { className }, [el("img", { src: normalizedPath, alt, className: "speaker-photo" })]);
}
