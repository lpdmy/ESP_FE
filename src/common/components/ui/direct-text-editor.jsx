import React, { useRef } from 'react';

const DirectTextEditor = ({ value, onChange, placeholder = "Nhập nội dung..." }) => {
  const textareaRef = useRef(null);

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

  const wrapSelection = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Có text được chọn - wrap nó
      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
      onChange(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    } else {
      // Không có text được chọn - insert placeholder
      const placeholder = 'text';
      const newText = value.substring(0, start) + before + placeholder + after + value.substring(end);
      onChange(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      }, 0);
    }
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
        type === 'unordered' ? `- ${item.trim()}` : `1. ${item.trim()}`
      ).join('\n') + '\n\n';
      insertAtCursor(listMarkdown);
    }
  };

  return (
    <div className="direct-text-editor">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => wrapSelection('**', '**')}
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
            onClick={() => wrapSelection('*', '*')}
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
            onClick={() => wrapSelection('__', '__')}
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
        rows={10}
      />

      <style jsx>{`
        .direct-text-editor {
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
          min-height: 300px;
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
      `}</style>
    </div>
  );
};

export default DirectTextEditor;
