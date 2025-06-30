# Nelson-GPT Medical AI Assistant

A production-ready Progressive Web App (PWA) for pediatric healthcare, powered by AI and based on Nelson Textbook of Pediatrics. This application provides medical professionals and healthcare providers with an intelligent assistant for pediatric consultations, medical calculations, and evidence-based guidance.

## 🚀 Live Demo

**Production URL:** [https://akzuuncs.manus.space](https://akzuuncs.manus.space)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [PWA Features](#pwa-features)
- [Medical Tools](#medical-tools)
- [Security & Compliance](#security--compliance)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **AI-Powered Chat Interface**: ChatGPT-style conversational interface with streaming responses
- **RAG Pipeline**: Retrieval-Augmented Generation using Nelson Textbook of Pediatrics knowledge base
- **Medical Specializations**: Specialized GPT assistants for different pediatric subspecialties
- **Real-time Responses**: Streaming markdown responses with typing animations
- **Message Reactions**: Interactive message feedback system

### Medical Tools
- **Growth Charts**: CDC-based pediatric growth percentile calculations
- **Drug Calculator**: Safe medication dosing for pediatric patients
- **BMI Calculator**: Age-appropriate BMI calculations and interpretations
- **Immunization Schedule**: CDC recommended vaccination schedules

### Progressive Web App
- **Standalone Mode**: Provides a native app-like experience, launching without a browser address bar or tabs.
- **Installable**: Users can easily install the app to their home screen on mobile devices or desktop, behaving like a native application.
- **Offline Support**: Service worker-based offline functionality ensures the app is accessible even without an internet connection.
- **Responsive Design**: Optimized for all device sizes, providing a consistent experience across platforms.
- **Push Notifications**: Real-time updates and alerts (future enhancement)
### User Experience
- **Medical Dark Theme**: Professional healthcare-focused design
- **Sidebar Navigation**: Intuitive navigation with Library, Explore, Tools, and Settings
- **Authentication**: Secure user accounts with Supabase Auth
- **Data Persistence**: Conversation history and user preferences

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Zustand** - Lightweight state management
- **React Hot Toast** - Elegant notifications

### Backend
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Relational database with pgvector extension
- **Edge Functions** - Serverless API endpoints
- **Supabase Auth** - Authentication and user management
- **Row Level Security** - Database-level security policies

### AI & ML
- **Mistral AI** - Large language model for chat responses
- **Vector Embeddings** - Semantic search capabilities
- **RAG Pipeline** - Knowledge retrieval and augmentation

### PWA & Performance
- **Vite PWA Plugin** - Progressive Web App configuration
- **Workbox** - Service worker and caching strategies
- **Web App Manifest** - Native app-like installation

## 🏗 Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │    │   Supabase      │    │   Mistral AI    │
│                 │    │                 │    │                 │
│ • UI Components │◄──►│ • PostgreSQL    │◄──►│ • Chat API      │
│ • State Mgmt    │    │ • Auth          │    │ • Embeddings    │
│ • Service Worker│    │ • Edge Functions│    │ • RAG Pipeline  │
│ • Offline Cache │    │ • Vector Search │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema
- **users**: User profiles and preferences
- **chats**: Conversation sessions
- **messages**: Individual chat messages
- **knowledge_base**: Medical knowledge with vector embeddings
- **user_sessions**: Authentication sessions

### API Endpoints
- `/functions/v1/chat-completion` - AI chat responses
- `/functions/v1/generate-embeddings` - Vector embedding generation
- `/functions/v1/medical-tools` - Medical calculation tools

## 📦 Installation

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- Mistral AI API key

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd nelson-gpt
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Configuration**
Create a `.env` file with the following variables:
```env
VITE_MISTRAL_API_KEY=your_mistral_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Database Setup**
Run the SQL schema in your Supabase project:
```bash
# Execute the schema file in Supabase SQL Editor
cat supabase/schema.sql
```

5. **Deploy Edge Functions**
```bash
# Install Supabase CLI and deploy functions
supabase functions deploy chat-completion
supabase functions deploy generate-embeddings
supabase functions deploy medical-tools
```

6. **Populate Knowledge Base**
```bash
pnpm run populate-kb
```

7. **Start Development Server**
```bash
pnpm run dev
```

## ⚙️ Configuration

### Supabase Configuration
1. Create a new Supabase project
2. Enable the pgvector extension
3. Run the provided SQL schema
4. Configure authentication providers
5. Set up Row Level Security policies

### Mistral AI Setup
1. Sign up for Mistral AI account
2. Generate API key
3. Configure rate limits and usage monitoring

### PWA Configuration
The PWA is pre-configured with:
- Service worker for offline functionality
- Web app manifest for installation
- Caching strategies for optimal performance

## 🎯 Usage

### For Healthcare Professionals

1. **Sign Up/Sign In**
   - Create an account or sign in with existing credentials
   - All data is encrypted and HIPAA-compliant

2. **Start a Consultation**
   - Click "New Chat" to begin a medical consultation
   - Ask questions about pediatric conditions, treatments, or guidelines
   - Receive evidence-based responses from Nelson Textbook knowledge

3. **Use Medical Tools**
   - Access Growth Charts for percentile calculations
   - Use Drug Calculator for safe pediatric dosing
   - Calculate BMI with age-appropriate interpretations
   - Reference immunization schedules

4. **Explore Specializations**
   - Browse specialized medical assistants
   - Start consultations with subspecialty experts
   - Access targeted knowledge for specific conditions

### For Patients/Families
- Educational information about pediatric health
- General guidance (not a substitute for professional medical advice)
- Growth tracking and developmental milestones

## 📚 API Documentation

### Chat Completion API
```typescript
POST /functions/v1/chat-completion
Content-Type: application/json
Authorization: Bearer <supabase_token>

{
  "message": "What are the signs of dehydration in infants?",
  "chatId": "uuid",
  "useRAG": true
}
```

### Medical Tools API
```typescript
POST /functions/v1/medical-tools
Content-Type: application/json
Authorization: Bearer <supabase_token>

{
  "tool": "growth-chart",
  "age": 24,
  "weight": 12.5,
  "height": 85.0,
  "gender": "male"
}
```

## 📱 PWA Features

### Installation
- **Desktop**: Install button in browser address bar
- **Mobile**: "Add to Home Screen" prompt
- **Programmatic**: `window.showInstallPrompt()` function

### Offline Functionality
- **Static Assets**: Cached for offline access
- **API Responses**: Cached with network-first strategy
- **Graceful Degradation**: Offline indicators and fallbacks

### Performance
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Intelligent caching strategies

## 🏥 Medical Tools

### Growth Charts
- CDC growth percentiles for weight, height, and head circumference
- Age-appropriate calculations (0-20 years)
- Gender-specific reference curves
- BMI percentiles and interpretations

### Drug Calculator
- Weight-based dosing calculations
- Age-appropriate medication guidelines
- Safety warnings and contraindications
- Common pediatric medications database

### BMI Calculator
- Age and gender-specific BMI calculations
- Percentile interpretations
- Nutritional recommendations
- Growth pattern analysis

### Immunization Schedule
- CDC recommended vaccination schedules
- Age-based immunization tracking
- Catch-up schedules for delayed vaccinations
- Contraindications and special circumstances

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: All data encrypted in transit and at rest
- **Authentication**: Secure user authentication with Supabase Auth
- **Authorization**: Row-level security policies
- **Privacy**: No personal health information stored without consent

### HIPAA Compliance
- **Data Handling**: Follows HIPAA guidelines for medical data
- **Access Controls**: Role-based access to sensitive information
- **Audit Trails**: Comprehensive logging of data access
- **Business Associate Agreements**: Compliant third-party services

### Security Features
- **HTTPS**: All communications over secure connections
- **CORS**: Properly configured cross-origin resource sharing
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse

## 🔧 Development

### Project Structure
```
nelson-gpt/
├── src/
│   ├── components/          # React components
│   ├── lib/                # Utilities and configurations
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── supabase/
│   ├── functions/          # Edge Functions
│   ├── migrations/         # Database migrations
│   └── schema.sql          # Database schema
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.json       # Web app manifest
│   └── sw.js              # Service worker
└── scripts/
    └── populate-knowledge-base.js
```

### Development Commands
```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Populate knowledge base
pnpm run populate-kb

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with medical-specific rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

## 🚀 Deployment

### Production Deployment
The application is deployed using Manus deployment service:

```bash
# Build the application
pnpm run build

# Deploy to production
# (Automatically handled by Manus deployment)
```

### Environment Variables
Ensure all environment variables are properly configured in production:
- `VITE_MISTRAL_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`

### Performance Optimization
- **Bundle Analysis**: Monitor bundle sizes
- **Lazy Loading**: Implement route-based code splitting
- **Caching**: Optimize caching strategies
- **CDN**: Use content delivery network for static assets

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain medical accuracy in all content
3. Ensure HIPAA compliance in data handling
4. Write comprehensive tests for medical calculations
5. Document all medical references and sources

### Code Review Process
1. Medical accuracy review by healthcare professionals
2. Technical review for code quality and security
3. Accessibility testing for healthcare environments
4. Performance testing under various conditions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

**IMPORTANT**: This application is designed as a medical reference tool and educational resource. It is not intended to replace professional medical judgment, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions. The developers and contributors are not responsible for any medical decisions made based on information provided by this application.

## 📞 Support

For technical support or medical content questions:
- **Technical Issues**: Create an issue in the repository
- **Medical Content**: Contact medical advisory board
- **Security Concerns**: Report to security@example.com

## 🙏 Acknowledgments

- **Nelson Textbook of Pediatrics**: Primary medical knowledge source
- **CDC**: Growth charts and immunization schedules
- **Mistral AI**: Large language model capabilities
- **Supabase**: Backend infrastructure and services
- **Medical Advisory Board**: Clinical guidance and review

---

**Built with ❤️ for pediatric healthcare professionals worldwide**

