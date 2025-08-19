# 🔌 API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All responses follow this standard format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "errors": array | null
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "viewer" // Optional: "admin", "analyst", "viewer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer"
    },
    "token": "jwt-token"
  }
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer"
    },
    "token": "jwt-token"
  }
}
```

### Get User Profile
```http
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

## 🚨 Threats Endpoints

### Get All Threats
```http
GET /api/threats
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `type` (string) - Filter by threat type
- `severity` (string) - Filter by severity (Low, Medium, High)
- `country` (string) - Filter by country
- `status` (string) - Filter by status
- `search` (string) - Search in description and location
- `startDate` (ISO string) - Filter by start date
- `endDate` (ISO string) - Filter by end date
- `sortBy` (string) - Sort field (default: time_detected)
- `sortOrder` (string) - Sort order (ASC, DESC)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "threats": [
      {
        "id": "uuid",
        "type": "Malware",
        "location": "Corporate Office",
        "country": "United States",
        "city": "New York",
        "severity": "High",
        "time_detected": "2024-01-01T12:00:00Z",
        "description": "Suspicious malware activity detected",
        "status": "Active",
        "created_by": "uuid",
        "created_at": "2024-01-01T12:00:00Z",
        "creator": {
          "id": "uuid",
          "name": "John Analyst",
          "email": "analyst@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

### Create New Threat
```http
POST /api/threats
```

**Required Role:** Analyst or Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "Malware",
  "location": "Corporate Office",
  "country": "United States",
  "city": "New York", // Optional
  "latitude": 40.7128, // Optional
  "longitude": -74.0060, // Optional
  "severity": "High",
  "time_detected": "2024-01-01T12:00:00Z",
  "description": "Detailed description of the threat",
  "status": "Active", // Optional
  "source": "Security Scanner" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Threat created successfully",
  "data": {
    "threat": {
      "id": "uuid",
      "type": "Malware",
      "location": "Corporate Office",
      "country": "United States",
      "city": "New York",
      "severity": "High",
      "time_detected": "2024-01-01T12:00:00Z",
      "description": "Detailed description of the threat",
      "status": "Active",
      "created_by": "uuid",
      "created_at": "2024-01-01T12:00:00Z",
      "creator": {
        "id": "uuid",
        "name": "John Analyst",
        "email": "analyst@example.com"
      }
    }
  }
}
```

### Get Single Threat
```http
GET /api/threats/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "threat": {
      "id": "uuid",
      "type": "Malware",
      "location": "Corporate Office",
      "country": "United States",
      "severity": "High",
      "time_detected": "2024-01-01T12:00:00Z",
      "description": "Detailed description of the threat",
      "status": "Active",
      "created_by": "uuid",
      "creator": {
        "id": "uuid",
        "name": "John Analyst",
        "email": "analyst@example.com"
      }
    }
  }
}
```

### Update Threat
```http
PUT /api/threats/:id
```

**Permission:** Owner, or Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "Resolved",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Threat updated successfully",
  "data": {
    "threat": {
      // Updated threat object
    }
  }
}
```

### Delete Threat
```http
DELETE /api/threats/:id
```

**Permission:** Owner, or Admin

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Threat deleted successfully"
}
```

### Get Threat Statistics
```http
GET /api/threats/stats
```

**Query Parameters:**
- `timeRange` (string) - Time range for stats (7d, 30d, 90d)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalThreats": 150,
      "activeThreats": 25,
      "timeRange": "30d"
    },
    "threatsByType": [
      {
        "type": "Malware",
        "count": 45
      },
      {
        "type": "Phishing",
        "count": 32
      }
    ],
    "threatsBySeverity": [
      {
        "severity": "High",
        "count": 20
      },
      {
        "severity": "Medium",
        "count": 80
      },
      {
        "severity": "Low",
        "count": 50
      }
    ],
    "threatsByCountry": [
      {
        "country": "United States",
        "count": 65
      },
      {
        "country": "Canada",
        "count": 25
      }
    ],
    "threatsOverTime": [
      {
        "date": "2024-01-01",
        "count": 5
      },
      {
        "date": "2024-01-02",
        "count": 8
      }
    ]
  }
}
```

---

## 🏥 Health Check

### Health Status
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Cyber Threat Tracker API is running",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🔄 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000');

// Join threats room for real-time updates
socket.emit('join-threats-room');
```

### Events

#### New Threat Created
```javascript
socket.on('new-threat', (threat) => {
  // Handle new threat
  console.log('New threat:', threat);
});
```

#### Threat Updated
```javascript
socket.on('threat-updated', (threat) => {
  // Handle threat update
  console.log('Threat updated:', threat);
});
```

#### Threat Deleted
```javascript
socket.on('threat-deleted', (threatId) => {
  // Handle threat deletion
  console.log('Threat deleted:', threatId);
});
```

---

## 📋 Validation Rules

### User Registration
- `name`: 2-100 characters, required
- `email`: Valid email format, unique, required
- `password`: Minimum 6 characters, must contain lowercase, uppercase, and number
- `role`: One of 'admin', 'analyst', 'viewer'

### Threat Creation
- `type`: One of predefined threat types
- `location`: 1-255 characters, required
- `country`: 1-100 characters, required
- `city`: 0-100 characters, optional
- `latitude`: -90 to 90, optional
- `longitude`: -180 to 180, optional
- `severity`: One of 'Low', 'Medium', 'High'
- `time_detected`: Valid ISO date string
- `description`: 10-1000 characters, required
- `status`: One of 'Active', 'Investigating', 'Resolved', 'False Positive'
- `source`: 0-100 characters, optional

---

## 🚦 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **WebSocket connections**: 10 connections per IP

---

## 📊 Pagination

All list endpoints support pagination:
- Default page size: 20 items
- Maximum page size: 100 items
- Page numbers start at 1

Response includes pagination metadata:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```
