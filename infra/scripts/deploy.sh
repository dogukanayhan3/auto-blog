#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

set -e

# Configuration - UPDATE THIS!
AWS_ACCOUNT_ID="673353196782"   # <--AWS Acoount ID 
AWS_REGION="us-east-1"
ECR_FRONTEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auto-blog-frontend:latest"
ECR_BACKEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auto-blog-backend:latest"

echo -e "${YELLOW}🚀 Starting deployment...${NC}"

# Login to ECR
echo -e "${YELLOW}🔑 Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker pull $ECR_FRONTEND || echo -e "${YELLOW}ℹ️  Frontend image not found${NC}"
docker pull $ECR_BACKEND || echo -e "${YELLOW}ℹ️  Backend image not found${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker stop blog-backend blog-frontend 2>/dev/null || true
docker rm blog-backend blog-frontend 2>/dev/null || true

# Create data volume
docker volume create blog-data 2>/dev/null || true

# Run backend
echo -e "${YELLOW}▶️  Starting backend...${NC}"
docker run -d \
  --name blog-backend \
  -p 5000:5000 \
  --restart unless-stopped \
  -v blog-data:/app/src/data \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  $ECR_BACKEND

echo -e "${GREEN}✅ Backend started${NC}"
sleep 3

# Run frontend
echo -e "${YELLOW}▶️  Starting frontend...${NC}"
docker run -d \
  --name blog-frontend \
  -p 80:80 \
  --restart unless-stopped \
  --link blog-backend:backend \
  $ECR_FRONTEND

echo -e "${GREEN}✅ Frontend started${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Frontend: ${YELLOW}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "Backend API: ${YELLOW}http://$(hostname -I | awk '{print $1}'):5000${NC}"
echo ""