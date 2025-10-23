import React, { useState, useRef } from 'react';

const SimpleTextEditor = ({ value, onChange, placeholder = "Nhập nội dung..." }) => {
  const textareaRef = useRef(null);

  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.substring(0, start) + text + value.substring(end);
    
    onChange(newText);
    
    // Move cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const insertHeading = (level) => {
    const headingText = prompt(`Nhập tiêu đề ${level}:`);
    if (headingText) {
      const headingMarkdown = `${'#'.repeat(level)} ${headingText}\n\n`;
      insertAtCursor(headingMarkdown);
    }
  };

  const insertList = (type) => {
    const listText = prompt(`Nhập danh sách (mỗi mục một dòng):`);
    if (listText) {
      const items = listText.split('\n').filter(item => item.trim());
      const listMarkdown = items.map(item => 
        type === 'ordered' ? `1. ${item.trim()}` : `- ${item.trim()}`
      ).join('\n') + '\n\n';
      insertAtCursor(listMarkdown);
    }
  };

  return (
    <div className="simple-text-editor">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('**', '**')}
            title="In đậm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('*', '*')}
            title="In nghiêng"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="4" x2="10" y2="20"/>
              <line x1="5" y1="4" x2="14" y2="20"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('__', '__')}
            title="Gạch chân"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
              <line x1="4" y1="21" x2="20" y2="21"/>
            </svg>
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading(1)}
            title="Tiêu đề lớn"
          >
            <span className="heading-text">H1</span>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading(2)}
            title="Tiêu đề vừa"
          >
            <span className="heading-text">H2</span>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading(3)}
            title="Tiêu đề nhỏ"
          >
            <span className="heading-text">H3</span>
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertList('unordered')}
            title="Danh sách không thứ tự"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertList('ordered')}
            title="Danh sách có thứ tự"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="10" y1="6" x2="21" y2="6"/>
              <line x1="10" y1="12" x2="21" y2="12"/>
              <line x1="10" y1="18" x2="21" y2="18"/>
              <path d="M4 6h1v4"/>
              <path d="M4 10h2"/>
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
            </svg>
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertAtCursor('\n---\n')}
            title="Đường kẻ ngang"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertAtCursor('> ')}
            title="Trích dẫn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1 0 1-1 2-2 2z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1 0 1-1 2-2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="editor-textarea"
        rows={8}
      />

      {/* Preview */}
      <div className="preview-section">
        <div className="preview-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Xem trước</span>
        </div>
        <div 
          className="preview-content"
          dangerouslySetInnerHTML={{ 
            __html: value
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/__(.*?)__/g, '<u>$1</u>')
              .replace(/### (.*$)/gm, '<h3>$1</h3>')
              .replace(/## (.*$)/gm, '<h2>$1</h2>')
              .replace(/# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^- (.*$)/gm, '<li>$1</li>')
              .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
              .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
              .replace(/^---$/gm, '<hr>')
              .replace(/\n/g, '<br>')
          }}
        />
      </div>

      <style jsx>{`
        .simple-text-editor {
          border: 1px solid #dadce0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dadce0;
          flex-wrap: wrap;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .toolbar-separator {
          width: 1px;
          height: 24px;
          background-color: #dadce0;
          margin: 0 4px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: #5f6368;
          transition: all 0.2s;
        }

        .toolbar-btn:hover {
          background-color: #e8eaed;
          color: #202124;
        }

        .toolbar-btn:active {
          background-color: #dadce0;
        }

        .heading-text {
          font-weight: bold;
          font-size: 12px;
        }

        .editor-textarea {
          width: 100%;
          min-height: 200px;
          padding: 16px;
          border: none;
          outline: none;
          font-size: 14px;
          line-height: 1.6;
          color: #202124;
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          resize: vertical;
          background: white;
        }

        .editor-textarea::placeholder {
          color: #9aa0a6;
        }

        .editor-textarea:focus {
          outline: none;
        }

        .preview-section {
          border-top: 1px solid #dadce0;
          background-color: #f8f9fa;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background-color: #f1f3f4;
          border-bottom: 1px solid #dadce0;
          color: #5f6368;
          font-size: 13px;
          font-weight: 500;
        }

        .preview-content {
          padding: 16px;
          min-height: 100px;
          font-size: 14px;
          line-height: 1.6;
          color: #202124;
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .preview-content h1 {
          font-size: 24px;
          font-weight: 400;
          margin: 16px 0 8px 0;
          color: #202124;
          line-height: 1.2;
        }

        .preview-content h2 {
          font-size: 20px;
          font-weight: 400;
          margin: 14px 0 6px 0;
          color: #202124;
          line-height: 1.3;
        }

        .preview-content h3 {
          font-size: 16px;
          font-weight: 400;
          margin: 12px 0 4px 0;
          color: #202124;
          line-height: 1.4;
        }

        .preview-content strong {
          font-weight: 700;
        }

        .preview-content em {
          font-style: italic;
        }

        .preview-content u {
          text-decoration: underline;
        }

        .preview-content li {
          margin: 4px 0;
          padding-left: 8px;
        }

        .preview-content blockquote {
          margin: 12px 0;
          padding: 12px 16px;
          background-color: #f1f3f4;
          border-left: 4px solid #1a73e8;
          font-style: italic;
          border-radius: 0 4px 4px 0;
        }

        .preview-content hr {
          border: none;
          border-top: 1px solid #dadce0;
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
};

export default SimpleTextEditor;
