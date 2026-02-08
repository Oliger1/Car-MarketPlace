#!/bin/bash
# scripts/ci/healthcheck.sh

set -e

MAX_RETRIES=30
RETRY_DELAY=2

echo "🏥 Healthcheck duke filluar..."

check_service() {
    local name=$1
    local url=$2

    echo -n "Checking $name... "

    for i in $(seq 1 $MAX_RETRIES); do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "✅"
            return 0
        fi
        sleep $RETRY_DELAY
    done

    echo "❌ FAILED"
    return 1
}

# Check API
check_service "API" "http://localhost/api/health"

# Check Web
check_service "Web" "http://localhost"

# Check database
echo -n "Checking Database... "
if docker-compose exec -T db pg_isready -U mix > /dev/null 2>&1; then
    echo "✅"
else
    echo "❌ FAILED"
    exit 1
fi

echo ""
echo "✅ Të gjitha services janë healthy!"