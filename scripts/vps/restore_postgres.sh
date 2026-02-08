#!/bin/bash
# scripts/vps/restore_postgres.sh

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.sql.gz>"
    echo "Example: $0 /var/mix/backups/mix_db_20250205_020000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment
if [ -f /home/deploy/mix/.env ]; then
    source /home/deploy/mix/.env
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "⚠️  KUJDES: Kjo do të fshijë të gjitha të dhënat aktuale!"
read -p "Jeni i sigurt? Shkruaj 'yes' për konfirmim: " confirm

if [ "$confirm" != "yes" ]; then
    echo "Anuluar."
    exit 0
fi

echo "🔄 Duke rikthyer database nga: $BACKUP_FILE"

# Stop API to prevent connections
docker-compose stop api web

# Drop and recreate database
docker exec mix-db psql -U ${POSTGRES_USER} -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"
docker exec mix-db psql -U ${POSTGRES_USER} -d postgres -c "CREATE DATABASE ${POSTGRES_DB};"

# Restore backup
gunzip -c "$BACKUP_FILE" | docker exec -i mix-db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

if [ $? -eq 0 ]; then
    echo "✅ Database u rikthye me sukses!"
else
    echo "❌ Restore dështoi!"
    exit 1
fi

# Restart services
docker-compose up -d

echo "✅ Services u rinisën!"