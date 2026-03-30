import {
  createButtonLink,
  createCard,
  createEmptyState,
  createNotFound,
  createSectionCard,
  getCoursesForYear,
  getQueryParam,
  getSessionsForCourse,
  loadSiteData,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330b";

async function renderYearPage() {
  const data = await loadSiteData();
  const yearId = getQueryParam("id");
  const year = data.years.find((item) => String(item.id) === String(yearId));

  if (!year) {
    setPageChrome({
      current: "years",
      title: "Year not found",
      subtitle: "The requested year is not present in the generated data.",
      breadcrumbs: [{ label: "Home", href: "index.html" }, { label: "Years", href: "years.html" }, { label: "Not found" }],
      actions: [createButtonLink("Back to years", "years.html")],
    });
    setMainContent(
      createNotFound(
        "Year not found",
        "No workshop year matched the provided id. Try returning to the year index.",
        "years.html",
        "Open years"
      )
    );
    return;
  }

  const courses = getCoursesForYear(data.courses, year.id);

  setPageChrome({
    current: "years",
    title: `Year ${year.id}`,
    subtitle: "Courses available for this workshop year.",
    breadcrumbs: [{ label: "Home", href: "index.html" }, { label: "Years", href: "years.html" }, { label: year.id }],
    actions: [createButtonLink("Back to years", "years.html")],
  });

  const cards =
    courses.length > 0
      ? el(
          "section",
          { className: "grid grid--2" },
          courses.map((course) => {
            const sessions = getSessionsForCourse(data.sessions, course.id);
            return createCard({
              title: course.title,
              meta: `${course.status || "Status not set"} | ${sessions.length} sessions`,
              text: course.description || "No description provided.",
              tags: course.tags || [],
              href: pageUrl("course", { id: course.id }),
              linkLabel: "View course",
              footer: [el("span", { className: "card__text", text: `Course ID: ${course.id}` })],
            });
          })
        )
      : createEmptyState("This year exists in the archive but does not contain any courses yet.");

  setMainContent(createSectionCard("Courses", [cards]));
}

renderYearPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("Unable to load the year page", [
      el("p", {
        className: "section-text",
        text: "Run python scripts/build_data.py and serve the site folder to rebuild the JSON files.",
      }),
    ])
  );
});
