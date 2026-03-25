#!/bin/bash
# GypsyCFG - Oracle Cloud Free deployment script
# Run this on your Oracle Cloud VM (92.5.94.220)

set -e

echo "=== GypsyCFG Deployment Script ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    echo "Docker installed. Please log out and back in, then run this script again."
    exit 0
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Open firewall ports
echo "Opening firewall ports..."
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "ERROR: .env file not found!"
    echo "Create it first: cp .env.example .env"
    echo "Then edit it with your Supabase credentials."
    exit 1
fi

# Build and start
echo "Building and starting GypsyCFG..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

echo ""
echo "=== GypsyCFG is running! ==="
echo "HTTP:  http://prodgypsy.xyz"
echo ""
echo "Next step: Run ./setup-ssl.sh to enable HTTPS"
