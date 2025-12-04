# 🚀 Auto-Blog: AI-Generated Blog System

Fully automated blog platform that generates articles daily using HuggingFace AI.

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐
│   React     │         │  HuggingFace │
│  Frontend   │────────▶│  AI API      │
└─────────────┘         └──────────────┘
       │                       ▲
       │                       │
       ▼                       │
┌─────────────────────────────────────┐
│      Node.js + Express Backend      │
│  - REST API                         │
│  - JSON Storage (articles.json)     │
│  - Daily Cron Job (node-cron)      │
└─────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend:** React 19 + React Router + Nginx
- **Backend:** Node.js + Express + node-cron
- **AI:** HuggingFace Inference API (Mistral-7B)
- **Storage:** JSON files (Docker volume)
- **Deployment:** Docker + AWS EC2 + AWS CodeBuild + AWS ECR

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+
- AWS Account (free tier)
- HuggingFace API key (free)

## 🚀 Quick Start (Local Development)

### 1. Clone and Setup

```bash
git clone https://github.com/YOUR_USERNAME/auto-blog.git
cd auto-blog

# Create .env file
echo "HUGGINGFACE_API_KEY=hf_YOUR_KEY_HERE" > .env
```

Get your free HuggingFace API key: https://huggingface.co/settings/tokens

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

Visit:
- **Frontend:** http://localhost
- **Backend:** http://localhost:3001
- **Health:** http://localhost:3001/health

### 3. Generate Initial Articles

```bash
docker exec auto-blog-backend npm run seed
```

## 📦 AWS Deployment

### Prerequisites

```bash
# Install AWS CLI
brew install awscli

# Configure AWS
aws configure
# Enter your Access Key, Secret Key, Region (us-east-1)
```

### 1. Create ECR Repositories

```bash
aws ecr create-repository --repository-name auto-blog-frontend --region us-east-1
aws ecr create-repository --repository-name auto-blog-backend --region us-east-1

# Get your AWS Account ID
aws sts get-caller-identity
```

### 2. Launch EC2 Instance

1. Go to AWS EC2 Dashboard
2. Click "Launch Instance"
3. Configure:
   - **Name:** auto-blog-server
   - **AMI:** Ubuntu 22.04 LTS
   - **Instance type:** t2.micro (free tier)
   - **Storage:** 30GB
   - **Security Group:** Allow ports 22, 80, 443, 5000
4. Download key pair: `auto-blog-key.pem`

### 3. Initialize EC2

```bash
# Connect to EC2
chmod 400 ~/Downloads/auto-blog-key.pem
ssh -i ~/Downloads/auto-blog-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Run initialization script (on EC2)
# First, download the script or copy it manually
bash init-ec2.sh

# Configure AWS
aws configure
# Use same credentials as your local machine

# Exit
exit
```

### 4. Setup CodeBuild (Automated Builds)

1. Go to AWS CodeBuild
2. Click "Create build project"
3. Configure:
   - **Name:** auto-blog-build
   - **Source:** GitHub (connect your repo)
   - **Environment:** Ubuntu, Standard:7.0
   - **Privileged mode:** ✓ (for Docker)
   - **Buildspec:** Use `buildspec.yml` from source
4. Create build project
5. Add IAM permissions:
   - Go to IAM → Find CodeBuild service role
   - Attach: `AmazonEC2ContainerRegistryPowerUser`

### 5. Deploy to EC2

```bash
# SSH into EC2
ssh -i ~/Downloads/auto-blog-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Configure AWS CLI
aws configure

# Run deployment
bash /home/ubuntu/auto-blog/deploy.sh

# Verify
curl http://localhost:5000/health
```

## 📝 API Endpoints

```bash
# Get all articles
curl http://YOUR_EC2_IP:3001/api/articles

# Get single article
curl http://YOUR_EC2_IP:3001/api/articles/1
# or by slug
curl http://YOUR_EC2_IP:3001/api/articles/exploring-artificial-intelligence

# Health check
curl http://YOUR_EC2_IP:3001/health

# Manual article generation (for testing)
curl -X POST http://YOUR_EC2_IP:3001/api/articles/generate
```

## 🔧 Environment Variables

### Backend

```bash
PORT=5000
NODE_ENV=production
HUGGINGFACE_API_KEY=hf_your_key_here
```

### Frontend

```bash
REACT_APP_API_URL=http://your-backend-url/api
```

## 📅 Automatic Article Generation

Articles are automatically generated daily at **9:00 AM UTC** using `node-cron`.

**In development:** Every hour (for testing)
**In production:** Every day at 9:00 AM

Check logs:
```bash
docker logs auto-blog-backend -f
```

## 🗂️ Project Structure

```
auto-blog/
├── backend/
│   ├── src/
│   │   ├── index.js                 # Express server
│   │   ├── routes/
│   │   │   └── articles.js         # API routes
│   │   ├── services/
│   │   │   ├── aiClient.js         # HuggingFace integration
│   │   │   └── articleJob.js       # Cron job scheduler
│   │   ├── models/
│   │   │   └── db.js               # JSON database
│   │   └── data/                    # Persistent storage
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── ArticleCard.jsx
│   │   │   └── Loading.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   └── ArticlePage.js
│   │   └── api/
│   │       └── client.js           # Axios instance
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── infra/
│   ├── buildspec.yml               # AWS CodeBuild config
│   └── scripts/
│       ├── deploy.sh               # Deployment script
│       └── init-ec2.sh             # EC2 initialization
│
├── docker-compose.yml              # Local development
├── .env                            # Environment variables
└── README.md
```

## 🧪 Testing

### Local Testing

```bash
# Start everything
docker-compose up --build

# In another terminal, test endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/articles

# Generate test article
curl -X POST http://localhost:5000/api/articles/generate
```

### Check Logs

```bash
# Backend logs
docker logs auto-blog-backend -f

# Frontend logs
docker logs auto-blog-frontend -f

# View articles (local)
cat backend/src/data/articles.json | jq .
```

## 🐛 Troubleshooting

### Articles not generating?

```bash
# Check backend logs
docker logs auto-blog-backend

# Verify HuggingFace API key
echo $HUGGINGFACE_API_KEY

# Manual trigger
curl -X POST http://localhost:5000/api/articles/generate
```

### Frontend not connecting to backend?

```bash
# Check REACT_APP_API_URL
cat frontend/.env

# Backend must be running
curl http://localhost:5000/health
```

### Docker build fails?

```bash
# Clean up
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```

## 📊 Monitoring

### Check container status

```bash
docker ps
```

### View storage

```bash
# On EC2
docker exec auto-blog-backend du -sh /app/src/data/
docker volume ls
```

## 🚀 Production Checklist

- [ ] HuggingFace API key set
- [ ] AWS account created
- [ ] EC2 instance running
- [ ] Security group configured (ports 22, 80, 5000)
- [ ] CodeBuild project created
- [ ] ECR repositories created
- [ ] Articles.json has initial data
- [ ] Cron job is running (check logs)
- [ ] DNS/URL ready for video submission

## 📧 Submission Checklist

Before emailing hiring@assimetria.com:

- [ ] Live URL: `http://YOUR_EC2_PUBLIC_IP`
- [ ] GitHub repo public with code
- [ ] 60-second video explaining the project
- [ ] At least 3 articles visible
- [ ] Can click and read full articles
- [ ] Articles generating daily (check backend logs)

## 📧 Email Template

```
To: hiring@assimetria.com
Subject: [Tech Challenge] - Your Name

Hello,

I've completed the Auto-Blog technical challenge.

Live URL: http://YOUR_EC2_PUBLIC_IP

GitHub Repository: https://github.com/YOUR_USERNAME/auto-blog

Demo Video: https://loom.com/share/VIDEO_ID

The application successfully:
✅ Displays AI-generated blog articles
✅ Allows reading full articles
✅ Generates new articles daily via cron
✅ Deployed on AWS EC2 with Docker
✅ Uses CodeBuild for CI/CD

Technical details:
- Frontend: React + Nginx
- Backend: Node.js + Express
- Storage: JSON files (persistent)
- AI: HuggingFace Mistral-7B
- Infrastructure: Docker + AWS

Thank you,
Your Name
```

## 🙏 Support

Having issues? Check:
1. Backend logs: `docker logs auto-blog-backend`
2. Frontend logs: `docker logs auto-blog-frontend`
3. GitHub issues (if applicable)

## 📄 License

MIT