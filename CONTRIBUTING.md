# Contributing to PromptBlocks

Thank you for your interest in contributing to PromptBlocks! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all your interactions with the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/promptblocks.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add appropriate comments and documentation
- Keep functions small and focused
- Use early returns for better readability

### Commit Messages

- Use clear, descriptive commit messages
- Follow the conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for code style changes
  - `refactor:` for code refactoring
  - `test:` for test-related changes
  - `chore:` for maintenance tasks

### Pull Requests

1. Ensure your PR description clearly describes the problem and solution
2. Include relevant issue numbers if applicable
3. Make sure all tests pass
4. Update documentation as needed
5. Keep PRs focused and small when possible


## Project Structure

```
promptblocks/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and shared code
├── public/          # Static assets
├── types/           # TypeScript type definitions
└── hooks/           # Custom React hooks
```

## Questions?

If you have any questions about contributing, please:
1. Check the existing documentation
2. Search existing issues
3. Open a new issue if needed

Thank you for contributing to PromptBlocks! 