import {
  createButtonLink,
  createCard,
  createEmptyState,
  createNotFound,
  createSectionCard,
  getQueryParam,
  getSpeakerNames,
  getSessionsForCourse,
  loadSiteData,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330b";

async function renderCoursePage() {
  const data = await loadSiteData();
  const courseId = getQueryParam("id");
  const course = data.courses.find((item) => item.id === courseId);

  if (!course) {
    setPageChrome({
      current: "years",
      title: "Course not found",
      subtitle: "The requested course is not present in the generated data.",
      breadcrumbs: [{ label: "Home", href: "index.html" }, { label: "Years", href: "years.html" }, { label: "Not found" }],
      actions: [createButtonLink("Back to years", "years.html")],
    });
    setMainContent(
      createNotFound(
        "Course not found",
        "No course matched the provided id. Try returning to the year or course listings.",
        "years.html",
        "Open years"
      )
    );
    return;
  }

  const sessions = getSessionsForCourse(data.sessions, course.id);
  const yearExists = data.years.some((year) => String(year.id) === String(course.year));

  setPageChrome({
    current: "years",
    title: course.title,
    subtitle: course.description || "Sessions for this course.",
    breadcrumbs: [
      { label: "Home", href: "index.html" },
      { label: "Years", href: "years.html" },
      yearExists ? { label: course.year, href: pageUrl("year", { id: course.year }) } : { label: String(course.year) },
      { label: course.title },
    ],
    actions: [createButtonLink("Back to year", pageUrl("year", { id: course.year }))],
  });

  const sessionList =
    sessions.length > 0
      ? el(
          "section",
          { className: "grid grid--2" },
          sessions.map((session) =>
            createCard({
              title: session.title,
              meta: session.date || "Date pending",
              text: session.summary || "No summary provided.",
              tags: session.tags || [],
              href: pageUrl("session", { id: session.id }),
              linkLabel: "View session",
              footer: [
                el("span", {
                  className: "card__text",
                  text: `Speakers: ${getSpeakerNames(session.speaker_ids, data.speakers).join(", ") || "Not assigned"}`,
                }),
              ],
            })
          )
        )
      : createEmptyState("This course exists, but it does not have any sessions yet.");

  setMainContent(el("div", { className: "stack-lg" }, [createSectionCard("Sessions", [sessionList])]));
}

renderCoursePage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("Unable to load the course page", [
      el("p", {
        className: "section-text",
        text: "Run python scripts/build_data.py and serve the site folder to rebuild the JSON files.",
      }),
    ])
  );
});
