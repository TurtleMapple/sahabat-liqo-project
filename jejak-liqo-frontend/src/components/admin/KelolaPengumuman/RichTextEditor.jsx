import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '../../../contexts/ThemeContext';

const RichTextEditor = ({ value, onChange, placeholder = "Tulis konten pengumuman di sini...", error }) => {
  const { isDark } = useTheme();

  return (
    <div className={`rich-text-editor ${error ? 'error' : ''}`} data-color-mode={isDark ? 'dark' : 'light'}>
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        hideToolbar={false}
        textareaProps={{
          placeholder: placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: 'inherit'
          }
        }}
        height={200}
        data-color-mode={isDark ? 'dark' : 'light'}
      />
      <style>{`
        .rich-text-editor .w-md-editor {
          background-color: ${isDark ? '#374151' : '#ffffff'};
          border: 1px solid ${error ? '#EF4444' : (isDark ? '#4B5563' : '#D1D5DB')};
          border-radius: 8px;
        }
        
        .rich-text-editor .w-md-editor-text-container {
          background-color: ${isDark ? '#374151' : '#ffffff'};
        }
        
        .rich-text-editor .w-md-editor-text {
          background-color: ${isDark ? '#374151' : '#ffffff'} !important;
          color: ${isDark ? '#ffffff' : '#000000'} !important;
        }
        
        .rich-text-editor .w-md-editor-text::placeholder {
          color: ${isDark ? '#9CA3AF' : '#6B7280'} !important;
        }
        
        .rich-text-editor .w-md-editor-toolbar {
          background-color: ${isDark ? '#4B5563' : '#F9FAFB'};
          border-bottom: 1px solid ${isDark ? '#4B5563' : '#D1D5DB'};
        }
        
        .rich-text-editor .w-md-editor-toolbar button {
          color: ${isDark ? '#D1D5DB' : '#374151'};
        }
        
        .rich-text-editor .w-md-editor-toolbar button:hover {
          background-color: ${isDark ? '#6B7280' : '#E5E7EB'};
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;