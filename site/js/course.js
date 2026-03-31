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
} from "./shared.js?v=20260330f";

async function renderCoursePage() {
  const data = await loadSiteData();
  const courseId = getQueryParam("id");
  const course = data.courses.find((item) => item.id === courseId);

  if (!course) {
    setPageChrome({
      current: "years",
      title: "Curso no encontrado",
      subtitle: "El curso solicitado no está presente en los datos generados.",
      breadcrumbs: [{ label: "Inicio", href: "index.html" }, { label: "Años", href: "years.html" }, { label: "No encontrado" }],
      actions: [createButtonLink("Volver a años", "years.html")],
    });
    setMainContent(
      createNotFound(
        "Curso no encontrado",
        "Ningún curso coincide con el id proporcionado. Intenta volver al listado de años o cursos.",
        "years.html",
        "Abrir años"
      )
    );
    return;
  }

  const sessions = getSessionsForCourse(data.sessions, course.id);
  const yearExists = data.years.some((year) => String(year.id) === String(course.year));

  setPageChrome({
    current: "years",
    title: course.title,
    subtitle: course.description || "Sesiones de este curso.",
    breadcrumbs: [
      { label: "Inicio", href: "index.html" },
      { label: "Años", href: "years.html" },
      yearExists ? { label: course.year, href: pageUrl("year", { id: course.year }) } : { label: String(course.year) },
      { label: course.title },
    ],
    actions: [createButtonLink("Volver al año", pageUrl("year", { id: course.year }))],
  });

  const sessionList =
    sessions.length > 0
      ? el(
          "section",
          { className: "grid grid--2" },
          sessions.map((session) =>
            createCard({
              title: session.title,
              meta: session.date || "Fecha pendiente",
              text: session.summary || "Sin resumen.",
              tags: session.tags || [],
              href: pageUrl("session", { id: session.id }),
              linkLabel: "Ver sesión",
              footer: [
                el("span", {
                  className: "card__text",
                  text: `Expositores: ${getSpeakerNames(session.speaker_ids, data.speakers).join(", ") || "No asignados"}`,
                }),
              ],
            })
          )
        )
      : createEmptyState("Este curso existe, pero todavía no tiene sesiones.");

  setMainContent(el("div", { className: "stack-lg" }, [createSectionCard("Sesiones", [sessionList])]));
}

renderCoursePage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("No se pudo cargar la página del curso", [
      el("p", {
        className: "section-text",
        text: "Ejecuta python scripts/build_data.py y sirve la carpeta site para reconstruir los archivos JSON.",
      }),
    ])
  );
});
