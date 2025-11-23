import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

// Mock the config store
vi.mock('../../store/configStore', () => ({
  useConfigStore: () => ({ theme: 'light' }),
}));

describe('MarkdownRenderer', () => {
  it('should render plain text', () => {
    render(<MarkdownRenderer content="Hello, World!" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should render markdown headings', () => {
    render(<MarkdownRenderer content="# Heading 1" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Heading 1');
  });

  it('should render markdown lists', () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render links', () => {
    render(<MarkdownRenderer content="[Click here](https://example.com)" />);
    const link = screen.getByRole('link', { name: /click here/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('should add external link indicator for external links', () => {
    render(<MarkdownRenderer content="[External](https://example.com)" />);
    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render inline code', () => {
    render(<MarkdownRenderer content="`const x = 42`" />);
    const code = screen.getByText('const x = 42');

    expect(code.tagName).toBe('CODE');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MarkdownRenderer content="Test" className="custom-class" />
    );
    const wrapper = container.firstChild;

    expect(wrapper).toHaveClass('markdown-content');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should render blockquotes', () => {
    render(<MarkdownRenderer content="> This is a quote" />);
    const blockquote = screen.getByText(/This is a quote/);

    expect(blockquote.closest('blockquote')).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
