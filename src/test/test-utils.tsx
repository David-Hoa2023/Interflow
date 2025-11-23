import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ConversationNode } from '../types/conversation';

// Custom render function that can include providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// Mock conversation node factory
export function createMockNode(overrides?: Partial<ConversationNode>): ConversationNode {
  return {
    id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name: 'Test Node',
    type: 'answer',
    question: 'Test question',
    answer: 'Test answer',
    parentId: null,
    childrenIds: [],
    context: [],
    timestamp: Date.now(),
    position: { x: 0, y: 0 },
    isCollapsed: false,
    ...overrides,
  };
}

// Mock conversation chain factory
export function createMockChain(length: number): ConversationNode[] {
  const nodes: ConversationNode[] = [];
  let parentId: string | null = null;

  for (let i = 0; i < length; i++) {
    const node = createMockNode({
      name: `Node ${i + 1}`,
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`,
      parentId,
    });
    nodes.push(node);
    parentId = node.id;
  }

  // Update childrenIds
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].childrenIds = [nodes[i + 1].id];
  }

  return nodes;
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
