import React from 'react'

export function TypingIndicator() {
  return (
    <div className="message-ai rounded-lg p-4 shadow-sm max-w-fit">
      <div className="typing-indicator">
        <div 
          className="typing-dot" 
          style={{ '--delay': '0ms' } as React.CSSProperties}
        />
        <div 
          className="typing-dot" 
          style={{ '--delay': '150ms' } as React.CSSProperties}
        />
        <div 
          className="typing-dot" 
          style={{ '--delay': '300ms' } as React.CSSProperties}
        />
      </div>
    </div>
  )
}

