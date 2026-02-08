#!/bin/bash
# scripts/dev/reset_db.sh

set -e

echo "⚠️  KUJDES: Kjo do të fshijë të gjitha të dhënat!"
read -p "Vazhdo? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Anuluar."
    exit 0
fi

echo "🗑️  Duke fshirë database..."

# Stop services
docker-compose stop api web

# Drop and recreate database
docker-compose exec db psql -U mix -d postgres -c "DROP DATABASE IF EXISTS mix;"
docker-compose exec db psql -U mix -d postgres -c "CREATE DATABASE mix;"

echo "✅ Database u rikriju!"

# Start services
docker-compose up -d

sleep 5

# Seed
./scripts/dev/seed_local.sh

echo "✅ Reset i plotë!"