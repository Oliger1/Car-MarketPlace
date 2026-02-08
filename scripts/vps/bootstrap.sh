#!/bin/bash
# scripts/vps/bootstrap.sh

set -e

echo "=========================================="
echo "   MIX VPS BOOTSTRAP"
echo "=========================================="

# Update system
echo "📦 Duke përditësuar sistemin..."
apt-get update && apt-get upgrade -y

# Install essentials
echo "📦 Duke instaluar paketa të nevojshme..."
apt-get install -y \
    docker.io \
    docker-compose \
    git \
    ufw \
    fail2ban \
    postgresql-client \
    curl \
    htop \
    vim

# Start docker
systemctl enable docker
systemctl start docker

# Create deploy user
echo "👤 Duke krijuar përdoruesin deploy..."
if ! id -u deploy > /dev/null 2>&1; then
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
fi

# Setup SSH directory
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

echo ""
echo "⚠️  RËNDËSISHME: Kopjo SSH public key në /home/deploy/.ssh/authorized_keys"
echo ""
echo "Shembull:"
echo "  echo 'your-ssh-public-key' >> /home/deploy/.ssh/authorized_keys"
echo "  chmod 600 /home/deploy/.ssh/authorized_keys"
echo "  chown -R deploy:deploy /home/deploy/.ssh"
echo ""

# Setup firewall
echo "🔥 Duke konfiguruar firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# Harden SSH
echo "🔒 Duke forcuar SSH..."
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Create application directories
echo "📁 Duke krijuar directories..."
mkdir -p /var/mix/uploads
mkdir -p /var/mix/backups
mkdir -p /var/mix/data/postgres
mkdir -p /var/mix/caddy/data
mkdir -p /var/mix/caddy/config
chown -R deploy:deploy /var/mix

# Setup backup cron
echo "⏰ Duke konfiguruar backup cron..."
cat > /etc/cron.d/mix-backup <<'EOF'
# Backup database çdo ditë në 2AM
0 2 * * * deploy /home/deploy/mix/scripts/vps/backup_postgres.sh >> /var/log/mix-backup.log 2>&1
EOF

# Setup log rotation
cat > /etc/logrotate.d/mix <<'EOF'
/var/log/mix-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 deploy deploy
    sharedscripts
}
EOF

# Fail2ban basic config
echo "🛡️  Duke konfiguruar fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

echo ""
echo "=========================================="
echo "   ✅ BOOTSTRAP I PËRFUNDUAR"
echo "=========================================="
echo ""
echo "Hapat e ardhshëm:"
echo "1. Shto SSH key në /home/deploy/.ssh/authorized_keys"
echo "2. Bëj logout dhe login si deploy:"
echo "   ssh deploy@$(hostname -I | awk '{print $1}')"
echo "3. Clone repository:"
echo "   git clone https://github.com/your-org/mix.git"
echo "4. Konfiguro .env"
echo "5. Nis aplikacionin:"
echo "   cd mix && docker-compose up -d"
echo ""