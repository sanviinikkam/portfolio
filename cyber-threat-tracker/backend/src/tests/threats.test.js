const request = require('supertest');
const { app } = require('../server');
const { User, Threat } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Threats Endpoints', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Clean up test data
    await Threat.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    // Create test user
    testUser = await User.create({
      name: 'Test Analyst',
      email: 'analyst@example.com',
      password_hash: 'Test123!',
      role: 'analyst'
    });

    // Generate auth token
    authToken = generateToken({ userId: testUser.id, role: testUser.role });
  });

  describe('POST /api/threats', () => {
    it('should create a new threat successfully', async () => {
      const threatData = {
        type: 'Malware',
        location: 'Corporate Office',
        country: 'United States',
        city: 'New York',
        severity: 'High',
        time_detected: new Date().toISOString(),
        description: 'Suspicious malware activity detected on network endpoints.',
        status: 'Active'
      };

      const response = await request(app)
        .post('/api/threats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(threatData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.threat.type).toBe(threatData.type);
      expect(response.body.data.threat.severity).toBe(threatData.severity);
    });

    it('should not create threat without authentication', async () => {
      const threatData = {
        type: 'Malware',
        location: 'Corporate Office',
        country: 'United States',
        severity: 'High',
        time_detected: new Date().toISOString(),
        description: 'Test threat description.'
      };

      const response = await request(app)
        .post('/api/threats')
        .send(threatData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create threat with invalid data', async () => {
      const threatData = {
        type: 'InvalidType',
        location: '',
        country: 'United States',
        severity: 'High',
        description: 'Too short'
      };

      const response = await request(app)
        .post('/api/threats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(threatData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/threats', () => {
    beforeEach(async () => {
      // Create test threats
      await Threat.bulkCreate([
        {
          type: 'Malware',
          location: 'Office A',
          country: 'United States',
          severity: 'High',
          time_detected: new Date(),
          description: 'Test malware threat',
          created_by: testUser.id
        },
        {
          type: 'Phishing',
          location: 'Office B',
          country: 'Canada',
          severity: 'Medium',
          time_detected: new Date(),
          description: 'Test phishing threat',
          created_by: testUser.id
        }
      ]);
    });

    it('should get all threats with authentication', async () => {
      const response = await request(app)
        .get('/api/threats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.threats).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should not get threats without authentication', async () => {
      const response = await request(app)
        .get('/api/threats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should filter threats by type', async () => {
      const response = await request(app)
        .get('/api/threats?type=Malware')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.threats).toHaveLength(1);
      expect(response.body.data.threats[0].type).toBe('Malware');
    });

    it('should filter threats by severity', async () => {
      const response = await request(app)
        .get('/api/threats?severity=High')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.threats).toHaveLength(1);
      expect(response.body.data.threats[0].severity).toBe('High');
    });
  });

  describe('GET /api/threats/stats', () => {
    beforeEach(async () => {
      // Create test threats for stats
      await Threat.bulkCreate([
        {
          type: 'Malware',
          location: 'Office A',
          country: 'United States',
          severity: 'High',
          time_detected: new Date(),
          description: 'Test malware threat',
          created_by: testUser.id
        },
        {
          type: 'Malware',
          location: 'Office B',
          country: 'United States',
          severity: 'Medium',
          time_detected: new Date(),
          description: 'Another malware threat',
          created_by: testUser.id
        },
        {
          type: 'Phishing',
          location: 'Office C',
          country: 'Canada',
          severity: 'Low',
          time_detected: new Date(),
          description: 'Test phishing threat',
          created_by: testUser.id
        }
      ]);
    });

    it('should get threat statistics', async () => {
      const response = await request(app)
        .get('/api/threats/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.threatsByType).toBeDefined();
      expect(response.body.data.threatsBySeverity).toBeDefined();
      expect(response.body.data.summary.totalThreats).toBe(3);
    });
  });
});
