from __future__ import annotations

import json
import re
import shutil
from datetime import date, datetime
from pathlib import Path
from typing import Any

import yaml


ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
SPEAKERS_DIR = DATA_DIR / "speakers"
YEARS_DIR = DATA_DIR / "years"
OUTPUT_DIR = ROOT_DIR / "site" / "data"


def quote_yaml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def repair_unquoted_mapping_values(raw_text: str) -> str:
    repaired_lines: list[str] = []

    for line in raw_text.splitlines(keepends=True):
        newline = "\r\n" if line.endswith("\r\n") else "\n"
        stripped = line.rstrip("\r\n")

        match = re.match(r"^(\s*(?:-\s+)?[A-Za-z0-9_-]+\s*:\s+)(.+)$", stripped)
        if not match:
            repaired_lines.append(line)
            continue

        prefix, value = match.groups()
        value = value.rstrip()

        if (
            ": " in value
            and not value.startswith(('"', "'", "[", "{", "|", ">"))
            and not re.match(r"^[A-Za-z0-9_-]+\s*:$", value)
        ):
            repaired_lines.append(f"{prefix}{quote_yaml_string(value)}{newline}")
            continue

        repaired_lines.append(line)

    return "".join(repaired_lines)


def repair_extra_notes_yaml(raw_text: str) -> str:
    lines = raw_text.splitlines(keepends=True)
    repaired: list[str] = []
    in_extra_notes = False
    extra_notes_indent = 0
    index = 0

    while index < len(lines):
        line = lines[index]
        stripped = line.lstrip(" ")
        indent = len(line) - len(stripped)
        newline = "\r\n" if line.endswith("\r\n") else "\n"

        if not in_extra_notes:
            repaired.append(line)
            if stripped.startswith("extra_notes:"):
                in_extra_notes = True
                extra_notes_indent = indent
            index += 1
            continue

        if stripped.strip() and indent <= extra_notes_indent:
            in_extra_notes = False
            continue

        item_match = re.match(rf"^(\s{{{extra_notes_indent + 2},}})-\s+(.*?)(\r?\n)?$", line)
        if not item_match:
            repaired.append(line)
            index += 1
            continue

        item_indent = len(item_match.group(1))
        item_text = item_match.group(2).rstrip()

        if re.match(r"^[A-Za-z0-9_-]+\s*:", item_text):
            repaired.append(line)
            index += 1
            continue

        next_line = lines[index + 1] if index + 1 < len(lines) else ""
        next_stripped = next_line.lstrip(" ")
        next_indent = len(next_line) - len(next_stripped)
        has_nested_mapping = bool(
            next_stripped.strip()
            and next_indent > item_indent
            and re.match(r"^[A-Za-z0-9_-]+\s*:", next_stripped)
        )

        if has_nested_mapping:
            repaired.append(f"{' ' * item_indent}- text: {quote_yaml_string(item_text)}{newline}")
        else:
            repaired.append(f"{' ' * item_indent}- {quote_yaml_string(item_text)}{newline}")

        index += 1

    return "".join(repaired)


def load_yaml(path: Path) -> dict[str, Any]:
    raw_text = path.read_text(encoding="utf-8")
    try:
        data = yaml.safe_load(raw_text) or {}
    except yaml.YAMLError:
        repaired_text = repair_extra_notes_yaml(repair_unquoted_mapping_values(raw_text))
        data = yaml.safe_load(repaired_text) or {}
    if not isinstance(data, dict):
        return {}
    return data


def relative_path(path: Path) -> str:
    return path.relative_to(ROOT_DIR).as_posix()


def normalize_scalar(value: Any, fallback: str = "") -> Any:
    if value is None:
        return fallback
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return value


def normalize_text(value: Any, fallback: str = "") -> str:
    return str(normalize_scalar(value, fallback))


def normalize_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(normalize_scalar(item, "")).strip() for item in value if str(normalize_scalar(item, "")).strip()]


def normalize_extra_notes_and_links(value: Any) -> tuple[list[str], list[dict[str, str]]]:
    if not isinstance(value, list):
        return [], []

    notes: list[str] = []
    links: list[dict[str, str]] = []
    for item in value:
        if isinstance(item, dict):
            text = normalize_text(
                item.get("text", item.get("note", item.get("title", item.get("content", "")))),
                "",
            ).strip()
            url = normalize_text(item.get("url", ""), "").strip()
            comment = normalize_text(item.get("comment", ""), "").strip()

            if url:
                links.append(
                    {
                        "title": text or url,
                        "file": "",
                        "url": url,
                        "comment": comment,
                    }
                )
                continue

            parts = [text]
            if comment:
                parts.append(f"- {comment}" if text else comment)

            merged = " ".join(part for part in parts if part).strip()
            if merged:
                notes.append(merged)
            continue

        text = normalize_text(item, "").strip()
        if text:
            notes.append(text)

    return notes, links


def normalize_link_items(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []

    items: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        items.append(
            {
                "title": normalize_text(item.get("title", ""), ""),
                "file": normalize_text(item.get("file", ""), ""),
                "url": normalize_text(item.get("url", ""), ""),
                "comment": normalize_text(item.get("comment", ""), ""),
            }
        )
    return items


def normalize_solution_notes(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    items: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        problem = normalize_text(item.get("problem", ""), "").strip()
        spoiler = normalize_text(item.get("spoiler", ""), "").strip()
        if problem or spoiler:
            items.append({"problem": problem, "spoiler": spoiler})
    return items


def normalize_photos(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []

    photos: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        photos.append(
            {
                "file": normalize_text(item.get("file", ""), ""),
                "comment": normalize_text(item.get("comment", ""), ""),
            }
        )
    return photos


# Maps raw status strings to canonical values; warns on unrecognized inputs.
def normalize_status(value: Any, label: str) -> str:
    raw = normalize_text(value, "").strip().lower()
    if not raw or raw == "draft":
        return "draft"
    if raw in ("ongoing", "en curso"):
        return "ongoing"
    if raw in ("published", "finalizado", "terminado", "completado"):
        return "published"
    original = normalize_text(value, "").strip()
    if original:
        print(f"[WARN] {label}: unrecognized status '{original}'")
    return original


def resolve_local_reference(reference: str, base_dir: Path) -> Path | None:
    ref = normalize_text(reference, "").strip()
    if not ref or ref.startswith(("http://", "https://")):
        return None
    if ref.startswith("/"):
        return ROOT_DIR / ref.lstrip("/")
    return (base_dir / ref).resolve()


def copy_asset(source_path: Path, missing_assets: set[str], copied_assets: set[Path]) -> None:
    if not source_path.exists():
        missing_assets.add(relative_path(source_path))
        return

    try:
        destination = OUTPUT_DIR / source_path.relative_to(DATA_DIR)
    except ValueError:
        missing_assets.add(str(source_path))
        return

    if destination in copied_assets:
        return

    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_path, destination)
    copied_assets.add(destination)


def build_speakers(missing_assets: set[str], copied_assets: set[Path]) -> list[dict[str, Any]]:
    speakers: list[dict[str, Any]] = []
    for speaker_file in sorted(SPEAKERS_DIR.glob("*.yml")):
        speaker = load_yaml(speaker_file)
        photo_reference = normalize_text(speaker.get("photo", ""), "")
        photo_source = resolve_local_reference(photo_reference, speaker_file.parent)
        photo = photo_reference
        if photo_source is not None:
            copy_asset(photo_source, missing_assets, copied_assets)
            try:
                photo = relative_path(photo_source)
            except ValueError:
                photo = photo_reference
        speakers.append(
            {
                "id": normalize_text(speaker.get("id", speaker_file.stem), speaker_file.stem),
                "name": normalize_text(speaker.get("name", ""), ""),
                "role": normalize_text(speaker.get("role", ""), ""),
                "bio": normalize_text(speaker.get("bio", ""), ""),
                "photo": photo,
                "contacts": speaker.get("contacts", {}) if isinstance(speaker.get("contacts"), dict) else {},
            }
        )
    return speakers


def build_years_courses_sessions(
    missing_assets: set[str], copied_assets: set[Path]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    years: list[dict[str, Any]] = []
    courses: list[dict[str, Any]] = []
    sessions: list[dict[str, Any]] = []

    for year_dir in sorted(path for path in YEARS_DIR.iterdir() if path.is_dir()):
        years.append({"id": year_dir.name})

        for course_dir in sorted(path for path in year_dir.iterdir() if path.is_dir()):
            course_file = course_dir / "course.yml"
            if not course_file.exists():
                continue

            course = load_yaml(course_file)
            course_id = course.get("id", course_dir.name)
            course_photos = normalize_photos(course.get("photos", []))

            for photo in course_photos:
                source_path = resolve_local_reference(photo.get("file", ""), course_dir)
                if source_path is not None:
                    copy_asset(source_path, missing_assets, copied_assets)

            courses.append(
                {
                    "id": normalize_scalar(course_id, course_dir.name),
                    "title": normalize_scalar(course.get("title", course_id), str(course_id)),
                    "year": str(normalize_scalar(course.get("year", year_dir.name), year_dir.name)),
                    "description": normalize_text(course.get("description", ""), ""),
                    "status": normalize_status(course.get("status"), f"Course '{course_id}'"),
                    "tags": normalize_string_list(course.get("tags", [])),
                    "path": relative_path(course_dir),
                    "photos": course_photos,
                }
            )

            sessions_dir = course_dir / "sessions"
            if not sessions_dir.exists():
                continue

            for session_dir in sorted(path for path in sessions_dir.iterdir() if path.is_dir()):
                session_file = session_dir / "session.yml"
                if not session_file.exists():
                    continue

                session = load_yaml(session_file)
                speaker_ids = session.get("speaker_ids", [])
                if not isinstance(speaker_ids, list):
                    speaker_ids = []
                materials = session.get("materials", {})
                if not isinstance(materials, dict):
                    materials = {}
                slides = normalize_link_items(materials.get("slides", []))
                extra_pdfs = normalize_link_items(materials.get("extra_pdfs", []))
                extra_files = normalize_link_items(materials.get("extra_files", session.get("extra_files", [])))
                problem_list = normalize_link_items(session.get("problem_list", []))
                practice_contests = normalize_link_items(session.get("practice_contests", []))
                extra_links = normalize_link_items(session.get("extra_links", []))
                extra_notes, links_from_notes = normalize_extra_notes_and_links(session.get("extra_notes", []))
                extra_links.extend(links_from_notes)
                photos = normalize_photos(session.get("photos", []))

                for item in slides + extra_pdfs + extra_files + extra_links + photos:
                    source_path = resolve_local_reference(item.get("file", ""), session_dir)
                    if source_path is not None:
                        copy_asset(source_path, missing_assets, copied_assets)

                session_id = normalize_scalar(session.get("id", session_dir.name), session_dir.name)
                sessions.append(
                    {
                        "id": session_id,
                        "title": normalize_scalar(session.get("title", session_dir.name), session_dir.name),
                        "date": normalize_scalar(session.get("date", ""), ""),
                        "course_id": normalize_scalar(session.get("course_id", course_id), str(course_id)),
                        "path": relative_path(session_dir),
                        "speaker_ids": [speaker_id for speaker_id in speaker_ids if isinstance(speaker_id, str)],
                        "summary": normalize_text(session.get("summary", ""), ""),
                        "status": normalize_status(session.get("status"), f"Session '{session_id}'"),
                        "tags": normalize_string_list(session.get("tags", [])),
                        "materials": {
                            "slides": slides,
                            "extra_pdfs": extra_pdfs,
                            "extra_files": extra_files,
                        },
                        "problem_list": problem_list,
                        "practice_contests": practice_contests,
                        "extra_links": extra_links,
                        "extra_notes": extra_notes,
                        "photos": photos,
                        "solution_notes": normalize_solution_notes(session.get("solution_notes", [])),
                    }
                )

    return years, courses, sessions


def write_json(filename: str, payload: list[dict[str, Any]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / filename
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def main() -> None:
    missing_assets: set[str] = set()
    copied_assets: set[Path] = set()

    speakers = build_speakers(missing_assets, copied_assets)
    years, courses, sessions = build_years_courses_sessions(missing_assets, copied_assets)

    # Validate that every speaker_id referenced in sessions exists in data/speakers/.
    known_speaker_ids = {s["id"] for s in speakers}
    for session in sessions:
        for sid in session.get("speaker_ids", []):
            if sid not in known_speaker_ids:
                print(f"[WARN] Session '{session['id']}': speaker_id '{sid}' not found in data/speakers/")

    write_json("years.json", years)
    write_json("courses.json", courses)
    write_json("sessions.json", sessions)
    write_json("speakers.json", speakers)

    print(f"Generated JSON data in {OUTPUT_DIR}")
    print(f"Copied {len(copied_assets)} referenced asset(s) into {OUTPUT_DIR}")
    if missing_assets:
        print("Missing referenced files:")
        for asset in sorted(missing_assets):
            print(f"  - {asset}")


if __name__ == "__main__":
    main()
