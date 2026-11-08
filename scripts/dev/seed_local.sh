#!/bin/bash
# Seed via API container (or run locally: cd apps/api && python scripts/seed.py)
set -e
echo "🌱 Duke seed-uar database..."
docker compose exec api python scripts/seed.py
echo "✅ U krye."
