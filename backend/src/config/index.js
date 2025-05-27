const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cookmate_ai',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};

const aiConfig = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'mixtral-8x7b-32768'
  },
  speechToText: {
    provider: process.env.STT_PROVIDER || 'google', // 'google' or 'vosk'
    googleCredentials: process.env.GOOGLE_CREDENTIALS_PATH
  },
  textToSpeech: {
    provider: process.env.TTS_PROVIDER || 'playht', // 'playht' or 'mozilla'
    playhtApiKey: process.env.PLAYHT_API_KEY,
    playhtUserId: process.env.PLAYHT_USER_ID
  }
};

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

module.exports = {
  dbConfig,
  redisConfig,
  aiConfig,
  jwtConfig
};