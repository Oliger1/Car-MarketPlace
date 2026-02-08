"""
IP address utilities
"""
from typing import Optional
from fastapi import Request


def get_client_ip(request: Request) -> Optional[str]:
    """
    Get client IP address from request
    Checks X-Forwarded-For header first (for proxy)
    """
    # Check X-Forwarded-For (when behind proxy)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Take first IP in chain
        return forwarded.split(",")[0].strip()

    # Check X-Real-IP
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct connection
    if request.client:
        return request.client.host

    return None