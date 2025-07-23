'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface StickyNoteProps {
  id: string;
  content: string;
  x: number;
  y: number;
  author: string;
  color: string;
  onUpdate: (id: string, updates: { content?: string; x?: number; y?: number }) => void;
  onDelete?: (id: string) => void;
}

export default function StickyNote({ 
  id, 
  content, 
  x, 
  y, 
  author, 
  color, 
  onUpdate,
  onDelete 
}: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colorClasses = {
    yellow: 'bg-yellow-200 border-yellow-300',
    pink: 'bg-pink-200 border-pink-300',
    blue: 'bg-blue-200 border-blue-300',
    green: 'bg-green-200 border-green-300',
    purple: 'bg-purple-200 border-purple-300'
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, editContent]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    e.preventDefault();
    setIsDragging(true);
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    onUpdate(id, { x: Math.max(0, newX), y: Math.max(0, newY) });
  }, [isDragging, dragOffset.x, dragOffset.y, id, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    onUpdate(id, { content: editContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const getTextHeight = (text: string) => {
    const lines = text.split('\n').length;
    const minHeight = 80;
    const lineHeight = 20;
    return Math.max(minHeight, lines * lineHeight + 40);
  };

  const getTextWidth = (text: string) => {
    const maxLineLength = Math.max(...text.split('\n').map(line => line.length));
    const minWidth = 200;
    const charWidth = 8;
    return Math.max(minWidth, maxLineLength * charWidth + 32);
  };

  return (
    <div
      ref={noteRef}
      className={`absolute ${colorClasses[color as keyof typeof colorClasses]} p-4 rounded-lg shadow-lg border-2 cursor-move select-none group transition-transform hover:scale-105 ${isDragging ? 'z-50 scale-105' : 'z-10'}`}
      style={{ 
        left: x, 
        top: y,
        width: getTextWidth(content),
        minHeight: getTextHeight(content)
      }}
      onMouseDown={handleMouseDown}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold"
        >
          ×
        </button>
      )}
      
      {isEditing ? (
        <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm min-h-16"
            style={{ 
              height: 'auto',
              minHeight: '64px'
            }}
            autoFocus
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-sm text-gray-800 whitespace-pre-wrap mb-2 cursor-text"
          >
            {content || 'Double-click to edit...'}
          </div>
          <div className="text-xs text-gray-500">
            by {author}
          </div>
        </>
      )}
    </div>
  );
}