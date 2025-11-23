# Testing Guide

This directory contains test utilities and configuration for InferFlow.

## Test Structure

```
src/
├── test/
│   ├── setup.ts          # Vitest setup and global mocks
│   ├── test-utils.tsx    # Custom render functions and factories
│   └── README.md         # This file
├── **/*.test.ts(x)       # Unit tests alongside source files
└── components/           # Component tests in component directories
```

## Running Tests

### Unit & Component Tests (Vitest)

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
npm run playwright:install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## Writing Tests

### Unit Tests

Place test files next to the source files with `.test.ts` or `.test.tsx` extension:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction()).toBe(42);
  });
});
```

### Component Tests

Use the custom `test-utils.tsx` for rendering components:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### E2E Tests

Place E2E tests in the `e2e/` directory:

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

## Test Utilities

### Mock Factories

```typescript
import { createMockNode, createMockChain } from '../test/test-utils';

// Create a single mock node
const node = createMockNode({
  question: 'Custom question',
  answer: 'Custom answer',
});

// Create a chain of connected nodes
const chain = createMockChain(5); // Creates 5 connected nodes
```

### Custom Render

```typescript
import { renderWithProviders } from '../test/test-utils';

// Render with providers (currently basic, can be extended)
const { getByText } = renderWithProviders(<MyComponent />);
```

## Coverage Thresholds

Current thresholds (set in `vitest.config.ts`):
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

## Best Practices

1. **Test behavior, not implementation**
   - Focus on what the component does, not how it does it
   - Avoid testing internal state or private methods

2. **Use descriptive test names**
   - Good: `'should display error message when form is invalid'`
   - Bad: `'test 1'`

3. **Arrange, Act, Assert**
   - Arrange: Set up test data
   - Act: Perform the action
   - Assert: Verify the result

4. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` and `afterEach` for setup/cleanup

5. **Mock external dependencies**
   - Mock API calls, timers, and other side effects
   - Use Vitest's `vi.mock()` for module mocking

6. **Test accessibility**
   - Use semantic queries (getByRole, getByLabelText)
   - Test keyboard navigation
   - Verify ARIA attributes

## Common Patterns

### Testing async code

```typescript
it('should load data', async () => {
  render(<MyComponent />);

  await screen.findByText('Loading...');
  await screen.findByText('Data loaded');
});
```

### Testing user interactions

```typescript
it('should toggle on click', async () => {
  const user = userEvent.setup();
  render(<Toggle />);

  const button = screen.getByRole('button');
  await user.click(button);

  expect(button).toHaveAttribute('aria-pressed', 'true');
});
```

### Mocking stores

```typescript
vi.mock('../../store/configStore', () => ({
  useConfigStore: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}));
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
