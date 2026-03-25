#!/bin/bash
# SSL setup script for prodgypsy.xyz
# Run AFTER deploy.sh and AFTER DNS is pointing to 92.5.94.220

set -e

echo "=== Setting up SSL for prodgypsy.xyz ==="

# Create certbot directories
mkdir -p certbot/conf certbot/www

# Stop current containers
docker-compose down

# Get SSL certificate using standalone mode
echo "Getting SSL certificate..."
docker run -it --rm \
    -p 80:80 \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --standalone \
    -d prodgypsy.xyz \
    -d www.prodgypsy.xyz \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email

# Switch to SSL nginx config
echo "Switching to SSL configuration..."
cp nginx-ssl.conf nginx.conf

# Update docker-compose for SSL
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  gypsycfg:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    restart: unless-stopped
EOF

# Rebuild and start with SSL
docker-compose up -d --build

echo ""
echo "=== SSL is configured! ==="
echo "Your site: https://prodgypsy.xyz"
echo ""
echo "SSL will auto-renew via certbot container."
