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
} from "./shared.js?v=20260408d";

async function renderYearPage() {
  const data = await loadSiteData();
  const yearId = getQueryParam("id");
  const year = data.years.find((item) => String(item.id) === String(yearId));

  if (!year) {
    setPageChrome({
      current: "years",
      title: "Año no encontrado",
      subtitle: "El año solicitado no está presente en los datos generados.",
      breadcrumbs: [{ label: "Inicio", href: "index.html" }, { label: "Años", href: "years.html" }, { label: "No encontrado" }],
      actions: [createButtonLink("Volver a años", "years.html")],
    });
    setMainContent(
      createNotFound(
        "Año no encontrado",
        "Ningún año del taller coincide con el id proporcionado. Intenta volver al listado de años.",
        "years.html",
        "Abrir años"
      )
    );
    return;
  }

  const courses = getCoursesForYear(data.courses, year.id);

  setPageChrome({
    current: "years",
    title: `Año ${year.id}`,
    subtitle: "Cursos disponibles para esta gestión del taller.",
    breadcrumbs: [{ label: "Inicio", href: "index.html" }, { label: "Años", href: "years.html" }, { label: year.id }],
    actions: [createButtonLink("Volver a años", "years.html")],
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
              meta: `${course.status || "Estado no definido"} | ${sessions.length} sesiones`,
              text: course.description || "Sin descripción.",
              tags: course.tags || [],
              href: pageUrl("course", { id: course.id }),
              linkLabel: "Ver curso",
            });
          })
        )
      : createEmptyState("Este año existe en el archivo, pero todavía no contiene cursos.");

  setMainContent(createSectionCard("Cursos", [cards]));
}

renderYearPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("No se pudo cargar la página del año", [
      el("p", {
        className: "section-text",
        text: "Ejecuta python scripts/build_data.py y sirve la carpeta site para reconstruir los archivos JSON.",
      }),
    ])
  );
});
