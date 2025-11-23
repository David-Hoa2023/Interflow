import { describe, it, expect } from 'vitest';
import { buildContext, buildPrompt } from './contextBuilder';
import { createMockNode, createMockChain } from '../test/test-utils';

describe('contextBuilder', () => {
  describe('buildContext', () => {
    it('should return empty string for empty chain', () => {
      const result = buildContext(null, []);
      expect(result).toBe('');
    });

    it('should build context from single node', () => {
      const node = createMockNode({
        question: 'What is React?',
        answer: 'React is a JavaScript library.',
      });
      const result = buildContext(node, [node]);

      expect(result).toContain('Q: What is React?');
      expect(result).toContain('A: React is a JavaScript library.');
    });

    it('should build context from chain of nodes when using selected section', () => {
      const chain = createMockChain(3);
      // Using selectedSectionIndex triggers full chain mode
      const result = buildContext(chain[2], chain, 0);

      expect(result).toContain('Question 1');
      expect(result).toContain('Question 2');
      expect(result).toContain('Question 3');
    });

    it('should filter out nodes with includeInContext = false', () => {
      const chain = createMockChain(3);
      chain[1].includeInContext = false; // Exclude middle node

      // Using selectedSectionIndex to ensure full chain processing
      const result = buildContext(chain[2], chain, 0);

      expect(result).toContain('Question 1');
      expect(result).not.toContain('Question 2');
      expect(result).toContain('Question 3');
    });

    it('should return empty string when all nodes are excluded', () => {
      const chain = createMockChain(2);
      chain.forEach(node => node.includeInContext = false);

      const result = buildContext(chain[1], chain);

      expect(result).toBe('');
    });

    it('should handle selected section index', () => {
      const node = createMockNode({
        question: 'Test question',
        answer: 'Full answer',
        answerSections: [
          { id: '1', text: 'Section 1', index: 0 },
          { id: '2', text: 'Section 2', index: 1 },
        ],
      });

      const result = buildContext(node, [node], 1);

      expect(result).toContain('A (selected section): Section 2');
      expect(result).not.toContain('Full answer');
    });
  });

  describe('buildPrompt', () => {
    it('should return just question when no context', () => {
      const result = buildPrompt('What is React?', '');
      expect(result).toBe('What is React?');
    });

    it('should combine context and question', () => {
      const context = 'Previous conversation context';
      const question = 'Follow-up question';

      const result = buildPrompt(question, context);

      expect(result).toContain('Context from previous conversation:');
      expect(result).toContain(context);
      expect(result).toContain('Current question:');
      expect(result).toContain(question);
    });
  });
});
