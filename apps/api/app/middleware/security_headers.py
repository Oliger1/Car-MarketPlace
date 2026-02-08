"""
Security Headers Middleware (backup if Caddy doesn't set them)
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to responses
    Note: Caddy should handle most of these, this is backup
    """

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # Only add if not already set by Caddy
        if "X-Content-Type-Options" not in response.headers:
            response.headers["X-Content-Type-Options"] = "nosniff"

        if "X-Frame-Options" not in response.headers:
            response.headers["X-Frame-Options"] = "SAMEORIGIN"

        return response