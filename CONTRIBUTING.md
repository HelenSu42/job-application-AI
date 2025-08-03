# Contributing to Job Application Assistant

Thank you for your interest in contributing to the Job Application Assistant! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat all contributors with respect and create a welcoming environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Encore CLI
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-application-assistant.git
   cd job-application-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Encore CLI**
   ```bash
   curl -L https://encore.dev/install.sh | bash
   ```

4. **Set up environment**
   - Get an OpenRouter API key from [OpenRouter](https://openrouter.ai/)
   - Set the `OpenRouterKey` secret in the Leap UI Infrastructure tab

5. **Start development server**
   ```bash
   encore run
   ```

## Development Guidelines

### Backend Development (Encore.ts)

#### Service Organization
- Each service should have a clear, single responsibility
- Place related endpoints in the same service
- Use descriptive service names that reflect their purpose

#### API Design
- Use TypeScript interfaces for all request/response schemas
- Top-level schemas must be interfaces, not primitives or arrays
- Include proper JSDoc comments for all endpoints
- Use appropriate HTTP methods and status codes

#### Error Handling
- Use `APIError` for all API errors with appropriate error codes
- Provide meaningful error messages
- Handle edge cases gracefully

#### Database
- Use migrations for all schema changes
- Never edit existing migration files
- Use appropriate data types (prefer integers over floats when possible)
- Include proper indexes for performance

#### Example API Endpoint
```typescript
import { api, APIError } from "encore.dev/api";

interface CreateUserRequest {
  name: string;
  email: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Creates a new user account.
export const create = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    // Validation
    if (!req.email.includes('@')) {
      throw APIError.invalidArgument("Invalid email format");
    }
    
    // Implementation
    // ...
    
    return user;
  }
);
```

### Frontend Development (React + TypeScript)

#### Component Structure
- Keep components small and focused
- Use TypeScript for all components
- Extract reusable logic into custom hooks
- Follow React best practices

#### Styling
- Use Tailwind CSS for styling
- Use shadcn/ui components when available
- Ensure responsive design for all screen sizes
- Maintain consistent spacing and colors

#### State Management
- Use TanStack Query for server state
- Use React's built-in state for local component state
- Avoid prop drilling - use context when appropriate

#### Example Component
```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import backend from '~backend/client';

interface UserProfileProps {
  userId: number;
}

export default function UserProfile({ userId }: UserProfileProps) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => backend.user.get({ id: userId })
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
      </CardContent>
    </Card>
  );
}
```

## Testing

### Backend Tests
```bash
encore test ./backend/...
```

### Frontend Tests
```bash
npm run test:frontend
```

### Running All Tests
```bash
npm test
```

## Code Style

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful names for variables and functions
- Include return types for functions

### Formatting
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use trailing commas in multiline objects/arrays

### Linting
```bash
npm run lint
npm run lint:fix
```

## Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add session-based authentication
fix(resume): resolve PDF parsing issue
docs(readme): update installation instructions
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use the PR template
   - Provide a clear description
   - Link related issues
   - Request review from maintainers

## Issue Reporting

### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Include error messages/logs

### Feature Requests
- Use the feature request template
- Explain the problem you're solving
- Describe the proposed solution
- Consider alternative approaches

## Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Include examples for complex APIs
- Document any non-obvious behavior

### README Updates
- Update README for new features
- Include setup instructions
- Add usage examples

## Security

### Reporting Security Issues
- Do not open public issues for security vulnerabilities
- Email security concerns to the maintainers
- Include detailed information about the vulnerability

### Security Best Practices
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP guidelines

## Performance

### Backend Performance
- Use database indexes appropriately
- Implement pagination for large datasets
- Cache expensive operations when possible
- Monitor query performance

### Frontend Performance
- Optimize bundle size
- Use lazy loading for routes
- Implement proper loading states
- Optimize images and assets

## Release Process

1. **Version Bump**
   - Update version in package.json
   - Update CHANGELOG.md

2. **Testing**
   - Run full test suite
   - Test in staging environment

3. **Release**
   - Create release tag
   - Deploy to production
   - Update documentation

## Getting Help

- Check existing issues and documentation
- Ask questions in GitHub Discussions
- Join our community chat (if available)
- Contact maintainers for urgent issues

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Job Application Assistant!
