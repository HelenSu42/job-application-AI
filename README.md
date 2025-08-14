# Job Application Assistant

An AI-powered job application platform that helps professionals optimize their job search through intelligent analysis, resume building, and personalized recommendations.

## Features

### 🎯 Job Analysis
- AI-powered analysis of job descriptions
- Skill gap identification and compatibility scoring
- Salary analysis and market comparisons
- Industry experience matching

### 📄 Resume Builder
- ATS-friendly resume generation
- Multiple professional templates (Modern, Classic, Minimal)
- AI-powered content optimization
- Keyword matching for job descriptions
- Section customization and reordering

### ✉️ Cover Letter Generator
- Personalized cover letters tailored to specific jobs
- Multiple writing tones (Formal, Conversational, Enthusiastic)
- Company-specific customization
- Keyword optimization and suggestions

### 👤 Profile Management
- Comprehensive professional profile creation
- AI-powered resume parsing and data extraction
- Skills assessment with proficiency levels
- Education, experience, and achievement tracking
- Multi-language support

### 📈 Improvement Planning
- Personalized skill improvement roadmaps
- Timeline-based learning plans
- Project suggestions for skill development
- Progress tracking and completion estimates

## Technology Stack

### Backend (Encore.ts)
- **Framework**: Encore.ts with TypeScript
- **Database**: PostgreSQL with built-in migrations
- **AI Integration**: OpenRouter API for resume parsing and content generation
- **Authentication**: Session-based authentication with secure password hashing
- **API Design**: RESTful APIs with type-safe request/response schemas

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: React Router v6
- **Build Tool**: Vite

### Key Libraries & Tools
- **PDF Processing**: PDF.js for client-side PDF text extraction
- **Word Document Processing**: Mammoth.js for .docx file parsing
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with validation
- **Notifications**: Custom toast system

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Encore CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-application-assistant.git
   cd job-application-assistant
   ```

2. **Install Encore CLI** (if not already installed)
   ```bash
   curl -L https://encore.dev/install.sh | bash
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   
   The application requires an OpenRouter API key for AI functionality:
   - Go to [OpenRouter](https://openrouter.ai/) and create an account
   - Generate an API key
   - In the Leap UI, go to the Infrastructure tab and set the `OpenRouterKey` secret

5. **Run the development server**
   ```bash
   encore run
   ```

   This will start both the backend and frontend development servers.

6. **Access the application**
   - Frontend: http://localhost:4000
   - Backend API: http://localhost:4000/api
   - Encore Dashboard: http://localhost:9400

## Project Structure

```
├── backend/                 # Encore.ts backend services
│   ├── ai/                 # AI service for OpenRouter integration
│   ├── analysis/           # Job analysis and improvement planning
│   ├── auth/               # Authentication service
│   ├── resume/             # Resume and cover letter generation
│   └── user/               # User profile management
├── frontend/               # React frontend application
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── pages/              # Page components
│   └── App.tsx            # Main application component
└── README.md
```

## API Services

### User Service (`/users`)
- User registration and profile management
- Resume parsing with AI extraction
- Skills, education, and experience tracking

### Authentication Service (`/auth`)
- Session-based login/logout
- Secure password handling
- Session verification

### Analysis Service (`/analysis`)
- Job description analysis
- Skill gap identification
- Improvement plan generation

### Resume Service (`/resume`)
- Resume generation with templates
- Cover letter creation
- ATS optimization

### AI Service (`/ai`)
- OpenRouter integration
- Resume parsing and data extraction
- Content generation and optimization

## Key Features in Detail

### AI-Powered Resume Parsing
- Supports PDF, Word documents, and text files
- Extracts personal information, education, skills, and experience
- Automatically categorizes skills and assigns proficiency levels
- Handles multiple document formats with fallback processing

### Intelligent Job Analysis
- Analyzes job descriptions for required skills and qualifications
- Provides compatibility scoring across multiple dimensions
- Identifies skill gaps with priority levels
- Offers salary analysis and market comparisons

### Customizable Resume Builder
- Multiple professional templates
- Drag-and-drop section reordering
- ATS optimization with keyword matching
- Real-time preview with A4 format
- Export to PDF and Word formats

### Personalized Improvement Plans
- Timeline-based learning roadmaps
- Project suggestions for skill development
- Availability-based planning (full-time, part-time, minimal)
- Progress tracking and completion estimates

## Security & Privacy

- **Password Security**: Passwords are hashed using crypto with salt
- **Session Management**: Secure session tokens with expiration
- **Data Privacy**: User data is never shared with third parties
- **File Processing**: Resume parsing happens securely without permanent storage
- **API Security**: All endpoints include proper validation and error handling

## Deployment

The application is built with Encore.ts, which provides built-in deployment capabilities:

1. **Production Build**
   ```bash
   encore build
   ```

2. **Deploy to Encore Cloud**
   ```bash
   encore deploy
   ```

3. **Environment Configuration**
   - Set production secrets in the Encore dashboard
   - Configure OpenRouter API key for production
   - Set up production database

## Testing

### Backend Unit Tests (Vitest)
- Use Vitest for unit-testing core logic without running the Encore runtime.
- Tests live alongside source files as `*.test.ts` under `backend/`.
- Run tests locally:

```bash
cd backend && bun install && bun run test
```

- CI/CD and staging reuse the same unit tests/commands. Runtime or integration tests (hitting real Encore APIs) can be added separately with `encore test` if desired.

#### Pepper handling in tests
- The code reads `PasswordPepper` via `encore.dev/config.secret` and falls back to an empty string when absent.
- Tests mock `encore.dev/config` to simulate both cases (pepper present vs absent).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

### Backend Development
- Follow Encore.ts conventions for service organization
- Use TypeScript interfaces for all API schemas
- Include proper error handling with APIError
- Write descriptive API documentation comments
- Use database migrations for schema changes

### Frontend Development
- Use TypeScript for all components
- Follow React best practices and hooks patterns
- Implement responsive design with Tailwind CSS
- Use shadcn/ui components for consistency
- Handle loading and error states properly

### Code Quality
- Maintain consistent code formatting
- Use meaningful variable and function names
- Keep components small and focused
- Extract reusable logic into custom hooks
- Write comprehensive error handling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- [Encore.ts](https://encore.dev/) for the excellent backend framework
- [OpenRouter](https://openrouter.ai/) for AI model access
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
