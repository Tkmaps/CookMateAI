const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cookmate-ai-coach' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.requestId = uuidv4();
  
  // Start time for response time calculation
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info('Outgoing response', {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: JSON.stringify(body).length,
      timestamp: new Date().toISOString()
    });

    return originalJson.call(this, body);
  };

  // Override res.send to log response
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info('Outgoing response', {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: body ? body.length : 0,
      timestamp: new Date().toISOString()
    });

    return originalSend.call(this, body);
  };

  next();
};

// Authentication logging middleware
const authLogger = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(body) {
    if (req.route && req.route.path) {
      logger.info('Authentication event', {
        requestId: req.requestId,
        endpoint: req.route.path,
        method: req.method,
        statusCode: res.statusCode,
        userId: req.user ? req.user.id : null,
        success: res.statusCode < 400,
        timestamp: new Date().toISOString()
      });
    }
    return originalJson.call(this, body);
  };
  next();
};

// Voice interaction logging
const voiceLogger = (interaction) => {
  logger.info('Voice interaction', {
    sessionId: interaction.sessionId,
    userId: interaction.userId,
    interactionType: interaction.type,
    duration: interaction.duration,
    success: interaction.success,
    timestamp: new Date().toISOString()
  });
};

// Coaching interaction logging
const coachingLogger = (interaction) => {
  logger.info('Coaching interaction', {
    sessionId: interaction.sessionId,
    userId: interaction.userId,
    interactionType: interaction.type,
    responseTime: interaction.responseTime,
    adaptationMade: interaction.adaptationMade,
    timestamp: new Date().toISOString()
  });
};

// Error logging
const errorLogger = (error, context = {}) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  requestLogger,
  authLogger,
  voiceLogger,
  coachingLogger,
  errorLogger
};