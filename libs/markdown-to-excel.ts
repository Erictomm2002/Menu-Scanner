import { CellRichTextValue, RichText } from 'exceljs';

/**
 * Parse Markdown text to ExcelJS rich text format.
 * Supports:
 * - **text** for bold
 * - *text* for italic
 * - Line breaks (\n)
 *
 * @param markdown - Markdown formatted text
 * @returns ExcelJS CellRichTextValue or string if no formatting needed
 */
export function markdownToExcelRichText(markdown: string): string | CellRichTextValue {
  if (!markdown || markdown.trim() === '') {
    return '';
  }

  const text = markdown.trim();

  // Check if there's any markdown formatting
  const hasMarkdown = /\*\*.*?\*\*/.test(text) || /(?<!\*)\*([^*]+)\*(?!\*)/.test(text);

  if (!hasMarkdown) {
    return text;
  }

  // Parse markdown to rich text fragments
  const fragments: RichText[] = [];
  let currentText = '';
  let inBold = false;
  let inItalic = false;
  let i = 0;

  while (i < text.length) {
    // Check for bold opening **
    if (text[i] === '*' && text[i + 1] === '*' && !inBold && !inItalic) {
      // Add current text as a fragment
      if (currentText) {
        fragments.push({ font: { bold: inBold, italic: inItalic }, text: currentText });
        currentText = '';
      }
      inBold = true;
      i += 2;
      continue;
    }

    // Check for bold closing **
    if (text[i] === '*' && text[i + 1] === '*' && inBold) {
      // Add current text as a fragment
      if (currentText) {
        fragments.push({ font: { bold: inBold, italic: inItalic }, text: currentText });
        currentText = '';
      }
      inBold = false;
      i += 2;
      continue;
    }

    // Check for italic opening * (not part of **)
    if (text[i] === '*' && text[i + 1] !== '*' && !inBold && !inItalic) {
      // Add current text as a fragment
      if (currentText) {
        fragments.push({ font: { bold: inBold, italic: inItalic }, text: currentText });
        currentText = '';
      }
      inItalic = true;
      i += 1;
      continue;
    }

    // Check for italic closing * (not part of **)
    if (text[i] === '*' && text[i + 1] !== '*' && inItalic && !inBold) {
      // Add current text as a fragment
      if (currentText) {
        fragments.push({ font: { bold: inBold, italic: inItalic }, text: currentText });
        currentText = '';
      }
      inItalic = false;
      i += 1;
      continue;
    }

    // Add character to current text
    currentText += text[i];
    i++;
  }

  // Add remaining text as a fragment
  if (currentText) {
    fragments.push({ font: { bold: inBold, italic: inItalic }, text: currentText });
  }

  // Merge consecutive fragments with same formatting
  const mergedFragments = mergeConsecutiveFragments(fragments);

  // Return simple text if only one fragment with no formatting
  if (mergedFragments.length === 1 && !mergedFragments[0].font?.bold && !mergedFragments[0].font?.italic) {
    return mergedFragments[0].text;
  }

  return { richText: mergedFragments };
}

/**
 * Merge consecutive fragments with same formatting.
 * This reduces number of rich text fragments for better Excel compatibility.
 */
function mergeConsecutiveFragments(fragments: RichText[]): RichText[] {
  if (fragments.length === 0) return [];

  const merged: RichText[] = [fragments[0]];

  for (let i = 1; i < fragments.length; i++) {
    const last = merged[merged.length - 1];
    const current = fragments[i];

    const lastBold = last.font?.bold === true;
    const lastItalic = last.font?.italic === true;
    const currentBold = current.font?.bold === true;
    const currentItalic = current.font?.italic === true;

    if (lastBold === currentBold && lastItalic === currentItalic) {
      // Merge - same formatting
      last.text += current.text;
    } else {
      // Different formatting - keep separate
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Simple parser for markdown-like descriptions in format:
 * - "1/ Item one"
 * - "- Bullet point"
 * - "**Bold text**"
 * - "*Italic text*"
 *
 * Converts line breaks and special markers to Excel-friendly format.
 */
export function parseDescriptionForExcel(description: string | null | undefined): string | CellRichTextValue {
  if (!description) {
    return '';
  }

  // First try to parse as markdown with rich text
  const richTextResult = markdownToExcelRichText(description);

  // If result is already a string, return it
  if (typeof richTextResult === 'string') {
    return richTextResult;
  }

  // Result is rich text, return it
  return richTextResult;
}
