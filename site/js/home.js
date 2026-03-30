import {
  createButtonLink,
  createSectionCard,
  loadSiteData,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330b";

async function renderHomePage() {
  await loadSiteData();

  setPageChrome({
    current: "home",
    title: "Taller de Programacion Competitiva",
    subtitle: "Static archive of workshop sessions, materials, and instructor profiles.",
    actions: [createButtonLink("Browse years", "years.html"), createButtonLink("Browse instructors", "speakers.html")],
  });
  setMainContent(el("div", { className: "home-spacer" }));
}

renderHomePage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("Unable to load the home page", [
      el("p", {
        className: "section-text",
        text: "Run python scripts/build_data.py and serve the site folder to make sure the JSON files exist.",
      }),
    ])
  );
});
