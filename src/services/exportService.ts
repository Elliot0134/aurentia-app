import type { ContentBlock, OrganizationResource } from '@/types/resourceTypes';

/**
 * Export resource to Markdown format
 */
export function exportToMarkdown(resource: OrganizationResource): string {
  let markdown = `# ${resource.title}\n\n`;

  if (resource.description) {
    markdown += `${resource.description}\n\n`;
  }

  markdown += `---\n\n`;

  // Handle ResourceContent structure with tabs and sections
  const content = resource.content as any;

  if (content?.tabs && Array.isArray(content.tabs)) {
    content.tabs.forEach((tab: any) => {
      if (tab.label) {
        markdown += `## ${tab.label}\n\n`;
      }

      if (tab.sections && Array.isArray(tab.sections)) {
        tab.sections.forEach((section: any) => {
          if (section.title) {
            markdown += `### ${section.title}\n\n`;
          }

          if (section.blocks && Array.isArray(section.blocks)) {
            section.blocks.forEach((block: ContentBlock) => {
              markdown += convertBlockToMarkdown(block);
              markdown += '\n\n';
            });
          }
        });
      }
    });
  } else if (content?.blocks && Array.isArray(content.blocks)) {
    // Fallback for old structure with direct blocks array
    content.blocks.forEach((block: ContentBlock) => {
      markdown += convertBlockToMarkdown(block);
      markdown += '\n\n';
    });
  }

  return markdown;
}

function convertBlockToMarkdown(block: ContentBlock, indent = 0): string {
  const indentStr = '  '.repeat(indent);

  switch (block.type) {
    case 'text':
      return indentStr + (block.data.markdown || block.data.content || '');

    case 'image':
      const imgAlt = block.data.alt || 'Image';
      const imgUrl = block.data.url || '';
      return indentStr + `![${imgAlt}](${imgUrl})`;

    case 'video':
      return indentStr + `[Vidéo: ${block.data.url}](${block.data.url})`;

    case 'file':
      const fileName = block.data.filename || block.data.fileName || 'Fichier';
      const fileUrl = block.data.url || '';
      return indentStr + `[📎 ${fileName}](${fileUrl})`;

    case 'table':
      return indentStr + (block.data.content || '');

    case 'divider':
      return indentStr + '---';

    case 'code':
      const lang = block.data.language || '';
      const code = block.data.code || '';
      return indentStr + `\`\`\`${lang}\n${code}\n\`\`\``;

    case 'quote':
      const quote = block.data.quote || '';
      const author = block.data.author ? `\n— ${block.data.author}` : '';
      const source = block.data.source ? ` (${block.data.source})` : '';
      return indentStr + `> ${quote}${author}${source}`;

    case 'button':
      const btnText = block.data.text || 'Button';
      const btnUrl = block.data.url || '#';
      return indentStr + `[${btnText}](${btnUrl})`;

    case 'alert':
      const alertType = block.data.type?.toUpperCase() || 'INFO';
      const alertMsg = block.data.message || '';
      return indentStr + `> **${alertType}**: ${alertMsg}`;

    case 'checklist':
      const items = block.data.items || [];
      return items.map(item =>
        indentStr + `- [${item.checked ? 'x' : ' '}] ${item.text}`
      ).join('\n');

    case 'embed':
      return indentStr + `[Intégration: ${block.data.url}](${block.data.url})`;

    case 'tabs':
      return block.data.tabs.map((tab, idx) => {
        let tabMd = indentStr + `### Tab: ${tab.label}\n\n`;
        tab.blocks.forEach(childBlock => {
          tabMd += convertBlockToMarkdown(childBlock, indent + 1);
          tabMd += '\n\n';
        });
        return tabMd;
      }).join('\n');

    case 'columns':
      return block.data.columns.map((col, idx) => {
        let colMd = indentStr + `#### Colonne ${idx + 1}\n\n`;
        col.blocks.forEach(childBlock => {
          colMd += convertBlockToMarkdown(childBlock, indent + 1);
          colMd += '\n\n';
        });
        return colMd;
      }).join('\n');

    case 'grid':
      return block.data.cells.map((cell, idx) => {
        let cellMd = indentStr + `#### Cellule ${idx + 1}\n\n`;
        cell.blocks.forEach(childBlock => {
          cellMd += convertBlockToMarkdown(childBlock, indent + 1);
          cellMd += '\n\n';
        });
        return cellMd;
      }).join('\n');

    case 'accordion':
      return block.data.sections.map(section => {
        let sectionMd = indentStr + `<details>\n`;
        sectionMd += indentStr + `<summary>${section.title}</summary>\n\n`;
        section.blocks.forEach(childBlock => {
          sectionMd += convertBlockToMarkdown(childBlock, indent + 1);
          sectionMd += '\n\n';
        });
        sectionMd += indentStr + `</details>`;
        return sectionMd;
      }).join('\n\n');

    case 'callout':
      const calloutType = block.data.type?.toUpperCase() || 'INFO';
      let calloutMd = indentStr + `> **${calloutType}**\n>\n`;
      block.data.blocks.forEach(childBlock => {
        const childMd = convertBlockToMarkdown(childBlock, 0);
        childMd.split('\n').forEach(line => {
          calloutMd += `> ${line}\n`;
        });
      });
      return calloutMd;

    case 'toggle':
      let toggleMd = indentStr + `<details>\n`;
      toggleMd += indentStr + `<summary>${block.data.title}</summary>\n\n`;
      block.data.blocks.forEach(childBlock => {
        toggleMd += convertBlockToMarkdown(childBlock, indent + 1);
        toggleMd += '\n\n';
      });
      toggleMd += indentStr + `</details>`;
      return toggleMd;

    default:
      return indentStr + `[Type de bloc inconnu: ${block.type}]`;
  }
}

/**
 * Export resource to HTML format
 */
export function exportToHTML(resource: OrganizationResource): string {
  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resource.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #ff5932; }
        h2 { color: #ff5932; border-bottom: 2px solid #ff5932; padding-bottom: 10px; }
        h3 { color: #666; }
        img { max-width: 100%; height: auto; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ff5932; margin: 0; padding-left: 20px; color: #666; }
        .alert { padding: 15px; border-radius: 5px; margin: 15px 0; }
        .alert-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .alert-warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .alert-error { background: #ffebee; border-left: 4px solid #f44336; }
        .alert-success { background: #e8f5e9; border-left: 4px solid #4caf50; }
        .button { display: inline-block; padding: 10px 20px; background: #ff5932; color: white; text-decoration: none; border-radius: 5px; }
        .checklist { list-style: none; padding-left: 0; }
        .checklist li { padding: 5px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .section { margin-bottom: 30px; }
    </style>
</head>
<body>
    <h1>${resource.title}</h1>
`;

  if (resource.description) {
    html += `    <p>${resource.description}</p>\n`;
  }

  html += `    <hr>\n\n`;

  // Handle ResourceContent structure with tabs and sections
  const content = resource.content as any;

  if (content?.tabs && Array.isArray(content.tabs)) {
    content.tabs.forEach((tab: any) => {
      if (tab.label) {
        html += `    <h2>${tab.label}</h2>\n`;
      }

      if (tab.sections && Array.isArray(tab.sections)) {
        tab.sections.forEach((section: any) => {
          html += `    <div class="section">\n`;

          if (section.title) {
            html += `        <h3>${section.title}</h3>\n`;
          }

          if (section.blocks && Array.isArray(section.blocks)) {
            section.blocks.forEach((block: ContentBlock) => {
              html += convertBlockToHTML(block, 2);
            });
          }

          html += `    </div>\n`;
        });
      }
    });
  } else if (content?.blocks && Array.isArray(content.blocks)) {
    // Fallback for old structure with direct blocks array
    content.blocks.forEach((block: ContentBlock) => {
      html += convertBlockToHTML(block, 1);
    });
  }

  html += `</body>
</html>`;

  return html;
}

function convertBlockToHTML(block: ContentBlock, indentLevel = 0): string {
  const indent = '    '.repeat(indentLevel);

  switch (block.type) {
    case 'text':
      // Simple conversion: wrap in <div> and preserve markdown basics
      return indent + `<div class="text-block">${block.data.markdown || block.data.content || ''}</div>\n`;

    case 'image':
      const imgAlt = block.data.alt || 'Image';
      const imgUrl = block.data.url || '';
      return indent + `<img src="${imgUrl}" alt="${imgAlt}" />\n`;

    case 'video':
      return indent + `<p><a href="${block.data.url}">Voir la vidéo: ${block.data.url}</a></p>\n`;

    case 'file':
      const fileNameHtml = block.data.filename || block.data.fileName || 'Fichier';
      const fileUrl = block.data.url || '';
      return indent + `<p><a href="${fileUrl}" download>📎 ${fileNameHtml}</a></p>\n`;

    case 'table':
      return indent + `<div class="table-block">${block.data.content || ''}</div>\n`;

    case 'divider':
      return indent + `<hr />\n`;

    case 'code':
      const lang = block.data.language || '';
      const code = block.data.code || '';
      return indent + `<pre><code class="language-${lang}">${escapeHTML(code)}</code></pre>\n`;

    case 'quote':
      const quote = block.data.quote || '';
      const author = block.data.author ? `<footer>— ${block.data.author}</footer>` : '';
      return indent + `<blockquote>${quote}${author}</blockquote>\n`;

    case 'button':
      const btnText = block.data.text || 'Button';
      const btnUrl = block.data.url || '#';
      return indent + `<a href="${btnUrl}" class="button">${btnText}</a>\n`;

    case 'alert':
      const alertType = block.data.type || 'info';
      const alertMsg = block.data.message || '';
      return indent + `<div class="alert alert-${alertType}">${alertMsg}</div>\n`;

    case 'checklist':
      const items = block.data.items || [];
      let checklistHtml = indent + `<ul class="checklist">\n`;
      items.forEach(item => {
        const checked = item.checked ? '☑' : '☐';
        checklistHtml += indent + `  <li>${checked} ${item.text}</li>\n`;
      });
      checklistHtml += indent + `</ul>\n`;
      return checklistHtml;

    case 'embed':
      const embedUrl = block.data.url || '';
      const height = block.data.height || 450;
      return indent + `<iframe src="${embedUrl}" width="100%" height="${height}" frameborder="0"></iframe>\n`;

    case 'tabs':
      let tabsHtml = indent + `<div class="tabs">\n`;
      block.data.tabs.forEach((tab, idx) => {
        tabsHtml += indent + `  <h3>${tab.label}</h3>\n`;
        tabsHtml += indent + `  <div class="tab-content">\n`;
        tab.blocks.forEach(childBlock => {
          tabsHtml += convertBlockToHTML(childBlock, indentLevel + 2);
        });
        tabsHtml += indent + `  </div>\n`;
      });
      tabsHtml += indent + `</div>\n`;
      return tabsHtml;

    case 'columns':
      let columnsHtml = indent + `<div style="display: grid; grid-template-columns: ${block.data.columns.map(c => `${c.width || 50}%`).join(' ')}; gap: 20px;">\n`;
      block.data.columns.forEach(col => {
        columnsHtml += indent + `  <div class="column">\n`;
        col.blocks.forEach(childBlock => {
          columnsHtml += convertBlockToHTML(childBlock, indentLevel + 2);
        });
        columnsHtml += indent + `  </div>\n`;
      });
      columnsHtml += indent + `</div>\n`;
      return columnsHtml;

    case 'grid':
      const layout = block.data.layout || '2x2';
      const [cols, rows] = layout.split('x').map(Number);
      let gridHtml = indent + `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 20px;">\n`;
      block.data.cells.forEach(cell => {
        gridHtml += indent + `  <div class="grid-cell">\n`;
        cell.blocks.forEach(childBlock => {
          gridHtml += convertBlockToHTML(childBlock, indentLevel + 2);
        });
        gridHtml += indent + `  </div>\n`;
      });
      gridHtml += indent + `</div>\n`;
      return gridHtml;

    case 'accordion':
      let accordionHtml = indent + `<div class="accordion">\n`;
      block.data.sections.forEach(section => {
        accordionHtml += indent + `  <details>\n`;
        accordionHtml += indent + `    <summary>${section.title}</summary>\n`;
        section.blocks.forEach(childBlock => {
          accordionHtml += convertBlockToHTML(childBlock, indentLevel + 2);
        });
        accordionHtml += indent + `  </details>\n`;
      });
      accordionHtml += indent + `</div>\n`;
      return accordionHtml;

    case 'callout':
      const calloutType = block.data.type || 'info';
      let calloutHtml = indent + `<div class="alert alert-${calloutType}">\n`;
      block.data.blocks.forEach(childBlock => {
        calloutHtml += convertBlockToHTML(childBlock, indentLevel + 1);
      });
      calloutHtml += indent + `</div>\n`;
      return calloutHtml;

    case 'toggle':
      let toggleHtml = indent + `<details>\n`;
      toggleHtml += indent + `  <summary>${block.data.title}</summary>\n`;
      block.data.blocks.forEach(childBlock => {
        toggleHtml += convertBlockToHTML(childBlock, indentLevel + 1);
      });
      toggleHtml += indent + `</details>\n`;
      return toggleHtml;

    default:
      return indent + `<p>[Type de bloc inconnu: ${block.type}]</p>\n`;
  }
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Download a string as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
