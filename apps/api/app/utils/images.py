"""
Image utilities
"""
from PIL import Image
from typing import Tuple
import io


def verify_image(file_content: bytes) -> bool:
    """
    Verify that file is a valid image
    """
    try:
        img = Image.open(io.BytesIO(file_content))
        img.verify()
        return True
    except Exception:
        return False


def get_image_dimensions(file_content: bytes) -> Tuple[int, int]:
    """
    Get image dimensions (width, height)
    """
    img = Image.open(io.BytesIO(file_content))
    return img.size


def strip_exif(file_path: str) -> None:
    """
    Remove EXIF data from image for privacy/security
    """
    try:
        img = Image.open(file_path)

        # Remove EXIF data
        data = list(img.getdata())
        image_without_exif = Image.new(img.mode, img.size)
        image_without_exif.putdata(data)

        # Save without EXIF
        image_without_exif.save(file_path)
    except Exception as e:
        # If EXIF stripping fails, continue anyway
        print(f"Warning: Could not strip EXIF from {file_path}: {e}")


def resize_image_if_needed(
        file_path: str,
        max_width: int = 2000,
        max_height: int = 2000,
        quality: int = 85
) -> None:
    """
    Resize image if it exceeds max dimensions
    """
    img = Image.open(file_path)

    if img.width > max_width or img.height > max_height:
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        img.save(file_path, quality=quality, optimize=True)