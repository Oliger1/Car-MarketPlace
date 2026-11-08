"""
Configuration settings
"""
import re

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    DATABASE_URL: str = "postgresql://mix:mixdev@localhost:5432/mix"

    SECRET_KEY: str = "dev-only-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:5174,http://127.0.0.1:5174"
    )

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"

    ENVIRONMENT: str = "development"
    TIMEZONE: str = "Europe/Tirane"

    MAX_PHOTOS_PER_CAR: int = 5

    # Emails that can manage plans & cash subscriptions (comma-separated)
    PLATFORM_ADMIN_EMAILS: str = "admin@mix.al"

    # Public apex domain (e.g. mix.al) — used for CORS, cookies, Caddy
    DOMAIN: str = "localhost"

    # Transactional email (Resend). Empty key = log + no-op.
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Mix <noreply@mix.al>"
    APP_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    def get_allowed_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        domain = (self.DOMAIN or "").strip().lower()
        if domain and domain not in {"localhost", "127.0.0.1"}:
            apex = f"https://{domain}"
            if apex not in origins:
                origins.append(apex)
            www = f"https://www.{domain}"
            if www not in origins:
                origins.append(www)
        return origins

    def get_cors_origin_regex(self) -> str:
        """Allow localhost tenants + https://*.DOMAIN in prod."""
        local = r"https?://([a-z0-9-]+\.)?(localhost|127\.0\.0\.1)(:\d+)?"
        domain = (self.DOMAIN or "").strip().lower()
        if domain and domain not in {"localhost", "127.0.0.1"}:
            escaped = re.escape(domain)
            return rf"^({local}|https://([a-z0-9-]+\.)?{escaped})$"
        return rf"^{local}$"

    def get_allowed_image_types(self) -> list[str]:
        return [img_type.strip() for img_type in self.ALLOWED_IMAGE_TYPES.split(",") if img_type.strip()]

    def get_platform_admin_emails(self) -> list[str]:
        return [e.strip().lower() for e in self.PLATFORM_ADMIN_EMAILS.split(",") if e.strip()]

    def is_platform_admin_email(self, email: str) -> bool:
        return email.strip().lower() in self.get_platform_admin_emails()

    def cookie_domain(self) -> str | None:
        """Share auth cookie across apex + subdomains in production."""
        domain = (self.DOMAIN or "").strip().lower()
        if not self.is_production or not domain or domain in {"localhost", "127.0.0.1"}:
            return None
        return f".{domain}"


settings = Settings()
