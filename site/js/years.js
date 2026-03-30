import {
  createCard,
  createSectionCard,
  getCoursesForYear,
  loadSiteData,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330b";

async function renderYearsPage() {
  const data = await loadSiteData();

  setPageChrome({
    current: "years",
    title: "Workshop Years",
    subtitle: "Browse each workshop year and open the courses taught during that edition.",
    breadcrumbs: [{ label: "Home", href: "index.html" }, { label: "Years" }],
  });

  if (data.years.length === 0) {
    setMainContent(
      createSectionCard("No years available", [
        el("p", { className: "section-text", text: "The generated JSON does not contain any workshop years yet." }),
      ])
    );
    return;
  }

  const cards = el(
    "section",
    { className: "grid grid--3" },
    data.years
      .slice()
      .sort((left, right) => String(right.id).localeCompare(String(left.id)))
      .map((year) => {
        const courseCount = getCoursesForYear(data.courses, year.id).length;
        return createCard({
          title: year.id,
          meta: "Year archive",
          text: `${courseCount} course${courseCount === 1 ? "" : "s"} available.`,
          href: pageUrl("year", { id: year.id }),
          linkLabel: "Open year",
        });
      })
  );

  setMainContent(createSectionCard("All years", [cards]));
}

renderYearsPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("Unable to load years", [
      el("p", {
        className: "section-text",
        text: "Run python scripts/build_data.py and serve the site folder to rebuild the data files.",
      }),
    ])
  );
});
