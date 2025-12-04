#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

set -e

echo -e "${YELLOW}🚀 Initializing EC2 instance...${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh

# Install Docker Compose
echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
echo -e "${YELLOW}☁️  Installing AWS CLI...${NC}"
sudo apt install -y awscli

# Create project directories
mkdir -p ~/auto-blog
mkdir -p ~/auto-blog/data

# Verify installations
echo -e "${YELLOW}✓ Verifying installations...${NC}"
docker --version
docker-compose --version
aws --version

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ EC2 initialization complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Create ECR repositories (on your Mac)"
echo "3. Run deployment: bash ~/auto-blog/deploy.sh"
echo ""
echo -e "${YELLOW}⚠️  Important: You need to configure AWS CLI with your credentials${NC}"
echo "Run: aws configure"
echo ""