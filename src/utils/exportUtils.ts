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

    // Generated Images (for image nodes)
    if (node.type === 'image' && node.imageData) {
      lines.push('**Generated Images:**');
      lines.push('');
      node.imageData.generatedImages.forEach((imageUrl, index) => {
        lines.push(`![Generated Image ${index + 1}](${imageUrl})`);
        lines.push('');
      });

      if (node.imageData.generationConfig) {
        lines.push('**Image Generation Settings:**');
        lines.push(`- Model: ${node.imageData.generationConfig.model}`);
        lines.push(`- Aspect Ratio: ${node.imageData.generationConfig.aspectRatio}`);
        if (node.imageData.generationConfig.numberOfImages) {
          lines.push(`- Number of Images: ${node.imageData.generationConfig.numberOfImages}`);
        }
        if (node.imageData.generationConfig.compositionMode) {
          lines.push(`- Composition Mode: ${node.imageData.generationConfig.compositionMode}`);
          lines.push(`- Composition Sources: ${node.imageData.generationConfig.compositionSources?.length || 0} images`);
        }
        lines.push('');
      }
    }

    // Tags
    if (node.tags && node.tags.length > 0) {
      lines.push(`**Tags:** ${node.tags.join(', ')}`);
      lines.push('');
    }

    // Attachments
    if (node.attachments && node.attachments.length > 0) {
      lines.push('**Attachments:**');
      node.attachments.forEach((att, index) => {
        if (att.type === 'image' && att.url) {
          // Embed images directly in markdown
          lines.push(`![${att.filename || `Image ${index + 1}`}](${att.url})`);
          lines.push('');
        } else if (att.type === 'link' && att.url) {
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
 * Export conversation tree to HTML format with embedded images
 */
export const exportToHTML = (tree: ConversationTree, sessionName?: string): string => {
  const html: string[] = [];

  // HTML Header with styling
  html.push('<!DOCTYPE html>');
  html.push('<html lang="en">');
  html.push('<head>');
  html.push('<meta charset="UTF-8">');
  html.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  html.push(`<title>${sessionName || 'InferFlow Conversation Export'}</title>`);
  html.push('<style>');
  html.push(`
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2, h3, h4 { color: #1e40af; margin-top: 30px; }
    .metadata { background: #f8fafc; padding: 15px; border-left: 4px solid #60a5fa; margin: 15px 0; border-radius: 4px; }
    .metadata p { margin: 5px 0; }
    .question { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .answer { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .image-container { margin: 20px 0; text-align: center; }
    .image-container img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .image-settings { background: #fef3c7; padding: 15px; border-radius: 4px; margin: 10px 0; font-size: 0.9em; }
    .tags { margin: 15px 0; }
    .tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 12px; margin: 4px; font-size: 0.85em; }
    .node-separator { border-top: 2px dashed #e5e7eb; margin: 40px 0; }
    pre { background: #1f2937; color: #f3f4f6; padding: 15px; border-radius: 4px; overflow-x: auto; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
  `);
  html.push('</style>');
  html.push('</head>');
  html.push('<body>');
  html.push('<div class="container">');

  // Header
  html.push(`<h1>${sessionName || 'InferFlow Conversation Export'}</h1>`);
  html.push('<div class="metadata">');
  html.push(`<p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>`);
  html.push(`<p><strong>Total Nodes:</strong> ${tree.nodes.size}</p>`);
  html.push('</div>');

  // Helper function to escape HTML
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  };

  // Helper function to traverse tree
  const traverseNode = (nodeId: string, depth: number = 0) => {
    const node = tree.nodes.get(nodeId);
    if (!node) return;

    const headingLevel = Math.min(depth + 2, 6);

    // Node header
    html.push(`<h${headingLevel}>${escapeHtml(node.name || `Node ${nodeId.slice(0, 8)}`)}</h${headingLevel}>`);

    // Metadata
    if (node.model || node.cost !== undefined || node.tokens) {
      html.push('<div class="metadata">');
      if (node.model) html.push(`<p><strong>Model:</strong> ${escapeHtml(node.model)}</p>`);
      if (node.provider) html.push(`<p><strong>Provider:</strong> ${escapeHtml(node.provider)}</p>`);
      if (node.tokens) html.push(`<p><strong>Tokens:</strong> ${node.tokens.toLocaleString()}</p>`);
      if (node.cost !== undefined && node.cost > 0) {
        html.push(`<p><strong>Cost:</strong> $${node.cost.toFixed(6)}</p>`);
      }
      if (node.metadata?.processingTime) {
        html.push(`<p><strong>Processing Time:</strong> ${(node.metadata.processingTime / 1000).toFixed(2)}s</p>`);
      }
      html.push('</div>');
    }

    // Question
    html.push('<div class="question">');
    html.push('<p><strong>Question:</strong></p>');
    html.push(`<p>${escapeHtml(node.question)}</p>`);
    html.push('</div>');

    // Answer
    html.push('<div class="answer">');
    html.push('<p><strong>Answer:</strong></p>');
    html.push(`<p>${escapeHtml(node.answer)}</p>`);
    html.push('</div>');

    // Generated Images
    if (node.type === 'image' && node.imageData) {
      html.push('<div class="image-container">');
      html.push('<p><strong>Generated Images:</strong></p>');
      node.imageData.generatedImages.forEach((imageUrl, index) => {
        html.push(`<img src="${imageUrl}" alt="Generated Image ${index + 1}" />`);
      });
      html.push('</div>');

      if (node.imageData.generationConfig) {
        html.push('<div class="image-settings">');
        html.push('<p><strong>Image Generation Settings:</strong></p>');
        html.push(`<p>Model: ${escapeHtml(node.imageData.generationConfig.model)}</p>`);
        html.push(`<p>Aspect Ratio: ${escapeHtml(node.imageData.generationConfig.aspectRatio)}</p>`);
        if (node.imageData.generationConfig.numberOfImages) {
          html.push(`<p>Number of Images: ${node.imageData.generationConfig.numberOfImages}</p>`);
        }
        if (node.imageData.generationConfig.compositionMode) {
          html.push(`<p>Composition Mode: ${escapeHtml(node.imageData.generationConfig.compositionMode)}</p>`);
          html.push(`<p>Composition Sources: ${node.imageData.generationConfig.compositionSources?.length || 0} images</p>`);
        }
        html.push('</div>');
      }
    }

    // Attachments
    if (node.attachments && node.attachments.length > 0) {
      html.push('<div class="attachments">');
      html.push('<p><strong>Attachments:</strong></p>');
      node.attachments.forEach((att, index) => {
        if (att.type === 'image' && att.url) {
          html.push('<div class="image-container">');
          html.push(`<img src="${att.url}" alt="${escapeHtml(att.filename || `Image ${index + 1}`)}" />`);
          html.push('</div>');
        } else if (att.type === 'link' && att.url) {
          html.push(`<p><a href="${att.url}" target="_blank">${escapeHtml(att.filename || 'Link')}</a></p>`);
        } else {
          html.push(`<p>${escapeHtml(att.filename || att.type)}</p>`);
        }
      });
      html.push('</div>');
    }

    // Tags
    if (node.tags && node.tags.length > 0) {
      html.push('<div class="tags">');
      html.push('<p><strong>Tags:</strong></p>');
      node.tags.forEach((tag) => {
        html.push(`<span class="tag">${escapeHtml(tag)}</span>`);
      });
      html.push('</div>');
    }

    html.push('<div class="node-separator"></div>');

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

  html.push('</div>');
  html.push('</body>');
  html.push('</html>');

  return html.join('\n');
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
