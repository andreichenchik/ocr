# Contributing to OCR Tool

Thank you for your interest in contributing to the OCR Tool project! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment by following the instructions in the README

## Development Workflow

### Branch Naming Convention

All development work should be done in feature branches. Use the following naming convention:

- `feature/` prefix for all feature branches
- Use kebab-case for branch names
- Be descriptive but concise

Examples:
- `feature/add-pdf-encryption-support`
- `feature/improve-error-handling`
- `feature/update-documentation`

### Pull Request Process

1. **Create a feature branch**: Always create a new branch from `main` for your work
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**: Implement your feature or fix
   - Write clean, maintainable code
   - Follow the existing code style and patterns
   - Add or update tests as needed
   - Update documentation if necessary

3. **Test your changes**: Ensure all tests pass
   ```bash
   npm test
   ```

4. **Commit your changes**: Use clear, descriptive commit messages
   ```bash
   git add .
   git commit -m "feat: add support for encrypted PDFs"
   ```

5. **Push to your fork**: Push your feature branch
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**: 
   - Open a PR from your feature branch to the main repository's `main` branch
   - Provide a clear description of your changes
   - Reference any related issues
   - Ensure all CI checks pass

### Code Review

All contributions must go through code review via pull requests:

- PRs will be reviewed by maintainers
- Address any feedback or requested changes
- Once approved, your PR will be merged

## Code Standards

- Follow TypeScript best practices
- Maintain consistent code style with the existing codebase
- Write meaningful variable and function names
- Add appropriate comments for complex logic
- Ensure your code passes linting and type checking

## Testing

- Write tests for new features
- Update existing tests when modifying functionality
- Aim for high test coverage
- Run the test suite before submitting PRs

## Documentation

- Update the README if you're adding new features or changing usage
- Document any new configuration options
- Keep code comments up to date

## Questions?

If you have questions about contributing, feel free to open an issue for discussion.

Thank you for contributing to the OCR Tool project!