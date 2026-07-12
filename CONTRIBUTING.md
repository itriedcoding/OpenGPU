# Contributing to OpenGPU

Thank you for your interest in contributing to OpenGPU! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Issue Templates](#issue-templates)
- [Community](#community)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We expect all contributors to follow it.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment
4. Create a branch for your changes
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ (recommended: use nvm)
- npm 9+
- PostgreSQL 14+ (or SQLite for development)
- Redis (optional, for caching)
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/opengpu.git
cd opengpu

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Project Structure

```
opengpu/
├── packages/
│   ├── api/           # Backend API server
│   ├── cli/           # Command line interface
│   ├── web/           # Web frontend
│   └── agent/         # GPU provider agent
├── docker/            # Docker configurations
├── docs/              # Documentation
└── .github/           # GitHub workflows and templates
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test --workspace=@opengpu/api

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` when necessary
- Avoid `any` - use proper types
- Use async/await over callbacks and raw Promises

### Naming Conventions

- Files: `kebab-case.ts` (e.g., `user-service.ts`)
- Classes: `PascalCase` (e.g., `UserService`)
- Functions: `camelCase` (e.g., `getUserById`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- Interfaces: `PascalCase` with `I` prefix optional (e.g., `User` or `IUser`)

### Formatting

- Use Prettier with default settings
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multiline structures
- Semicolons required

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Adding or updating tests

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(api): add GPU rental endpoint
fix(cli): handle network timeout errors
docs(readme): update installation instructions
```

### Testing Requirements

- Write unit tests for new functions
- Write integration tests for new endpoints
- Maintain or improve code coverage
- Test edge cases and error scenarios

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass** (`npm test`)
4. **Run linter** (`npm run lint`)
5. **Update dependencies** if needed
6. **Fill out PR template** completely
7. **Request review** from maintainers

### PR Title

Follow the same convention as commit messages:

```
feat(api): add GPU rental endpoint
```

### PR Description

Include:
- What changes were made
- Why the changes were necessary
- How to test the changes
- Any breaking changes

### Review Process

- All PRs require at least one review
- Address review feedback promptly
- Maintainers may request changes before merging

## Issue Templates

### Bug Reports

Use the bug report template when:
- You found a bug
- The bug is reproducible
- You have steps to reproduce

### Feature Requests

Use the feature request template when:
- You want to suggest a new feature
- You want to improve an existing feature
- You have a use case that isn't covered

### Questions

For general questions:
- Check existing documentation
- Search existing issues
- Open a discussion in GitHub Discussions

## Community

- **GitHub Discussions**: Ask questions, share ideas
- **Discord**: Real-time chat with the community
- **Twitter**: Follow for updates

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Annual contributor highlights

---

Thank you for contributing to OpenGPU!
