import { useState } from "react";
import { Bold, Italic, List, ListOrdered, Type, Eye, EyeOff, HelpCircle } from "lucide-react";

interface MarkdownInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

/**
 * Markdown input component with live preview and formatting helpers.
 * Supports:
 * - **text** for bold
 * - *text* for italic
 * - ## Header for headers
 * - - item for bullet lists
 * - 1. item for numbered lists
 */
export function MarkdownInput({
  label,
  value,
  onChange,
  placeholder = "Nhập mô tả với định dạng Markdown...",
  required = false,
  error,
  helperText,
}: MarkdownInputProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("markdown-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);

    onChange(newText);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBold = () => insertMarkdown("**", "**");
  const insertItalic = () => insertMarkdown("*", "*");
  const insertHeader = () => insertMarkdown("## ", "");
  const insertBullet = () => insertMarkdown("- ", "");
  const insertNumbered = () => insertMarkdown("1. ", "");

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold mb-1.5 block text-slate-700 flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          {helperText && (
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
              <div className="absolute left-6 top-0 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                <p className="font-semibold mb-1">Markdown hỗ trợ:</p>
                <ul className="space-y-1 text-slate-300">
                  <li><code>**text**</code> - In đậm</li>
                  <li><code>*text*</code> - In nghiêng</li>
                  <li><code>## Header</code> - Tiêu đề</li>
                  <li><code>- item</code> - Bullet list</li>
                  <li><code>1. item</code> - Numbered list</li>
                </ul>
              </div>
            </div>
          )}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-t-lg border-b-0">
        <button
          type="button"
          onClick={insertBold}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertItalic}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertHeader}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
          title="Tiêu đề (H2)"
        >
          <Type className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={insertBullet}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
          title="Bullet list"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertNumbered}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-medium ${
            showPreview
              ? "bg-blue-100 text-blue-700"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title={showPreview ? "Ẩn preview" : "Xem preview"}
        >
          {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showPreview ? "Xem Markdown" : "Xem Preview"}
        </button>
      </div>

      {/* Textarea or Preview */}
      <div className="relative">
        {!showPreview ? (
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={6}
            className="w-full px-4 py-3 border border-slate-300 rounded-b-lg text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2463eb] focus:border-[#2463eb] transition-colors resize-y min-h-[120px]"
          />
        ) : (
          <div className="w-full px-4 py-3 border border-slate-300 border-t-0 rounded-b-lg bg-white min-h-[120px] max-h-[300px] overflow-y-auto">
            <div className="prose prose-sm prose-slate max-w-none">
              {/* Simple preview without full component to avoid circular dependency */}
              <div dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(value) }} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-slate-400">
        Phím tắt: Ctrl+B (đậm), Ctrl+I (nghiêng), Enter (xuống dòng)
      </div>
    </div>
  );
}

/**
 * Simple markdown renderer for preview (client-side only)
 */
function renderSimpleMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic *text*
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    // Headers ## Text
    .replace(/^## (.+)$/gm, "<h3 class='text-sm font-bold text-slate-700 mt-2 mb-1'>$1</h3>")
    // Headers # Text
    .replace(/^# (.+)$/gm, "<h2 class='text-base font-bold text-slate-800 mt-2 mb-1'>$1</h2>")
    // Bullet lists - item
    .replace(/^- (.+)$/gm, "<li class='ml-4'>$1</li>")
    // Numbered lists 1. item
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-4'>$1</li>")
    // Line breaks
    .replace(/\n/g, "<br />");

  return html;
}
