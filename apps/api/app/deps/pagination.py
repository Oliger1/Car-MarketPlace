"""
Pagination Dependencies
"""
from fastapi import Query
from typing import Optional


class PaginationParams:
    """Pagination parameters"""

    def __init__(
            self,
            page: int = Query(1, ge=1, description="Numri i faqes"),
            limit: int = Query(20, ge=1, le=100, description="Elementë për faqe"),
    ):
        self.page = page
        self.limit = limit
        self.skip = (page - 1) * limit


def get_pagination_params(
        page: int = Query(1, ge=1),
        limit: int = Query(20, ge=1, le=100)
) -> PaginationParams:
    """Get pagination parameters"""
    return PaginationParams(page=page, limit=limit)