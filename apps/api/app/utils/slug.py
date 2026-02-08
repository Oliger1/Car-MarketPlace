"""
Slug utilities
"""
import re
import unicodedata


def slugify(text: str) -> str:
    """
    Convert text to URL-friendly slug
    Handles Albanian characters
    """
    # Albanian character mapping
    replacements = {
        'ë': 'e',
        'ç': 'c',
        'Ë': 'E',
        'Ç': 'C',
    }

    # Replace Albanian characters
    for old, new in replacements.items():
        text = text.replace(old, new)

    # Normalize to ASCII
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')

    # Convert to lowercase
    text = text.lower()

    # Replace spaces and special chars with hyphens
    text = re.sub(r'[^a-z0-9]+', '-', text)

    # Remove leading/trailing hyphens
    text = text.strip('-')

    # Remove consecutive hyphens
    text = re.sub(r'-+', '-', text)

    return text


def ensure_unique_slug(base_slug: str, existing_slugs: list) -> str:
    """
    Ensure slug is unique by appending number if needed
    """
    if base_slug not in existing_slugs:
        return base_slug

    counter = 1
    while f"{base_slug}-{counter}" in existing_slugs:
        counter += 1

    return f"{base_slug}-{counter}"