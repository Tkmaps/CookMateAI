# CookMate AI - React Native Recipe App

CookMate AI is a feature-rich recipe management application built with React Native, Expo, and GluestackUI. The app helps users discover recipes, manage grocery lists, scan receipts, and track their cooking preferences.

## Features

- **Beautiful UI with GluestackUI**: Modern, responsive UI components enhanced with LinearGradient effects
- **Recipe Discovery**: Browse recipes by category, search, and explore trending options
- **Grocery List Management**: Maintain grocery lists with easy addition and removal of items
- **Receipt Scanning**: Scan grocery receipts to automatically add items to your grocery list
- **User Profiles**: Set dietary preferences, allergies, and favorite cuisines
- **Dark Mode Support**: Toggle between light and dark modes for comfortable viewing

## Technology Stack

- React Native
- Expo
- GluestackUI (UI component library)
- Linear Gradient effects
- Tailwind CSS (via NativeWind)
- React Navigation

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- Yarn or npm
- Expo CLI
- Android Studio or Xcode (for emulation)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/react-native-recipes-app.git
cd react-native-recipes-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Run on a simulator or device:

```bash
npm run android
# or
npm run ios
```

## Project Structure

```
react-native-recipes-app/
├── assets/                 # Images, fonts, and other static files
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # GluestackUI enhanced components
│   │   └── ...
│   ├── data/               # Mock data for recipes and categories
│   ├── navigations/        # React Navigation setup
│   └── screens/            # App screens
│       ├── Home/           # Home screen
│       ├── Profile/        # User profile screen
│       ├── GroceryList/    # Grocery list management
│       └── ...
├── App.js                  # Main entry point
└── tailwind.config.js      # Tailwind CSS configuration
```

## Planned Enhancements

- Recipe recommendations based on user preferences
- Voice commands for hands-free cooking
- Social sharing capabilities
- Nutrition tracking
- Meal planning calendar

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## CookMate AI Coach - Backend API

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
cd ../backend
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
| `PLAYHT_USER_ID` | PlayHT User ID | (optional) |

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
