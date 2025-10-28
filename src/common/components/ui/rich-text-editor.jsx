import React, { useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Nhập nội dung..." }) => {
  const editorRef = useRef(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    onChange(editorRef.current.innerHTML);
  };

  const insertHeading = (level) => {
    execCommand('formatBlock', level);
  };

  const insertDivider = () => {
    execCommand('insertHTML', '<hr>');
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e) => {
    // Prevent default behavior for formatting shortcuts
    if (e.ctrlKey) {
      if (e.key === 'b' || e.key === 'B') { 
        e.preventDefault(); 
        execCommand('bold'); 
      }
      else if (e.key === 'i' || e.key === 'I') { 
        e.preventDefault(); 
        execCommand('italic'); 
      }
      else if (e.key === 'u' || e.key === 'U') { 
        e.preventDefault(); 
        execCommand('underline'); 
      }
    }
  };

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('bold')}
            title="In đậm (Ctrl+B)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('italic')}
            title="In nghiêng (Ctrl+I)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="4" x2="10" y2="20"/>
              <line x1="5" y1="4" x2="14" y2="20"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('underline')}
            title="Gạch chân (Ctrl+U)"
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
            onClick={() => insertHeading('h1')}
            title="Tiêu đề lớn"
          >
            <span className="heading-text">H1</span>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading('h2')}
            title="Tiêu đề vừa"
          >
            <span className="heading-text">H2</span>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading('h3')}
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
            onClick={insertDivider}
            title="Đường kẻ ngang"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        .rich-text-editor {
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

        .editor-content {
          min-height: 300px;
          padding: 16px;
          outline: none;
          font-size: 14px;
          line-height: 1.6;
          color: #202124;
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9aa0a6;
          pointer-events: none;
        }

        .editor-content:focus {
          outline: none;
        }

        .editor-content h1 {
          font-size: 24px;
          font-weight: 400;
          margin: 16px 0 8px 0;
          color: #202124;
          line-height: 1.2;
        }

        .editor-content h2 {
          font-size: 20px;
          font-weight: 400;
          margin: 14px 0 6px 0;
          color: #202124;
          line-height: 1.3;
        }

        .editor-content h3 {
          font-size: 16px;
          font-weight: 400;
          margin: 12px 0 4px 0;
          color: #202124;
          line-height: 1.4;
        }

        .editor-content strong {
          font-weight: 700;
        }

        .editor-content em {
          font-style: italic;
        }

        .editor-content u {
          text-decoration: underline;
        }

        .editor-content hr {
          border: none;
          border-top: 1px solid #dadce0;
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;