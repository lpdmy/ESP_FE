import React, { useState } from 'react';

const MarkdownEditor = ({ value, onChange, placeholder = "Nhập nội dung..." }) => {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('markdown-editor');
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

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/### (.*$)/gm, '<h3>$1</h3>') // H3
      .replace(/## (.*$)/gm, '<h2>$1</h2>') // H2
      .replace(/# (.*$)/gm, '<h1>$1</h1>') // H1
      .replace(/\n/g, '<br>'); // Line breaks
  };

  return (
    <div className="markdown-editor">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('**', '**')}
            title="In đậm"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('*', '*')}
            title="In nghiêng"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('# ', '')}
            title="Tiêu đề lớn"
          >
            H1
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('## ', '')}
            title="Tiêu đề vừa"
          >
            H2
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertMarkdown('### ', '')}
            title="Tiêu đề nhỏ"
          >
            H3
          </button>
        </div>
        
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
            title="Xem trước"
          >
            👁️
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="editor-container">
        {!showPreview ? (
          <textarea
            id="markdown-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="editor-textarea"
          />
        ) : (
          <div 
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        )}
      </div>

      {/* Help text */}
      <div className="help-text">
        <strong>Hướng dẫn:</strong> **text** = in đậm, *text* = in nghiêng, # text = tiêu đề lớn, ## text = tiêu đề vừa, ### text = tiêu đề nhỏ
      </div>

      <style jsx>{`
        .markdown-editor {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          transition: all 0.2s;
        }

        .toolbar-btn:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        .toolbar-btn.active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .editor-container {
          min-height: 120px;
        }

        .editor-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: none;
          outline: none;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          font-family: inherit;
          resize: vertical;
        }

        .preview-content {
          padding: 12px;
          min-height: 120px;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
        }

        .preview-content h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 16px 0 8px 0;
          color: #1f2937;
        }

        .preview-content h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 14px 0 6px 0;
          color: #1f2937;
        }

        .preview-content h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 12px 0 4px 0;
          color: #1f2937;
        }

        .preview-content strong {
          font-weight: bold;
        }

        .preview-content em {
          font-style: italic;
        }

        .help-text {
          padding: 8px 12px;
          background-color: #f0f9ff;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
