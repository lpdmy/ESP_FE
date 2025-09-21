"use client";

import { useState } from 'react';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { X } from 'lucide-react';

const EmojiPicker = ({ isOpen, onClose, onEmojiSelect, inline = false }) => {
  // 1. State declarations
  const [activeCategory, setActiveCategory] = useState("Cảm xúc");

  const emojiCategories = {
    "Cảm xúc": [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
    ],
    "Hoạt động": [
      "👍",
      "👎",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👏",
      "🙌",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💪",
      "🦾",
      "🦿",
      "🦵",
    ],
    "Học tập": [
      "📚",
      "📖",
      "📝",
      "✏️",
      "🖊️",
      "🖋️",
      "🖌️",
      "📄",
      "📃",
      "📑",
      "📊",
      "📈",
      "📉",
      "🗒️",
      "🗓️",
      "📅",
      "📆",
      "🗑️",
      "📇",
      "🗃️",
      "🗳️",
      "🗄️",
      "📋",
      "📌",
      "📍",
      "📎",
      "🖇️",
      "📐",
      "📐",
      "📐",
    ],
    "Thể thao": [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🪃",
      "🥅",
      "⛳",
      "🪁",
      "🏹",
      "🎣",
      "🤿",
      "🥊",
      "🥋",
      "🎽",
      "🛹",
      "🛷",
      "⛸️",
    ],
    "Nghệ thuật": [
      "🎨",
      "🖼️",
      "🎭",
      "🎪",
      "🎨",
      "🖌️",
      "🖍️",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎵",
      "🎶",
      "🎹",
      "🥁",
      "🎷",
      "🎺",
      "🎸",
      "🪕",
      "🎻",
      "🎲",
      "♠️",
      "♥️",
      "♦️",
      "♣️",
      "♟️",
      "🃏",
      "🀄",
      "🎴",
      "🎯",
    ],
    "Khác": [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
    ],
  };

  if (!isOpen) return null;

  if (inline) {
    return (
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-1">
          {Object.keys(emojiCategories).map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap text-xs ${
                activeCategory === category
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                  : "text-gray-600 hover:bg-orange-100"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories[activeCategory].map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-orange-100 transition-all duration-200 hover:scale-110"
                onClick={() => onEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 6. Render
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Emoji Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <Card className="bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl max-h-80 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Chọn biểu cảm</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 px-2">
            {Object.keys(emojiCategories).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap mx-1 my-2 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                    : "text-gray-600 hover:bg-orange-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="p-4 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {emojiCategories[activeCategory].map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-xl hover:bg-orange-50 transition-all duration-200 hover:scale-110"
                  onClick={() => {
                    onEmojiSelect(emoji);
                    onClose();
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default EmojiPicker;
