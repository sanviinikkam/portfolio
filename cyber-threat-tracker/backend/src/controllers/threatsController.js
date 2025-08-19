const { Threat, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createThreat = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const threatData = {
      ...req.body,
      created_by: req.user.id,
    };

    const threat = await Threat.create(threatData);

    // Fetch the created threat with creator info
    const threatWithCreator = await Threat.findByPk(threat.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Threat created successfully',
      data: { threat: threatWithCreator },
    });
  } catch (error) {
    console.error('Create threat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getThreats = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      severity,
      country,
      status,
      search,
      startDate,
      endDate,
      sortBy = 'time_detected',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (type) whereClause.type = type;
    if (severity) whereClause.severity = severity;
    if (country) whereClause.country = country;
    if (status) whereClause.status = status;

    if (search) {
      whereClause[Op.or] = [
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (startDate || endDate) {
      whereClause.time_detected = {};
      if (startDate) whereClause.time_detected[Op.gte] = new Date(startDate);
      if (endDate) whereClause.time_detected[Op.lte] = new Date(endDate);
    }

    const { count, rows: threats } = await Threat.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        threats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get threats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getThreatById = async (req, res) => {
  try {
    const { id } = req.params;

    const threat = await Threat.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      }],
    });

    if (!threat) {
      return res.status(404).json({
        success: false,
        message: 'Threat not found',
      });
    }

    res.json({
      success: true,
      data: { threat },
    });
  } catch (error) {
    console.error('Get threat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateThreat = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const threat = await Threat.findByPk(id);
    if (!threat) {
      return res.status(404).json({
        success: false,
        message: 'Threat not found',
      });
    }

    // Check permissions
    if (req.user.role === 'viewer' || 
        (req.user.role === 'analyst' && threat.created_by !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    await threat.update(req.body);

    const updatedThreat = await Threat.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      }],
    });

    res.json({
      success: true,
      message: 'Threat updated successfully',
      data: { threat: updatedThreat },
    });
  } catch (error) {
    console.error('Update threat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteThreat = async (req, res) => {
  try {
    const { id } = req.params;

    const threat = await Threat.findByPk(id);
    if (!threat) {
      return res.status(404).json({
        success: false,
        message: 'Threat not found',
      });
    }

    // Check permissions
    if (req.user.role === 'viewer' || 
        (req.user.role === 'analyst' && threat.created_by !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    await threat.destroy();

    res.json({
      success: true,
      message: 'Threat deleted successfully',
    });
  } catch (error) {
    console.error('Delete threat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getThreatStats = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause = {
      time_detected: {
        [Op.gte]: startDate,
      },
    };

    // Get threat counts by type
    const threatsByType = await Threat.findAll({
      attributes: [
        'type',
        [Threat.sequelize.fn('COUNT', Threat.sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['type'],
      order: [[Threat.sequelize.literal('count'), 'DESC']],
    });

    // Get threat counts by severity
    const threatsBySeverity = await Threat.findAll({
      attributes: [
        'severity',
        [Threat.sequelize.fn('COUNT', Threat.sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['severity'],
    });

    // Get threat counts by country (top 10)
    const threatsByCountry = await Threat.findAll({
      attributes: [
        'country',
        [Threat.sequelize.fn('COUNT', Threat.sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['country'],
      order: [[Threat.sequelize.literal('count'), 'DESC']],
      limit: 10,
    });

    // Get threats over time (daily)
    const threatsOverTime = await Threat.findAll({
      attributes: [
        [Threat.sequelize.fn('DATE', Threat.sequelize.col('time_detected')), 'date'],
        [Threat.sequelize.fn('COUNT', Threat.sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: [Threat.sequelize.fn('DATE', Threat.sequelize.col('time_detected'))],
      order: [[Threat.sequelize.fn('DATE', Threat.sequelize.col('time_detected')), 'ASC']],
    });

    // Get total counts
    const totalThreats = await Threat.count({ where: whereClause });
    const activeThreats = await Threat.count({
      where: { ...whereClause, status: 'Active' },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalThreats,
          activeThreats,
          timeRange,
        },
        threatsByType,
        threatsBySeverity,
        threatsByCountry,
        threatsOverTime,
      },
    });
  } catch (error) {
    console.error('Get threat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createThreat,
  getThreats,
  getThreatById,
  updateThreat,
  deleteThreat,
  getThreatStats,
};
