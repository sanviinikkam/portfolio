# 🛡️ Cyber Threat Tracker

A comprehensive, production-ready full-stack application for tracking and analyzing cyber threats in real-time. Built with modern technologies and following security best practices.

![Cyber Threat Tracker](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, Analyst, Viewer)
- **Password strength validation** and secure hashing
- **Session management** with automatic token refresh

### 📊 Real-time Threat Monitoring
- **Live threat feed** with WebSocket integration
- **Real-time notifications** for new threats
- **Advanced filtering** by type, severity, location, and date
- **Search functionality** across threat descriptions and metadata

### 📈 Analytics & Visualization
- **Interactive dashboards** with multiple chart types
- **Threat statistics** and trend analysis
- **Geographic distribution** mapping
- **Time-series analysis** for threat patterns
- **Severity distribution** and impact assessment

### 🚨 Threat Management
- **Comprehensive threat submission** form
- **Threat lifecycle tracking** (Active, Investigating, Resolved)
- **Collaborative threat analysis** with user attribution
- **Bulk operations** for threat management

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Smooth animations** with Framer Motion
- **Dark/Light mode** support (planned)
- **Accessibility compliance** (WCAG 2.1)
- **Mobile-first** design approach

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with Sequelize ORM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Rate Limiting** for DDoS protection
- **Helmet** for security headers

#### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Hook Form** with Yup validation
- **Framer Motion** for animations
- **Axios** for API communication
- **React Router** for navigation

#### DevOps & Deployment
- **Docker** containerization
- **Docker Compose** for orchestration
- **Nginx** for production serving
- **PostgreSQL** for data persistence
- **Redis** for caching (optional)

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Node.js 18+** (for local development)
- **PostgreSQL 15+** (for local development)

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cyber-threat-tracker
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### 💻 Local Development Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database connection in .env
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure API URLs in .env
npm start
```

## 📋 Environment Configuration

### Backend Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyber_threat_tracker
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# App Configuration
REACT_APP_NAME=Cyber Threat Tracker
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `email` (String, Unique, Required)
- `password_hash` (String, Required)
- `role` (Enum: admin, analyst, viewer)
- `is_active` (Boolean)
- `last_login` (DateTime)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Threats Table
- `id` (UUID, Primary Key)
- `type` (Enum: DDoS, Phishing, Malware, etc.)
- `location` (String, Required)
- `country` (String, Required)
- `city` (String, Optional)
- `latitude` (Decimal, Optional)
- `longitude` (Decimal, Optional)
- `severity` (Enum: Low, Medium, High)
- `time_detected` (DateTime, Required)
- `description` (Text, Required)
- `status` (Enum: Active, Investigating, Resolved, False Positive)
- `source` (String, Optional)
- `created_by` (UUID, Foreign Key to Users)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Threats Endpoints
- `GET /api/threats` - List threats with filtering
- `POST /api/threats` - Create new threat (Analyst+)
- `GET /api/threats/:id` - Get specific threat
- `PUT /api/threats/:id` - Update threat
- `DELETE /api/threats/:id` - Delete threat
- `GET /api/threats/stats` - Get threat statistics

### WebSocket Events
- `new-threat` - New threat created
- `threat-updated` - Threat updated
- `threat-deleted` - Threat deleted

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### End-to-End Tests
```bash
# Run with Docker Compose
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🔒 Security Features

- **Input validation** and sanitization
- **SQL injection protection** via ORM
- **XSS prevention** with proper escaping
- **CSRF protection** with SameSite cookies
- **Rate limiting** to prevent abuse
- **Security headers** via Helmet.js
- **Password hashing** with bcrypt
- **JWT token security** with proper expiration
- **Role-based access control**
- **Environment variable protection**

## 📊 Performance Optimizations

- **Database indexing** for common queries
- **Connection pooling** for database
- **Static asset caching** with proper headers
- **Gzip compression** for responses
- **Lazy loading** for React components
- **Memoization** for expensive computations
- **WebSocket connection management**
- **Pagination** for large datasets

## 🚀 Deployment

### Production Deployment
```bash
# Using Docker Compose with production overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or build and deploy separately
docker build -t cyber-threat-tracker-backend ./backend
docker build -t cyber-threat-tracker-frontend ./frontend
```

### Cloud Deployment
The application is ready for deployment on:
- **AWS** (ECS, RDS, ElastiCache)
- **Google Cloud Platform** (Cloud Run, Cloud SQL)
- **Azure** (Container Instances, PostgreSQL)
- **DigitalOcean** (App Platform, Managed Databases)
- **Kubernetes** clusters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow **ESLint** and **Prettier** configurations
- Write **comprehensive tests** for new features
- Update **documentation** for API changes
- Follow **conventional commit** messages
- Ensure **security best practices**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** and **Node.js** communities
- **Tailwind CSS** for the amazing utility-first framework
- **PostgreSQL** for robust database capabilities
- **Socket.IO** for real-time communication
- **Docker** for containerization excellence

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for cybersecurity professionals worldwide**
