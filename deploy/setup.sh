#!/bin/bash
# Initial server setup for Lakeland Health Navigator
# Run on a fresh Ubuntu 22.04 instance in AWS ca-central-1

set -e

echo "=== Installing Docker ==="
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

echo "=== Installing Docker Compose ==="
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "=== Creating app directory ==="
sudo mkdir -p /opt/lakeland-health
sudo chown $USER:$USER /opt/lakeland-health

echo "=== Setting up SSL with Certbot ==="
sudo apt-get update && sudo apt-get install -y certbot
sudo certbot certonly --standalone -d lakelandhealth.ca -d www.lakelandhealth.ca

echo "=== Linking certs ==="
mkdir -p /opt/lakeland-health/deploy/certs
sudo ln -sf /etc/letsencrypt/live/lakelandhealth.ca/fullchain.pem /opt/lakeland-health/deploy/certs/fullchain.pem
sudo ln -sf /etc/letsencrypt/live/lakelandhealth.ca/privkey.pem /opt/lakeland-health/deploy/certs/privkey.pem

echo "=== Setting up cert renewal cron ==="
echo "0 3 * * * certbot renew --quiet && docker compose -f /opt/lakeland-health/docker-compose.prod.yml restart nginx" | sudo crontab -

echo "=== Done! ==="
echo "Next steps:"
echo "1. Copy .env.production to /opt/lakeland-health/.env"
echo "2. Copy docker-compose.prod.yml and deploy/ to /opt/lakeland-health/"
echo "3. Run: docker compose -f docker-compose.prod.yml up -d"
echo "4. Run: docker compose exec api npx prisma migrate deploy"
echo "5. Run: docker compose exec api npx prisma db seed"
