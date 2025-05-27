# CookMate AI Coach - Backend API

This is the backend API server for the CookMate AI Assistant Coach, providing voice-driven cooking guidance with adaptive AI coaching.

## 🚀 Features

- **RESTful API** with Express.js
- **Real-time Communication** via Socket.IO
- **AI-Powered Coaching** using Google Gemini or Groq
- **Voice Processing** with Speech-to-Text and Text-to-Speech
- **Session Management** with Redis
- **PostgreSQL Database** with Sequelize ORM
- **JWT Authentication** with refresh tokens
- **Rate Limiting** and security middleware
- **Comprehensive Logging** with Winston
- **Input Validation** with express-validator

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Google Cloud credentials (for Speech services)
- AI API keys (Gemini or Groq)

## 🛠️ Installation

1. **Clone and navigate to backend directory**
```bash
cd cookmate-ai-coach/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
# Create PostgreSQL database
createdb cookmate_ai

# The application will automatically sync models in development
```

5. **Start Redis server**
```bash
redis-server
```

6. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_NAME` | Database name | cookmate_ai |
| `REDIS_HOST` | Redis host | localhost |
| `JWT_SECRET` | JWT signing secret | (required) |
| `GEMINI_API_KEY` | Google Gemini API key | (optional) |
| `GROQ_API_KEY` | Groq API key | (optional) |
| `PLAYHT_API_KEY` | PlayHT TTS API key | (optional) |

### AI Service Setup

#### Google Gemini
1. Get API key from [Google AI Studio](https://makersuite.google.com/)
2. Set `GEMINI_API_KEY` in your `.env` file

#### Groq (Alternative)
1. Get API key from [Groq Console](https://console.groq.com/)
2. Set `GROQ_API_KEY` in your `.env` file

#### Google Cloud Speech (Optional)
1. Create a Google Cloud project
2. Enable Speech-to-Text API
3. Download service account credentials
4. Set `GOOGLE_CREDENTIALS_PATH` to the JSON file path

#### PlayHT Text-to-Speech (Optional)
1. Sign up at [PlayHT](https://play.ht/)
2. Get API key and User ID
3. Set `PLAYHT_API_KEY` and `PLAYHT_USER_ID`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Session Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/start` | Start cooking session |
| GET | `/api/sessions/:id` | Get session details |
| PUT | `/api/sessions/:id/update` | Update session |
| DELETE | `/api/sessions/:id/end` | End session |
| GET | `/api/sessions/user/active` | Get active sessions |
| GET | `/api/sessions/user/history` | Get session history |

### Voice Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice/transcribe` | Transcribe audio to text |
| POST | `/api/voice/process` | Process voice command |
| POST | `/api/voice/synthesize` | Convert text to speech |
| GET | `/api/voice/voices` | Get available voices |
| GET | `/api/voice/health` | Voice services health |

### AI Coaching

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/coach/ask` | Ask coaching question |
| POST | `/api/coach/step-guidance` | Get step guidance |
| GET | `/api/coach/tips/:sessionId` | Get contextual tips |
| POST | `/api/coach/troubleshoot` | Get troubleshooting help |
| POST | `/api/coach/substitute` | Get ingredient substitutions |
| POST | `/api/coach/feedback` | Provide feedback |
| GET | `/api/coach/analytics/:sessionId` | Get coaching analytics |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/preferences` | Update preferences |
| GET | `/api/users/progress` | Get cooking progress |
| GET | `/api/users/progress/:recipeId` | Get recipe progress |
| GET | `/api/users/stats` | Get cooking statistics |
| GET | `/api/users/achievements` | Get achievements |
| GET | `/api/users/export` | Export user data |
| DELETE | `/api/users/account` | Delete account |

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Login** to receive access and refresh tokens
2. **Include token** in Authorization header: `Bearer <token>`
3. **Refresh token** when access token expires
4. **Logout** to invalidate tokens

Example:
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Use token
const apiResponse = await fetch('/api/sessions/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(sessionData)
});
```

## 🎯 Real-time Events

The server uses Socket.IO for real-time communication:

### Client Events
```javascript
// Join a cooking session
socket.emit('join_session', sessionId);

// Leave a session
socket.emit('leave_session', sessionId);
```

### Server Events
```javascript
// Session started
socket.on('session_started', (data) => {
  console.log('Session started:', data);
});

// Session updated
socket.on('session_updated', (data) => {
  console.log('Session updated:', data);
});

// Coach response
socket.on('coach_response', (data) => {
  console.log('Coach response:', data);
});

// Step guidance
socket.on('step_guidance', (data) => {
  console.log('Step guidance:', data);
});
```

## 📊 Database Schema

### Users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `name` (String)
- `password` (String, Hashed)
- `skill_level` (Enum: beginner, intermediate, expert)
- `preferences` (JSONB)
- `is_active` (Boolean)
- `last_login_at` (Timestamp)

### Cooking Sessions
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `recipe_id` (UUID)
- `recipe_name` (String)
- `current_step` (Integer)
- `total_steps` (Integer)
- `status` (Enum: active, paused, completed, abandoned)
- `started_at` (Timestamp)
- `completed_at` (Timestamp)
- `duration` (Integer, seconds)
- `feedback` (JSONB)
- `context` (JSONB)

### Coaching Interactions
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key)
- `user_input` (Text)
- `coach_response` (Text)
- `interaction_type` (Enum)
- `context` (JSONB)
- `response_time` (Integer, milliseconds)
- `user_satisfaction` (Integer, 1-5)

### User Progress
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `recipe_id` (UUID)
- `completion_count` (Integer)
- `average_time` (Integer)
- `mastery_level` (Integer, 0-100)
- `last_cooked` (Timestamp)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Format code
npm run format
```

## 📝 Logging

The application uses Winston for structured logging:

- **Console output** in development
- **File logging** in production
- **Error tracking** with stack traces
- **Request/response logging** with unique IDs
- **Performance monitoring** with response times

Log files:
- `error.log` - Error level logs only
- `combined.log` - All log levels

## 🚀 Deployment

### Docker Deployment

1. **Build the image**
```bash
docker build -t cookmate-ai-backend .
```

2. **Run with docker-compose**
```bash
docker-compose up -d
```

### Manual Deployment

1. **Set production environment**
```bash
export NODE_ENV=production
```

2. **Install production dependencies**
```bash
npm ci --only=production
```

3. **Start the server**
```bash
npm start
```

## 🔧 Development

### Project Structure
```
src/
├── api/           # Route handlers
├── config/        # Configuration files
├── middleware/    # Express middleware
├── models/        # Database models
├── services/      # Business logic services
└── utils/         # Utility functions
```

### Adding New Features

1. **Create model** (if needed) in `src/models/`
2. **Add service logic** in `src/services/`
3. **Create API routes** in `src/api/`
4. **Add middleware** (if needed) in `src/middleware/`
5. **Update documentation**

### Code Style

- Use ESLint for code linting
- Use Prettier for code formatting
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper error handling

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

2. **Redis connection failed**
   - Check Redis server is running
   - Verify Redis configuration

3. **AI API errors**
   - Check API keys are valid
   - Verify network connectivity
   - Check rate limits

4. **Voice processing errors**
   - Verify Google Cloud credentials
   - Check audio file format
   - Ensure proper permissions

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.