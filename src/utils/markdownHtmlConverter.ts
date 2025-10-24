import { marked } from "marked";
import TurndownService from "turndown";

// Configure marked for security and GitHub-flavored markdown
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
});

// Configure TurndownService for better HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx", // Use # for headings
  codeBlockStyle: "fenced", // Use ``` for code blocks
  emDelimiter: "*", // Use * for italic
  strongDelimiter: "**", // Use ** for bold
  bulletListMarker: "-", // Use - for bullet lists
});

// Add custom rules for better conversion
turndownService.addRule("strikethrough", {
  filter: ["del", "s", "strike"],
  replacement: (content) => `~~${content}~~`,
});

turndownService.addRule("highlight", {
  filter: (node) => {
    return (
      node.nodeName === "MARK" ||
      (node.nodeName === "SPAN" &&
        node.classList &&
        node.classList.contains("highlight"))
    );
  },
  replacement: (content) => `==${content}==`,
});

/**
 * Convert Markdown to HTML
 * @param markdown - Markdown string
 * @returns HTML string
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || markdown.trim() === "") {
    return "";
  }

  try {
    const html = marked.parse(markdown, { async: false }) as string;
    return html;
  } catch (error) {
    console.error("Error converting Markdown to HTML:", error);
    // Return the original markdown wrapped in a paragraph as fallback
    return `<p>${markdown}</p>`;
  }
}

/**
 * Convert HTML to Markdown
 * @param html - HTML string
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html.trim() === "") {
    return "";
  }

  try {
    const markdown = turndownService.turndown(html);
    return markdown;
  } catch (error) {
    console.error("Error converting HTML to Markdown:", error);
    // Return the original HTML as fallback (strip tags for basic text)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || html;
  }
}

/**
 * Check if a string contains HTML tags
 * @param str - String to check
 * @returns True if string contains HTML tags
 */
export function isHtml(str: string): boolean {
  if (!str) return false;

  // Check for common HTML patterns
  const htmlPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlPattern.test(str);
}

/**
 * Sanitize HTML to remove dangerous scripts
 * Note: For production, consider using DOMPurify library
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Remove script tags
  const scripts = tempDiv.querySelectorAll("script");
  scripts.forEach((script) => script.remove());

  // Remove event handlers
  const allElements = tempDiv.querySelectorAll("*");
  allElements.forEach((element) => {
    // Remove on* attributes
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith("on")) {
        element.removeAttribute(attr.name);
      }
    });
  });

  return tempDiv.innerHTML;
}

/**
 * Convert between Markdown and HTML based on current mode
 * @param content - Content string
 * @param fromMode - Current mode ('markdown' or 'richtext')
 * @param toMode - Target mode ('markdown' or 'richtext')
 * @returns Converted content
 */
export function convertContent(
  content: string,
  fromMode: "markdown" | "richtext",
  toMode: "markdown" | "richtext"
): string {
  if (fromMode === toMode) {
    return content;
  }

  if (fromMode === "markdown" && toMode === "richtext") {
    return markdownToHtml(content);
  }

  if (fromMode === "richtext" && toMode === "markdown") {
    return htmlToMarkdown(content);
  }

  return content;
}
