# 🚀 Deployment Guide

This guide covers various deployment options for the Cyber Threat Tracker application.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Domain name (for production)
- SSL certificates (for HTTPS)
- Database backup strategy
- Monitoring setup

## 🐳 Docker Deployment (Recommended)

### Development Deployment
```bash
# Clone repository
git clone <repository-url>
cd cyber-threat-tracker

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Use production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or with custom environment
docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Deployment Options

### AWS Deployment

#### Using ECS (Elastic Container Service)
```bash
# Build and push images to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-west-2.amazonaws.com

# Tag and push backend
docker build -t cyber-threat-tracker-backend ./backend
docker tag cyber-threat-tracker-backend:latest <account>.dkr.ecr.us-west-2.amazonaws.com/cyber-threat-tracker-backend:latest
docker push <account>.dkr.ecr.us-west-2.amazonaws.com/cyber-threat-tracker-backend:latest

# Tag and push frontend
docker build -t cyber-threat-tracker-frontend ./frontend
docker tag cyber-threat-tracker-frontend:latest <account>.dkr.ecr.us-west-2.amazonaws.com/cyber-threat-tracker-frontend:latest
docker push <account>.dkr.ecr.us-west-2.amazonaws.com/cyber-threat-tracker-frontend:latest
```

#### ECS Task Definition (backend)
```json
{
  "family": "cyber-threat-tracker-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account>.dkr.ecr.us-west-2.amazonaws.com/cyber-threat-tracker-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "your-rds-endpoint"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-west-2:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cyber-threat-tracker",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

#### Using Cloud Run
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/PROJECT-ID/cyber-threat-tracker-backend ./backend
gcloud run deploy backend --image gcr.io/PROJECT-ID/cyber-threat-tracker-backend --platform managed --region us-central1

# Build and deploy frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/cyber-threat-tracker-frontend ./frontend
gcloud run deploy frontend --image gcr.io/PROJECT-ID/cyber-threat-tracker-frontend --platform managed --region us-central1
```

#### Cloud Run Configuration
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: cyber-threat-tracker-backend
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "100"
        autoscaling.knative.dev/minScale: "1"
        run.googleapis.com/cloudsql-instances: PROJECT-ID:us-central1:postgres-instance
    spec:
      containers:
      - image: gcr.io/PROJECT-ID/cyber-threat-tracker-backend
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "/cloudsql/PROJECT-ID:us-central1:postgres-instance"
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
```

### Azure Deployment

#### Using Container Instances
```bash
# Create resource group
az group create --name cyber-threat-tracker --location eastus

# Create container registry
az acr create --resource-group cyber-threat-tracker --name threattracker --sku Basic

# Build and push images
az acr build --registry threattracker --image backend:latest ./backend
az acr build --registry threattracker --image frontend:latest ./frontend

# Deploy backend
az container create \
  --resource-group cyber-threat-tracker \
  --name backend \
  --image threattracker.azurecr.io/backend:latest \
  --cpu 1 \
  --memory 1 \
  --registry-login-server threattracker.azurecr.io \
  --registry-username threattracker \
  --registry-password <password> \
  --dns-name-label threat-tracker-api \
  --ports 5000
```

## 🔧 Kubernetes Deployment

### Kubernetes Manifests

#### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: cyber-threat-tracker-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db-host
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  type: ClusterIP
```

#### Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: cyber-threat-tracker-frontend:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

#### PostgreSQL StatefulSet
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: cyber_threat_tracker
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
  clusterIP: None
```

## 🔐 SSL/TLS Configuration

### Using Let's Encrypt with Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://backend:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring and Logging

### Prometheus Configuration
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cyber-threat-tracker'
    static_configs:
      - targets: ['backend:5000', 'frontend:3000']
    metrics_path: /metrics
    scrape_interval: 30s
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Cyber Threat Tracker",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{job=\"cyber-threat-tracker\"}"
          }
        ]
      },
      {
        "title": "Active Threats",
        "type": "stat",
        "targets": [
          {
            "expr": "threats_total{status=\"active\"}"
          }
        ]
      }
    ]
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Test Backend
        run: |
          cd backend
          npm ci
          npm test
      - name: Test Frontend
        run: |
          cd frontend
          npm ci
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🗄️ Database Management

### Backup Strategy
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

# Create backup
docker exec postgres-container pg_dump -U postgres cyber_threat_tracker > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3 (optional)
aws s3 cp ${BACKUP_FILE}.gz s3://your-backup-bucket/

# Clean up old backups (keep last 30 days)
find . -name "backup_*.sql.gz" -mtime +30 -delete
```

### Database Migration
```bash
# Run migrations in production
docker exec backend-container npm run db:migrate

# Seed initial data
docker exec backend-container npm run db:seed
```

## 🔧 Environment-Specific Configurations

### Production Environment Variables
```env
# Production settings
NODE_ENV=production
PORT=5000

# Database (use managed database service)
DB_HOST=your-managed-db-host
DB_PORT=5432
DB_NAME=cyber_threat_tracker
DB_USER=app_user
DB_PASSWORD=secure_production_password

# JWT (use strong secret)
JWT_SECRET=your_super_secure_production_jwt_secret
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log

# Redis (for caching)
REDIS_URL=redis://your-redis-host:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## 🚨 Security Considerations

### Production Security Checklist
- [ ] Use HTTPS everywhere
- [ ] Implement proper CORS policies
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting
- [ ] Set up proper firewall rules
- [ ] Use managed database services
- [ ] Enable database encryption at rest
- [ ] Implement proper logging and monitoring
- [ ] Regular security updates
- [ ] Backup and disaster recovery plan
- [ ] Use secrets management service
- [ ] Implement network segmentation

### Firewall Rules
```bash
# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Allow SSH (change default port)
ufw allow 2222

# Allow database access only from application servers
ufw allow from APP_SERVER_IP to any port 5432

# Deny all other traffic
ufw default deny incoming
ufw default allow outgoing
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple instances
- Implement database read replicas
- Use Redis for session storage
- Consider microservices architecture
- Implement caching strategies

### Performance Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement database indexing
- Use connection pooling
- Monitor and optimize queries

---

This deployment guide covers the most common scenarios. For specific cloud providers or custom setups, refer to their respective documentation.
