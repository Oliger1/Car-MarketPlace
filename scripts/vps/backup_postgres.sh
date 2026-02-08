#!/bin/bash
# scripts/vps/backup_postgres.sh

set -e

BACKUP_DIR="/var/mix/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="mix_db_${DATE}.sql.gz"
KEEP_DAYS=7
KEEP_MONTHLY=3

# Load environment variables
if [ -f /home/deploy/mix/.env ]; then
    source /home/deploy/mix/.env
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "🔄 Duke filluar backup..."

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup database
docker exec mix-db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > "${BACKUP_DIR}/${FILENAME}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup u krijua: ${FILENAME}"

    # Get backup size
    SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
    echo "📦 Madhësia: ${SIZE}"
else
    echo "❌ Backup dështoi!"
    exit 1
fi

# Keep last 7 daily backups
echo "🗑️  Duke pastruar backups të vjetër..."
find ${BACKUP_DIR} -name "mix_db_*.sql.gz" -mtime +${KEEP_DAYS} -delete

# Keep monthly backups (first of month)
DAY=$(date +%d)
if [ "$DAY" = "01" ]; then
    MONTHLY_DIR="${BACKUP_DIR}/monthly"
    mkdir -p ${MONTHLY_DIR}
    cp "${BACKUP_DIR}/${FILENAME}" "${MONTHLY_DIR}/"

    # Keep last 3 monthly backups
    cd ${MONTHLY_DIR}
    ls -t mix_db_*.sql.gz | tail -n +$((KEEP_MONTHLY + 1)) | xargs -r rm
fi

# Optional: Upload to S3 (uncomment when ready)
# if command -v aws &> /dev/null; then
#     aws s3 cp "${BACKUP_DIR}/${FILENAME}" s3://your-backup-bucket/mix/
#     echo "☁️  Uploaded to S3"
# fi

echo "✅ Backup completed successfully!"