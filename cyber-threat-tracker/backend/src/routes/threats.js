const express = require('express');
const router = express.Router();
const {
  createThreat,
  getThreats,
  getThreatById,
  updateThreat,
  deleteThreat,
  getThreatStats,
} = require('../controllers/threatsController');
const { authenticateToken, requireAnalystOrAdmin } = require('../middleware/auth');
const {
  validateThreatCreation,
  validateThreatUpdate,
  validateUUID,
  validateQueryParams,
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// GET /api/threats - Get all threats with filtering and pagination
router.get('/', validateQueryParams, getThreats);

// GET /api/threats/stats - Get threat statistics
router.get('/stats', getThreatStats);

// GET /api/threats/:id - Get specific threat
router.get('/:id', validateUUID, getThreatById);

// POST /api/threats - Create new threat (analyst+ required)
router.post('/', requireAnalystOrAdmin, validateThreatCreation, createThreat);

// PUT /api/threats/:id - Update threat
router.put('/:id', validateUUID, validateThreatUpdate, updateThreat);

// DELETE /api/threats/:id - Delete threat
router.delete('/:id', validateUUID, deleteThreat);

module.exports = router;
