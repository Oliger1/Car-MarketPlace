"""
Configuration settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS - as comma-separated string
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Upload settings
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"

    # App settings
    ENVIRONMENT: str = "development"
    TIMEZONE: str = "Europe/Tirane"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    def get_allowed_origins(self) -> list[str]:
        """Get ALLOWED_ORIGINS as list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    def get_allowed_image_types(self) -> list[str]:
        """Get ALLOWED_IMAGE_TYPES as list"""
        return [img_type.strip() for img_type in self.ALLOWED_IMAGE_TYPES.split(",")]


settings = Settings()