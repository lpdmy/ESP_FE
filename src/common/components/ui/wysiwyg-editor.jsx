import React, { useState, useRef, useEffect } from 'react';

const WysiwygEditor = ({ value, onChange, placeholder = "Nhập nội dung..." }) => {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState('14px');
  const [isComposing, setIsComposing] = useState(false);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    
    // Get current font size
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      range.surroundContents(span);
      const computedStyle = window.getComputedStyle(span);
      const currentFontSize = computedStyle.fontSize;
      setFontSize(currentFontSize);
    }
  };

  const handleInput = () => {
    if (!isComposing) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    setTimeout(() => {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }, 10);
  };

  const handleFontSizeChange = (size) => {
    execCommand('fontSize', '7'); // Use fontSize command
    // Apply custom font size
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      range.surroundContents(span);
    }
    setFontSize(size);
  };

  const insertHeading = (level) => {
    const headingText = prompt(`Nhập tiêu đề ${level}:`);
    if (headingText) {
      const headingTag = `h${level}`;
      const headingElement = document.createElement(headingTag);
      headingElement.textContent = headingText;
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(headingElement);
        range.setStartAfter(headingElement);
        range.setEndAfter(headingElement);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      handleInput();
    }
  };

  const insertList = (type) => {
    const listText = prompt(`Nhập danh sách (mỗi mục một dòng):`);
    if (listText) {
      const items = listText.split('\n').filter(item => item.trim());
      const listElement = document.createElement(type === 'ordered' ? 'ol' : 'ul');
      
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.trim();
        listElement.appendChild(li);
      });
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(listElement);
        range.setStartAfter(listElement);
        range.setEndAfter(listElement);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      handleInput();
    }
  };

  // Prevent unnecessary updates
  useEffect(() => {
    if (editorRef.current && !isComposing) {
      const currentContent = editorRef.current.innerHTML;
      if (currentContent !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, isComposing]);

  return (
    <div className="wysiwyg-editor">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${isBold ? 'active' : ''}`}
            onClick={() => execCommand('bold')}
            title="In đậm (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${isItalic ? 'active' : ''}`}
            onClick={() => execCommand('italic')}
            title="In nghiêng (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${isUnderline ? 'active' : ''}`}
            onClick={() => execCommand('underline')}
            title="Gạch chân (Ctrl+U)"
          >
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading(1)}
            title="Tiêu đề lớn"
          >
            H1
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading(2)}
            title="Tiêu đề vừa"
          >
            H2
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertHeading(3)}
            title="Tiêu đề nhỏ"
          >
            H3
          </button>
        </div>

        <div className="toolbar-group">
          <select
            className="font-size-select"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            title="Kích thước chữ"
          >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
          </select>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertList('unordered')}
            title="Danh sách không thứ tự"
          >
            • List
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertList('ordered')}
            title="Danh sách có thứ tự"
          >
            1. List
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onMouseUp={updateToolbarState}
        onKeyUp={updateToolbarState}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        .wysiwyg-editor {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 12px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
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

        .font-size-select {
          height: 32px;
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-size: 12px;
          cursor: pointer;
        }

        .font-size-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .editor-content {
          min-height: 120px;
          padding: 12px;
          outline: none;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
        }

        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        .editor-content:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .editor-content strong {
          font-weight: bold;
        }

        .editor-content em {
          font-style: italic;
        }

        .editor-content u {
          text-decoration: underline;
        }

        .editor-content h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 16px 0 8px 0;
          color: #1f2937;
        }

        .editor-content h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 14px 0 6px 0;
          color: #1f2937;
        }

        .editor-content h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 12px 0 4px 0;
          color: #1f2937;
        }

        .editor-content ul, .editor-content ol {
          margin: 8px 0;
          padding-left: 20px;
        }

        .editor-content li {
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
};

export default WysiwygEditor;
