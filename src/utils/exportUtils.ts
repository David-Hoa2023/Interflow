import { ConversationTree } from '../types/conversation';

/**
 * Export conversation tree to Markdown format
 */
export const exportToMarkdown = (tree: ConversationTree, sessionName?: string): string => {
  const lines: string[] = [];

  // Header
  lines.push(`# ${sessionName || 'InferFlow Conversation Export'}`);
  lines.push('');
  lines.push(`**Exported:** ${new Date().toLocaleString()}`);
  lines.push(`**Total Nodes:** ${tree.nodes.size}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Helper function to traverse tree depth-first
  const traverseNode = (nodeId: string, depth: number = 0) => {
    const node = tree.nodes.get(nodeId);
    if (!node) return;

    const prefix = depth === 0 ? '#' : '##';

    // Node header
    lines.push(`${prefix}${'#'.repeat(depth + 1)} ${node.name || `Node ${nodeId.slice(0, 8)}`}`);
    lines.push('');

    // Metadata
    if (node.model || node.cost !== undefined || node.tokens) {
      lines.push('**Metadata:**');
      if (node.model) lines.push(`- Model: ${node.model}`);
      if (node.provider) lines.push(`- Provider: ${node.provider}`);
      if (node.tokens) lines.push(`- Tokens: ${node.tokens.toLocaleString()}`);
      if (node.cost !== undefined && node.cost > 0) {
        lines.push(`- Cost: $${node.cost.toFixed(6)}`);
      }
      if (node.metadata?.processingTime) {
        lines.push(`- Processing Time: ${(node.metadata.processingTime / 1000).toFixed(2)}s`);
      }
      if (node.metadata?.createdAt) {
        lines.push(`- Created: ${new Date(node.metadata.createdAt).toLocaleString()}`);
      }
      lines.push('');
    }

    // Question
    lines.push('**Question:**');
    lines.push('');
    lines.push(node.question);
    lines.push('');

    // Answer
    lines.push('**Answer:**');
    lines.push('');
    lines.push(node.answer);
    lines.push('');

    // Tags
    if (node.tags && node.tags.length > 0) {
      lines.push(`**Tags:** ${node.tags.join(', ')}`);
      lines.push('');
    }

    // Attachments
    if (node.attachments && node.attachments.length > 0) {
      lines.push('**Attachments:**');
      node.attachments.forEach((att) => {
        if (att.type === 'link' && att.url) {
          lines.push(`- [${att.filename || 'Link'}](${att.url})`);
        } else {
          lines.push(`- ${att.filename || att.type}`);
        }
      });
      lines.push('');
    }

    lines.push('---');
    lines.push('');

    // Traverse children
    if (node.childrenIds && node.childrenIds.length > 0) {
      node.childrenIds.forEach((childId) => {
        traverseNode(childId, depth + 1);
      });
    }
  };

  // Start with root nodes
  tree.rootIds.forEach((rootId) => {
    traverseNode(rootId, 0);
  });

  return lines.join('\n');
};

/**
 * Export conversation tree to JSON format
 */
export const exportToJSON = (
  tree: ConversationTree,
  sessionName?: string,
  sessionId?: string
): string => {
  // Convert Map to array for JSON serialization
  const nodesArray = Array.from(tree.nodes.entries()).map(([_, node]) => ({
    ...node,
    metadata: node.metadata
      ? {
          ...node.metadata,
          createdAt: node.metadata.createdAt?.toISOString(),
          updatedAt: node.metadata.updatedAt?.toISOString(),
        }
      : undefined,
  }));

  const exportData = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    session: {
      id: sessionId || `export-${Date.now()}`,
      name: sessionName || 'Exported Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tree: {
      nodes: nodesArray,
      rootIds: tree.rootIds,
    },
    stats: {
      totalNodes: tree.nodes.size,
      totalRoots: tree.rootIds.length,
      totalCost: Array.from(tree.nodes.values()).reduce(
        (sum, node) => sum + (node.cost || 0),
        0
      ),
      totalTokens: Array.from(tree.nodes.values()).reduce(
        (sum, node) => sum + (node.tokens || 0),
        0
      ),
    },
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Download a file to the user's computer
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate a safe filename from session name
 */
export const generateFilename = (sessionName: string, extension: string): string => {
  const safeName = sessionName
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .substring(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  return `${safeName}-${timestamp}.${extension}`;
};
