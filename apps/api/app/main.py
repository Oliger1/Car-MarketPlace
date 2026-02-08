"""
FastAPI Application - Main Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.db.base import Base, engine
from app.routers import (
    auth,
    public,
    me,
    company,
    cars,
    bookings,
    booking_requests,
    customers,
    billing,
    files,
)

# Setup logging
setup_logging()

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create app
app = FastAPI(
    title="Mix API",
    description="Platforma SaaS për Qiradhënie Makinash",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Add state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(public.router, prefix="/api/public", tags=["Public"])
app.include_router(me.router, prefix="/api/me", tags=["Me"])
app.include_router(company.router, prefix="/api/company", tags=["Company"])
app.include_router(cars.router, prefix="/api/cars", tags=["Cars"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(
    booking_requests.router, prefix="/api/booking-requests", tags=["Booking Requests"]
)
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
    )