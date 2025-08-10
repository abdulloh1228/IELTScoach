# AI IELTS Instructor Platform

A comprehensive AI-powered IELTS preparation platform built with React, TypeScript, and Supabase.

## Features

### 🎯 Complete IELTS Practice
- **Writing Practice**: Task 1 & 2 with real-time AI feedback
- **Reading Practice**: Passages with instant scoring and explanations
- **Speaking Practice**: Audio recording with AI pronunciation analysis
- **Listening Practice**: Audio exercises with transcript review

### 🤖 AI-Powered Features
- Real-time essay analysis and band scoring
- Personalized study recommendations
- Enhanced essay generation (Band 8+ examples)
- Speaking fluency and pronunciation feedback
- Adaptive daily tips based on weak areas

### 📊 Progress Tracking
- Detailed performance analytics
- Section-wise score tracking
- Study streak monitoring
- Personalized improvement recommendations

### 👤 User Management
- Secure authentication with Supabase
- Customizable study goals and preferences
- Progress history and achievements
- Human tutor feedback requests

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: OpenAI GPT-4 for content analysis
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd ielts-platform
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Run the migration file to set up the database schema
3. Configure authentication settings
4. Update environment variables

### 4. Google Gemini Setup
1. Go to Google AI Studio (https://makersuite.google.com/app/apikey)
2. Generate an API key
3. Add the key to your environment variables

### 5. Run the Application
```bash
npm run dev
```

## Database Schema

The platform uses a comprehensive database schema including:
- User profiles and authentication
- Test sessions and results
- Writing submissions with AI feedback
- Speaking recordings and analysis
- Reading and listening responses
- Progress tracking and study plans
- Daily tips and recommendations

## AI Integration

### Writing Analysis
- Analyzes essays using Google Gemini AI
- Provides band scores for all four criteria
- Generates detailed feedback and suggestions
- Creates enhanced versions for learning

### Speaking Analysis
- Processes speech transcripts
- Uses Gemini AI to evaluate fluency, pronunciation, vocabulary, and grammar
- Provides targeted improvement suggestions

### Personalized Recommendations
- Generates study tips based on weak areas
- Adapts to user's current level and goals
- Updates recommendations based on progress

## Security Features

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Protected API routes and data access
- User data isolation and privacy

## Production Considerations

### Security
- Move Gemini API calls to backend/edge functions
- Implement rate limiting
- Add input validation and sanitization

### Performance
- Implement caching for AI responses
- Optimize database queries
- Add loading states and error handling

### Features to Add
- Real audio processing for speaking practice
- Payment integration for premium features
- Mobile app with offline capabilities
- Admin dashboard for content management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
