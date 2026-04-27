# Guia Rapida De `data/`

Este archivo explica la estructura de `data/` y el formato de los `.yml`.
La idea es que sirva tanto para una persona como para pasarselo a ChatGPT o Codex y pedirle que cree cursos, sesiones o speakers nuevos.

## Estructura General

```text
data/
  speakers/
    <speaker-id>.yml
    photos/
      <foto>.jpg
  years/
    <year>/
      <nombre-del-curso>/
        course.yml
        sessions/
          <YYYY-MM-DD-tema>/
            session.yml
            <archivos de la sesion>
```

## Que Representa Cada Carpeta

- `data/speakers/`: perfiles de expositores.
- `data/speakers/photos/`: fotos de expositores.
- `data/years/<year>/`: agrupa cursos de un anio.
- `data/years/<year>/<curso>/course.yml`: metadatos del curso.
- `data/years/<year>/<curso>/sessions/<sesion>/session.yml`: metadatos de una sesion.
- La carpeta de cada sesion tambien guarda PDFs, ZIPs, imagenes y otros archivos usados por esa sesion.

## Reglas Practicas

- Usa YAML simple, con espacios, no tabs.
- Mantén ids estables y en minusculas con guiones.
- No inventes archivos que no existan.
- Si una sesion referencia un `speaker_id`, ese speaker debe existir en `data/speakers/`.
- Los archivos de una sesion normalmente se referencian con ruta relativa, por ejemplo `slides.pdf` o `soluciones.zip`.
- La foto de un speaker se referencia con ruta absoluta dentro del repo, por ejemplo `/data/speakers/photos/anghelo.jpg`.
- Si un campo opcional no se necesita, puede omitirse o dejarse como lista vacia.

## Formato De `speaker.yml`

Ubicacion:

```text
data/speakers/<speaker-id>.yml
```

Ejemplo:

```yml
id: anghelo-pena
name: Anghelo Pena
role: Expositor
bio: 3er lugar ICPC Nacional Bolivia; Ganador Cocha Innova.
photo: /data/speakers/photos/anghelo.jpg

contacts:
  codeforces: https://codeforces.com/profile/Anghelo
  github: https://github.com/usuario
  linkedin: https://linkedin.com/in/usuario
  email: correo@ejemplo.com
  telegram: https://t.me/usuario
```

Campos importantes:

- `id`: identificador unico del speaker.
- `name`: nombre visible.
- `role`: rol visible, por ejemplo `Expositor`.
- `bio`: descripcion corta.
- `photo`: ruta a la foto en `data/speakers/photos/`.
- `contacts`: diccionario de enlaces; puede tener solo los que existan.

## Formato De `course.yml`

Ubicacion:

```text
data/years/<year>/<nombre-del-curso>/course.yml
```

Ejemplo:

```yml
id: tpc-2024
title: Taller de Programacion Competitiva 2024
year: 2024
description: Curso completo.
status: Finalizado
tags:
  - programacion-competitiva
  - icpc
```

Campos importantes:

- `id`: identificador unico del curso.
- `title`: nombre visible del curso.
- `year`: anio del curso.
- `description`: descripcion corta.
- `status`: usa uno de los valores canónicos: `draft`, `ongoing`, `published`. El build normaliza automáticamente variantes como `finalizado` o `en curso`, pero advierte si el valor no es reconocido.
- `tags`: lista simple de etiquetas.
- `photos`: imagenes opcionales del curso, usando rutas relativas dentro de la carpeta del curso.

## Formato De `session.yml`

Ubicacion:

```text
data/years/<year>/<nombre-del-curso>/sessions/<YYYY-MM-DD-tema>/session.yml
```

Convencion recomendada para el nombre de carpeta e `id`:

```text
YYYY-MM-DD-tema
```

Ejemplo:

```yml
id: 2024-07-20-binary-search
title: Binary Search
date: 2024-07-20
course_id: tpc-2024
status: published

summary: Busqueda Binaria y Ternaria.

speaker_ids:
  - oliver-pozo

tags:
  - binary-search
  - ternary-search

materials:
  slides:
    - title: Presentacion
      file: "Busqueda Binaria_Ternaria.pdf"
  extra_pdfs:
    - title: Resumen adicional
      file: "apunte.pdf"
  extra_files:
    - title: Soluciones del contest
      file: "soluciones.zip"

problem_list:
  - title: Problema A
    url: https://codeforces.com/problemset/problem/1/A
    comment: ejemplo

practice_contests:
  - title: Contest de practica
    url: https://vjudge.net/contest/123456
    comment: password: ejemplo

extra_links:
  - title: CP-Algorithms
    url: https://cp-algorithms.com/
    comment: referencia

extra_notes:
  - Repasar lower_bound y upper_bound.

photos:
  - file: foto1.jpg
    comment: Foto de la sesion
```

## Campos Mas Usados En Sesiones

- `id`: identificador unico de la sesion.
- `title`: titulo visible.
- `date`: fecha en formato `YYYY-MM-DD`.
- `course_id`: debe coincidir con el `id` del `course.yml`.
- `status`: usa uno de los valores canónicos: `draft`, `ongoing`, `published`. Igual que en cursos, el build normaliza variantes y advierte si no reconoce el valor.
- `summary`: resumen corto.
- `speaker_ids`: lista de speakers que ya existen.
- `tags`: etiquetas de la sesion.

## Materiales Y Recursos

Dentro de `materials`:

- `slides`: diapositivas principales.
- `extra_pdfs`: PDFs adicionales.
- `extra_files`: ZIPs, codigo fuente, rar, apuntes comprimidos, librerias, etc.

Fuera de `materials`:

- `problem_list`: lista de problemas recomendados.
- `practice_contests`: contests de practica.
- `extra_links`: enlaces utiles.
- `extra_notes`: notas de texto libre.
- `photos`: imagenes de la sesion.
- `solution_notes`: soluciones colapsadas del contest, una por problema. Cada item tiene `problem` (nombre del problema) y `spoiler` (la solución, puede ser multilinea con `|`). Se muestran como acordeón en el sitio — el usuario debe hacer clic para revelar cada solución.

Ejemplo:

```yml
solution_notes:
  - problem: A - Nombre del problema
    spoiler: Descripción corta de la solución
  - problem: B - Problema con solución multilinea
    spoiler: |
      dp[i] = recurrencia principal
      dp[i] = min(dp[i-1] + costo, dp[i-2] + costo)
```

## Reglas De Rutas

- Archivos de sesion:

```yml
file: "slides.pdf"
file: "soluciones.zip"
file: "imagenes/foto1.jpg"
```

- Foto de speaker:

```yml
photo: /data/speakers/photos/mi-foto.jpg
```

- Foto de curso:

```yml
photos:
  - file: afiche.jpg
    comment: Afiche del curso
```

## Flujo Recomendado Para Agregar Contenido

1. Crear o actualizar speakers en `data/speakers/` si hacen falta.
2. Crear el `course.yml` si el curso no existe.
3. Crear la carpeta de la sesion.
4. Copiar dentro de esa carpeta los PDFs, ZIPs, imagenes o codigo.
5. Crear el `session.yml` apuntando a esos archivos.
6. Ejecutar:

```powershell
py scripts/build_data.py
```

7. Probar localmente:

```powershell
cd site
py -m http.server 8000
```

## Instrucciones Cortas Para Otra IA

Si le pasas esta tarea a ChatGPT o Codex, normalmente basta con decirle algo como:

```text
Crea un nuevo speaker en data/speakers y una nueva sesion dentro del curso X.
Usa la estructura de DATA_STRUCTURE_GUIDE.md.
No inventes archivos que no existan.
Si agregas archivos a una sesion, referencialos con rutas relativas dentro de la carpeta de la sesion.
Si agregas una foto de speaker, usala desde /data/speakers/photos/.
Mantén ids en minusculas con guiones.
```

## Plantillas Utiles

Hay plantillas base en:

- `templates/course.template.yml`
- `templates/session.template.yml`
- `templates/speaker.template.yml`

Sirven como punto de partida, pero puedes simplificarlas y dejar solo los campos necesarios.
