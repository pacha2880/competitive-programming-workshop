import {
  createButtonLink,
  createSectionCard,
  loadSiteData,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330c";

async function renderHomePage() {
  await loadSiteData();

  setPageChrome({
    current: "home",
    title: "Taller de Programación Competitiva",
    subtitle: "Archivo estático de sesiones, materiales y perfiles de instructores.",
    actions: [createButtonLink("Ver años", "years.html"), createButtonLink("Ver instructores", "speakers.html")],
  });
  setMainContent(el("div", { className: "home-spacer" }));
}

renderHomePage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("No se pudo cargar la página de inicio", [
      el("p", {
        className: "section-text",
        text: "Ejecuta python scripts/build_data.py y sirve la carpeta site para asegurarte de que existan los archivos JSON.",
      }),
    ])
  );
});
