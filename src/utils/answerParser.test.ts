import { describe, it, expect } from 'vitest';
import { parseAnswerIntoSections } from './answerParser';

describe('answerParser', () => {
  describe('parseAnswerIntoSections', () => {
    it('should return single section for simple answer', () => {
      const answer = 'This is a simple answer.';
      const sections = parseAnswerIntoSections(answer);

      expect(sections).toHaveLength(1);
      expect(sections[0].text).toBe(answer);
      expect(sections[0].index).toBe(0);
    });

    it('should split answer by double newlines', () => {
      const answer = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const sections = parseAnswerIntoSections(answer);

      expect(sections).toHaveLength(3);
      expect(sections[0].text).toBe('First paragraph.');
      expect(sections[1].text).toBe('Second paragraph.');
      expect(sections[2].text).toBe('Third paragraph.');
    });

    it('should handle numbered lists as separate sections', () => {
      const answer = '1. First item\n2. Second item\n3. Third item';
      const sections = parseAnswerIntoSections(answer);

      expect(sections.length).toBeGreaterThan(0);
      expect(sections[0].text).toContain('First item');
    });

    it('should handle empty answer', () => {
      const sections = parseAnswerIntoSections('');

      expect(sections).toHaveLength(0);
    });

    it('should trim whitespace from sections', () => {
      const answer = '  First section  \n\n  Second section  ';
      const sections = parseAnswerIntoSections(answer);

      expect(sections[0].text).toBe('First section');
      expect(sections[1].text).toBe('Second section');
    });

    it('should generate unique IDs for each section', () => {
      const answer = 'Section 1\n\nSection 2\n\nSection 3';
      const sections = parseAnswerIntoSections(answer);

      const ids = sections.map(s => s.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should set correct index for each section', () => {
      const answer = 'A\n\nB\n\nC';
      const sections = parseAnswerIntoSections(answer);

      sections.forEach((section, i) => {
        expect(section.index).toBe(i);
      });
    });
  });
});
