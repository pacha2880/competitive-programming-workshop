from __future__ import annotations

import json
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


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
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
            courses.append(
                {
                    "id": normalize_scalar(course_id, course_dir.name),
                    "title": normalize_scalar(course.get("title", course_id), str(course_id)),
                    "year": str(normalize_scalar(course.get("year", year_dir.name), year_dir.name)),
                    "description": normalize_text(course.get("description", ""), ""),
                    "status": normalize_text(course.get("status", ""), ""),
                    "tags": normalize_string_list(course.get("tags", [])),
                    "path": relative_path(course_dir),
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
                problem_list = normalize_link_items(session.get("problem_list", []))
                practice_contests = normalize_link_items(session.get("practice_contests", []))
                photos = normalize_photos(session.get("photos", []))

                for item in slides + extra_pdfs + photos:
                    source_path = resolve_local_reference(item.get("file", ""), session_dir)
                    if source_path is not None:
                        copy_asset(source_path, missing_assets, copied_assets)

                sessions.append(
                    {
                        "id": normalize_scalar(session.get("id", session_dir.name), session_dir.name),
                        "title": normalize_scalar(session.get("title", session_dir.name), session_dir.name),
                        "date": normalize_scalar(session.get("date", ""), ""),
                        "course_id": normalize_scalar(session.get("course_id", course_id), str(course_id)),
                        "path": relative_path(session_dir),
                        "speaker_ids": [speaker_id for speaker_id in speaker_ids if isinstance(speaker_id, str)],
                        "summary": normalize_text(session.get("summary", ""), ""),
                        "status": normalize_text(session.get("status", ""), ""),
                        "tags": normalize_string_list(session.get("tags", [])),
                        "materials": {
                            "slides": slides,
                            "extra_pdfs": extra_pdfs,
                        },
                        "problem_list": problem_list,
                        "practice_contests": practice_contests,
                        "extra_notes": normalize_string_list(session.get("extra_notes", [])),
                        "photos": photos,
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
