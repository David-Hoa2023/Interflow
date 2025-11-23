# Contributing to InferFlow

Thank you for your interest in contributing to InferFlow! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing](#testing)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive environment.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Interflow.git
   cd Interflow
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development Workflow

### Branch Naming

- **Features**: `feature/description` (e.g., `feature/add-dark-mode`)
- **Bug Fixes**: `fix/description` (e.g., `fix/navigation-bug`)
- **Documentation**: `docs/description` (e.g., `docs/update-readme`)
- **Refactoring**: `refactor/description` (e.g., `refactor/simplify-auth`)
- **Performance**: `perf/description` (e.g., `perf/optimize-rendering`)

### Code Organization

```
src/
├── components/     # React components
│   ├── canvas/     # Canvas-related components
│   ├── common/     # Reusable components
│   ├── context/    # Context management components
│   ├── export/     # Export functionality
│   ├── inference/  # LLM inference components
│   ├── navigation/ # Navigation components
│   ├── search/     # Search functionality
│   ├── settings/   # Settings components
│   └── summary/    # Summary views
├── services/       # Business logic and API services
├── store/          # Zustand state management
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Pull Request Process

1. **Update your branch** with the latest from main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**:
   ```bash
   npm run build
   npm run lint
   ```

3. **Commit your changes** following the [commit message guidelines](#commit-message-guidelines)

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub:
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Ensure CI checks pass

6. **Address review feedback** promptly and professionally

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define proper types** - avoid `any` when possible
- **Use interfaces** for object shapes
- **Export types** that are used in multiple files

### React

- **Functional components** with hooks (no class components)
- **Descriptive component names** (PascalCase)
- **Extract complex logic** into custom hooks
- **Use memo** for expensive components
- **Keep components small** and focused

### Styling

- **Tailwind CSS** for styling
- **Dark mode support** using `dark:` prefix
- **Responsive design** using Tailwind breakpoints
- **Consistent spacing** using Tailwind's spacing scale

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `ChatNode.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `contextBuilder.ts`)
- **Types**: `camelCase.ts` (e.g., `conversation.ts`)
- **Hooks**: `use*.ts` (e.g., `useConversationStore.ts`)

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```
feat(navigation): add breadcrumb navigation component

Implemented breadcrumb navigation showing the path from root to current node.
Includes click-to-navigate functionality and bookmark indicators.

Closes #123
```

```
fix(canvas): resolve path highlighting edge case

Fixed issue where path highlighting would fail when navigating
to nodes with no parent.
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- **Test file naming**: `ComponentName.test.tsx`
- **Test organization**: Describe blocks for each component/function
- **Coverage**: Aim for >80% coverage on new code
- **Edge cases**: Test error conditions and edge cases

### Manual Testing

Before submitting a PR, manually test:

1. **All affected features** work as expected
2. **Dark mode** if UI changes were made
3. **Responsive design** at different screen sizes
4. **Browser compatibility** (Chrome, Firefox, Safari)

## Questions?

If you have questions about contributing, please:

1. Check existing issues and discussions
2. Read the documentation
3. Ask in a new issue with the `question` label

Thank you for contributing to InferFlow! 🎉
