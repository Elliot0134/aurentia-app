import type { Resource, ResourceContent, ContentBlock, ResourceTab } from '@/types/resourceTypes';
import { markdownToHtml } from '@/utils/markdownHtmlConverter';
import {
  isTextBlock,
  isImageBlock,
  isVideoBlock,
  isFileBlock,
  isTableBlock,
  isDividerBlock,
  isCodeBlock,
  isQuoteBlock,
  isButtonBlock,
  isAlertBlock,
  isChecklistBlock,
  isEmbedBlock,
  isQuizBlock,
  isTabsBlock,
  isColumnsBlock,
  isGridBlock,
  isAccordionBlock,
  isCalloutBlock,
  isToggleBlock,
} from '@/types/resourceTypes';

/**
 * Convert a Resource to HTML suitable for newsletter display
 */
export function convertResourceToHTML(resource: Resource): string {
  const content = resource.content;

  if (!content || !content.tabs || content.tabs.length === 0) {
    return '<p>No content available</p>';
  }

  let html = '';

  // Add resource title as main heading
  if (resource.title) {
    html += `<h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin-bottom: 16px;">${escapeHtml(resource.title)}</h1>\n\n`;
  }

  // Add description if available
  if (resource.description) {
    html += `<p style="color: #666; font-size: 16px; margin-bottom: 24px;">${escapeHtml(resource.description)}</p>\n\n`;
  }

  // Convert tabs
  content.tabs.forEach((tab, index) => {
    // Add tab title as section heading (if there's more than one tab or tab has explicit title)
    if (content.tabs!.length > 1 || tab.title !== 'Contenu principal') {
      html += `<h2 style="color: #2563eb; font-size: 24px; font-weight: 600; margin-top: ${index > 0 ? '32px' : '0'}; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">${escapeHtml(tab.title)}</h2>\n\n`;
    }

    html += convertTabToHTML(tab);
  });

  // Wrap in email-friendly container
  return wrapInEmailContainer(html);
}

/**
 * Convert a tab to HTML
 */
function convertTabToHTML(tab: ResourceTab): string {
  let html = '';

  if (tab.mode === 'direct' && tab.blocks) {
    // Direct mode: convert blocks directly
    tab.blocks.forEach(block => {
      html += convertBlockToHTML(block);
    });
  } else if (tab.sections) {
    // Sectioned mode: convert sections
    tab.sections.forEach(section => {
      // Add section title
      if (section.title) {
        html += `<h3 style="color: #374151; font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 12px;">${escapeHtml(section.title)}</h3>\n\n`;
      }

      // Add section description
      if (section.description) {
        html += `<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px; font-style: italic;">${escapeHtml(section.description)}</p>\n\n`;
      }

      // Convert blocks in section
      section.blocks.forEach(block => {
        html += convertBlockToHTML(block);
      });
    });
  }

  return html;
}

/**
 * Convert a single block to HTML
 */
function convertBlockToHTML(block: ContentBlock): string {
  // Handle text blocks
  if (isTextBlock(block)) {
    const mode = block.data.mode || 'markdown';
    const content = mode === 'richtext' ? block.data.html : markdownToHtml(block.data.markdown || '');
    return `<div style="margin-bottom: 16px;">${content || ''}</div>\n\n`;
  }

  // Handle image blocks
  if (isImageBlock(block)) {
    const { url, alt, caption } = block.data;
    let html = '<div style="margin-bottom: 24px; text-align: center;">\n';
    html += `  <img src="${escapeHtml(url)}" alt="${escapeHtml(alt || '')}" style="max-width: 100%; height: auto; border-radius: 8px;" />\n`;
    if (caption) {
      html += `  <p style="color: #6b7280; font-size: 14px; margin-top: 8px; font-style: italic;">${escapeHtml(caption)}</p>\n`;
    }
    html += '</div>\n\n';
    return html;
  }

  // Handle video blocks
  if (isVideoBlock(block)) {
    const { platform, embedId, title, url } = block.data;
    let html = '<div style="margin-bottom: 24px;">\n';

    if (platform === 'youtube' && embedId) {
      html += `  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">\n`;
      html += `    <iframe src="https://www.youtube.com/embed/${escapeHtml(embedId)}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>\n`;
      html += `  </div>\n`;
    } else {
      // Fallback to link
      html += `  <p><a href="${escapeHtml(url)}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(title || 'Watch Video')}</a></p>\n`;
    }

    html += '</div>\n\n';
    return html;
  }

  // Handle file blocks
  if (isFileBlock(block)) {
    const { filename, url } = block.data;
    return `<div style="margin-bottom: 16px; padding: 12px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #2563eb;">\n` +
           `  <a href="${escapeHtml(url)}" style="color: #2563eb; text-decoration: none; font-weight: 500;" download>\n` +
           `    📎 ${escapeHtml(filename)}\n` +
           `  </a>\n` +
           `</div>\n\n`;
  }

  // Handle table blocks
  if (isTableBlock(block)) {
    const { headers, rows, hasHeader } = block.data;
    let html = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e5e7eb;">\n';

    if (hasHeader && headers.length > 0) {
      html += '  <thead>\n    <tr style="background-color: #f3f4f6;">\n';
      headers.forEach(header => {
        html += `      <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">${escapeHtml(header)}</th>\n`;
      });
      html += '    </tr>\n  </thead>\n';
    }

    html += '  <tbody>\n';
    rows.forEach((row, idx) => {
      html += `    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">\n`;
      row.forEach(cell => {
        html += `      <td style="padding: 12px; border: 1px solid #e5e7eb;">${escapeHtml(cell)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>\n\n';

    return html;
  }

  // Handle divider blocks
  if (isDividerBlock(block)) {
    const style = block.data.style || 'solid';
    const borderStyle = style === 'dashed' ? 'dashed' : style === 'dotted' ? 'dotted' : 'solid';
    return `<hr style="border: none; border-top: ${style === 'thick' ? '3px' : '1px'} ${borderStyle} #e5e7eb; margin: 24px 0;" />\n\n`;
  }

  // Handle code blocks
  if (isCodeBlock(block)) {
    const { code, language, filename } = block.data;
    let html = '<div style="margin-bottom: 24px; background-color: #1e293b; border-radius: 8px; overflow: hidden;">\n';
    if (filename) {
      html += `  <div style="padding: 8px 16px; background-color: #0f172a; color: #94a3b8; font-size: 12px; font-family: monospace;">${escapeHtml(filename)}</div>\n`;
    }
    html += `  <pre style="padding: 16px; margin: 0; overflow-x: auto;"><code style="color: #e2e8f0; font-family: 'Courier New', monospace; font-size: 14px;">${escapeHtml(code)}</code></pre>\n`;
    html += '</div>\n\n';
    return html;
  }

  // Handle quote blocks
  if (isQuoteBlock(block)) {
    const { quote, author, source } = block.data;
    let html = '<blockquote style="margin: 24px 0; padding: 16px 24px; border-left: 4px solid #2563eb; background-color: #eff6ff; font-style: italic; color: #1e40af;">\n';
    html += `  <p style="margin: 0; font-size: 16px;">"${escapeHtml(quote)}"</p>\n`;
    if (author || source) {
      html += `  <footer style="margin-top: 8px; font-size: 14px; color: #3b82f6; font-style: normal;">\n`;
      html += `    — ${escapeHtml(author || '')}${source ? `, ${escapeHtml(source)}` : ''}\n`;
      html += `  </footer>\n`;
    }
    html += '</blockquote>\n\n';
    return html;
  }

  // Handle button blocks
  if (isButtonBlock(block)) {
    const { text, url, variant } = block.data;
    const bgColor = variant === 'primary' ? '#2563eb' : variant === 'secondary' ? '#6b7280' : '#e5e7eb';
    const textColor = variant === 'outline' ? '#2563eb' : '#ffffff';
    const border = variant === 'outline' ? 'border: 2px solid #2563eb;' : '';

    return `<div style="margin: 24px 0; text-align: center;">\n` +
           `  <a href="${escapeHtml(url)}" style="display: inline-block; padding: 12px 32px; background-color: ${bgColor}; color: ${textColor}; text-decoration: none; border-radius: 8px; font-weight: 600; ${border}">\n` +
           `    ${escapeHtml(text)}\n` +
           `  </a>\n` +
           `</div>\n\n`;
  }

  // Handle alert blocks
  if (isAlertBlock(block)) {
    const { variant, title, message } = block.data;
    const colors = {
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
      warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
      success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    };
    const color = colors[variant];

    let html = `<div style="margin: 24px 0; padding: 16px; background-color: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: 8px;">\n`;
    if (title) {
      html += `  <p style="margin: 0 0 8px 0; font-weight: 600; color: ${color.text};">${escapeHtml(title)}</p>\n`;
    }
    html += `  <p style="margin: 0; color: ${color.text};">${escapeHtml(message)}</p>\n`;
    html += `</div>\n\n`;
    return html;
  }

  // Handle checklist blocks
  if (isChecklistBlock(block)) {
    const { title, items } = block.data;
    let html = '<div style="margin-bottom: 24px;">\n';
    if (title) {
      html += `  <h4 style="margin-bottom: 12px; color: #374151; font-size: 16px; font-weight: 600;">${escapeHtml(title)}</h4>\n`;
    }
    html += '  <ul style="list-style: none; padding: 0;">\n';
    items.forEach(item => {
      const checkbox = item.checked ? '☑' : '☐';
      html += `    <li style="margin-bottom: 8px; color: #4b5563;">${checkbox} ${escapeHtml(item.text)}</li>\n`;
    });
    html += '  </ul>\n</div>\n\n';
    return html;
  }

  // Handle embed blocks
  if (isEmbedBlock(block)) {
    const { url, height, title } = block.data;
    return `<div style="margin-bottom: 24px;">\n` +
           `  <iframe src="${escapeHtml(url)}" style="width: 100%; height: ${height || 400}px; border: 1px solid #e5e7eb; border-radius: 8px;" title="${escapeHtml(title || 'Embedded content')}"></iframe>\n` +
           `</div>\n\n`;
  }

  // Handle quiz blocks (simplified for newsletter)
  if (isQuizBlock(block)) {
    const { title, description, questions } = block.data;
    let html = '<div style="margin: 24px 0; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border: 2px solid #3b82f6;">\n';
    if (title) {
      html += `  <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px; font-weight: 600;">📝 ${escapeHtml(title)}</h4>\n`;
    }
    if (description) {
      html += `  <p style="margin: 0 0 16px 0; color: #3b82f6;">${escapeHtml(description)}</p>\n`;
    }
    html += `  <p style="margin: 0; color: #1e40af; font-style: italic;">This quiz contains ${questions.length} question${questions.length !== 1 ? 's' : ''}. View the full resource to take the quiz!</p>\n`;
    html += '</div>\n\n';
    return html;
  }

  // Handle layout blocks (flatten to linear HTML)

  // Tabs: Convert to sequential sections
  if (isTabsBlock(block)) {
    let html = '';
    block.data.tabs.forEach((tab, index) => {
      html += `<div style="margin: ${index > 0 ? '32px' : '0'} 0;">\n`;
      html += `  <h3 style="color: #2563eb; font-size: 18px; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">${escapeHtml(tab.label)}</h3>\n`;
      tab.blocks.forEach(childBlock => {
        html += convertBlockToHTML(childBlock);
      });
      html += '</div>\n\n';
    });
    return html;
  }

  // Columns: Convert to responsive stacked layout
  if (isColumnsBlock(block)) {
    let html = '<div style="margin-bottom: 24px;">\n';
    block.data.columns.forEach((column, index) => {
      html += `  <div style="margin-bottom: ${index < block.data.columns.length - 1 ? '24px' : '0'};">\n`;
      column.blocks.forEach(childBlock => {
        html += '    ' + convertBlockToHTML(childBlock).replace(/\n/g, '\n    ');
      });
      html += '  </div>\n';
    });
    html += '</div>\n\n';
    return html;
  }

  // Grid: Convert to stacked layout
  if (isGridBlock(block)) {
    let html = '<div style="margin-bottom: 24px;">\n';
    block.data.cells.forEach((cell, index) => {
      html += `  <div style="margin-bottom: ${index < block.data.cells.length - 1 ? '16px' : '0'}; padding: 16px; background-color: #f9fafb; border-radius: 8px;">\n`;
      cell.blocks.forEach(childBlock => {
        html += '    ' + convertBlockToHTML(childBlock).replace(/\n/g, '\n    ');
      });
      html += '  </div>\n';
    });
    html += '</div>\n\n';
    return html;
  }

  // Accordion: Convert to expanded sections
  if (isAccordionBlock(block)) {
    let html = '';
    block.data.items.forEach((item, index) => {
      html += `<div style="margin: ${index > 0 ? '16px' : '0'} 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">\n`;
      html += `  <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">▼ ${escapeHtml(item.title)}</h4>\n`;
      item.blocks.forEach(childBlock => {
        html += '  ' + convertBlockToHTML(childBlock).replace(/\n/g, '\n  ');
      });
      html += '</div>\n\n';
    });
    return html;
  }

  // Callout: Convert to styled box
  if (isCalloutBlock(block)) {
    const { variant, title, blocks } = block.data;
    const colors = {
      info: { bg: '#eff6ff', border: '#3b82f6' },
      warning: { bg: '#fef3c7', border: '#f59e0b' },
      success: { bg: '#d1fae5', border: '#10b981' },
      error: { bg: '#fee2e2', border: '#ef4444' },
    };
    const color = colors[variant];

    let html = `<div style="margin: 24px 0; padding: 20px; background-color: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: 8px;">\n`;
    if (title) {
      html += `  <h4 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${escapeHtml(title)}</h4>\n`;
    }
    blocks.forEach(childBlock => {
      html += '  ' + convertBlockToHTML(childBlock).replace(/\n/g, '\n  ');
    });
    html += '</div>\n\n';
    return html;
  }

  // Toggle: Convert to expanded content
  if (isToggleBlock(block)) {
    const { title, blocks } = block.data;
    let html = `<div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">\n`;
    html += `  <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 15px; font-weight: 600;">▼ ${escapeHtml(title)}</h4>\n`;
    blocks.forEach(childBlock => {
      html += '  ' + convertBlockToHTML(childBlock).replace(/\n/g, '\n  ');
    });
    html += '</div>\n\n';
    return html;
  }

  // Unknown block type
  return `<p style="color: #6b7280; font-style: italic;">Unsupported block type</p>\n\n`;
}

/**
 * Wrap HTML content in email-friendly container
 */
function wrapInEmailContainer(html: string): string {
  return `
<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937;">
${html}
</div>
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
