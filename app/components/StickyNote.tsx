'use client';

interface StickyNoteProps {
  id: string;
  content: string;
  x: number;
  y: number;
  author: string;
  color: string;
}

export default function StickyNote({ 
  content, 
  x, 
  y, 
  author, 
  color 
}: StickyNoteProps) {
  const colorClasses = {
    yellow: 'bg-yellow-300 border-yellow-400 shadow-yellow-200/50',
    pink: 'bg-pink-300 border-pink-400 shadow-pink-200/50',
    blue: 'bg-blue-300 border-blue-400 shadow-blue-200/50',
    green: 'bg-green-300 border-green-400 shadow-green-200/50',
    purple: 'bg-purple-300 border-purple-400 shadow-purple-200/50'
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      className={`absolute ${colorClasses[color as keyof typeof colorClasses]} p-4 rounded-xl shadow-xl border-2 select-none transform hover:scale-105 transition-transform duration-200 backdrop-blur-sm`}
      style={{ 
        left: x, 
        top: y,
        width: getTextWidth(content),
        minHeight: getTextHeight(content),
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div className="text-sm text-gray-800 whitespace-pre-wrap mb-3 font-medium leading-relaxed">
        {content}
      </div>
      <div className="text-xs text-gray-600 font-mono bg-black/5 px-2 py-1 rounded-md">
        by {truncateAddress(author)}
      </div>
    </div>
  );
}