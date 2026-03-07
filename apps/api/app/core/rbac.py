from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable, Set

@dataclass(frozen=True)
class Permission:
    name: str

# Permissions (fillojme me këto, pastaj shtojme)
P_COMPANY_READ   = Permission("company:read")
P_COMPANY_WRITE  = Permission("company:write")
P_CARS_READ      = Permission("cars:read")
P_CARS_WRITE     = Permission("cars:write")
P_BOOKINGS_READ  = Permission("bookings:read")
P_BOOKINGS_WRITE = Permission("bookings:write")
P_BILLING_ADMIN  = Permission("billing:admin")
P_ADMIN          = Permission("admin:*")

ROLE_PERMS = {
    "owner": {
        P_ADMIN.name,
        P_COMPANY_READ.name, P_COMPANY_WRITE.name,
        P_CARS_READ.name, P_CARS_WRITE.name,
        P_BOOKINGS_READ.name, P_BOOKINGS_WRITE.name,
        P_BILLING_ADMIN.name,
    },
    "manager": {
        P_COMPANY_READ.name,
        P_CARS_READ.name, P_CARS_WRITE.name,
        P_BOOKINGS_READ.name, P_BOOKINGS_WRITE.name,
    },
    "staff": {
        P_COMPANY_READ.name,
        P_CARS_READ.name,
        P_BOOKINGS_READ.name, P_BOOKINGS_WRITE.name,
    },
    "viewer": {
        P_COMPANY_READ.name,
        P_CARS_READ.name,
        P_BOOKINGS_READ.name,
    }
}

def perms_for_roles(roles: Iterable[str]) -> Set[str]:
    out: Set[str] = set()
    for r in roles:
        out |= set(ROLE_PERMS.get(r, set()))
    return out

def has_perm(user_roles: Iterable[str], required: str) -> bool:
    perms = perms_for_roles(user_roles)
    return ("admin:*" in perms) or (required in perms)
