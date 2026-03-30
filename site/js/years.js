import {
  createCard,
  createSectionCard,
  getCoursesForYear,
  loadSiteData,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330c";

async function renderYearsPage() {
  const data = await loadSiteData();

  setPageChrome({
    current: "years",
    title: "Años del taller",
    subtitle: "Explora cada gestión del taller y abre los cursos impartidos en esa edición.",
    breadcrumbs: [{ label: "Inicio", href: "index.html" }, { label: "Años" }],
  });

  if (data.years.length === 0) {
    setMainContent(
      createSectionCard("No hay años disponibles", [
        el("p", { className: "section-text", text: "El JSON generado todavía no contiene años del taller." }),
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
          meta: "Archivo anual",
          text: `${courseCount} curso${courseCount === 1 ? "" : "s"} disponible${courseCount === 1 ? "" : "s"}.`,
          href: pageUrl("year", { id: year.id }),
          linkLabel: "Abrir año",
        });
      })
  );

  setMainContent(createSectionCard("Todos los años", [cards]));
}

renderYearsPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("No se pudieron cargar los años", [
      el("p", {
        className: "section-text",
        text: "Ejecuta python scripts/build_data.py y sirve la carpeta site para reconstruir los archivos de datos.",
      }),
    ])
  );
});
