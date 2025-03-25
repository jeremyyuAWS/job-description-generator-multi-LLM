# Contributing to HireWrite

Thank you for considering contributing to HireWrite! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Any additional context

### Suggesting Enhancements

We welcome enhancement suggestions! Please create an issue with:

- A clear, descriptive title
- A detailed description of the enhancement
- An explanation of why this enhancement would be useful
- Any examples of similar features in other applications

### Pull Requests

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your PR:
- Has a clear purpose and description
- Follows the existing code style
- Includes appropriate tests
- Updates documentation as needed

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hirewrite.git
cd hirewrite
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase configuration:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

- `/src` - React application source code
- `/src/components` - React components
- `/src/services` - Services for API calls, analytics, etc.
- `/supabase/functions` - Supabase Edge Functions for AI services

## Coding Standards

- Use TypeScript for type safety
- Follow ESLint rules configured in the project
- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Document complex logic with comments

## Testing

- Write tests for new features
- Ensure all existing tests pass before submitting a PR
- Run tests with `npm run test`

## Deployment

Deployment is handled through GitHub Actions. When you submit a PR, tests will run automatically.

## Questions?

If you have any questions, feel free to create an issue or contact the maintainers directly.

Thank you for contributing to HireWrite!