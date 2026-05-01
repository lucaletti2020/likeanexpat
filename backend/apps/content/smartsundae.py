"""
Read-only client for the SmartSundae/Global Coders public API.
Collections, modules, and sections endpoints require no authentication.
Results are cached in Django's cache backend for 1 hour.
"""
import requests
from django.core.cache import cache

BASE = "https://dev.smartsundae.com/api/v2/teacher/meeting"
TTL = 3600  # 1 hour


def _get(url, cache_key):
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    cache.set(cache_key, data, TTL)
    return data


def get_collections():
    return _get(f"{BASE}/collections/English", "ss:collections")


def get_modules():
    """Returns a list of collections, each with a nested `modules` list."""
    return _get(f"{BASE}/modules/English", "ss:modules")


def get_sections(module_external_id: str) -> list:
    """Returns the list of sections for a module (usually 1 item)."""
    return _get(f"{BASE}/sections/{module_external_id}", f"ss:sections:{module_external_id}")


def get_module_info(module_external_id: str) -> dict | None:
    """Find a single module's metadata from the cached modules list."""
    modules_data = get_modules()
    for collection in modules_data:
        for mod in collection.get("modules", []):
            if mod["id"] == module_external_id:
                return {
                    "id": mod["id"],
                    "title": mod["module_name"],
                    "description": mod.get("module_description") or "",
                    "collection_name": collection["name"],
                    "collection_id": collection["id"],
                    "level": mod.get("level", {}).get("cefr", ""),
                }
    return None


def get_section_instructions(module_external_id: str) -> str:
    """Return the first section's AI instructions string, or empty string."""
    sections = get_sections(module_external_id)
    if sections:
        return sections[0].get("instructions", "")
    return ""


def get_section_complements(module_external_id: str) -> list[str]:
    """Return the complement phrases (conversation starters) for the first section."""
    sections = get_sections(module_external_id)
    if sections:
        return [c["complement"] for c in sections[0].get("complements", [])]
    return []
