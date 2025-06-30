import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore, type Message } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Bot, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  MoreHorizontal,
  Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { currentChatId, updateMessage } = useAppStore()
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const reactions = message.reactions || []

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const handleReaction = (reaction: string) => {
    if (!currentChatId) return

    const newReactions = reactions.includes(reaction)
      ? reactions.filter(r => r !== reaction)
      : [...reactions, reaction]

    updateMessage(currentChatId, message.id, { reactions: newReactions })
  }

  return (
    <div className={cn(
      'flex items-start space-x-3 group',
      isUser && 'flex-row-reverse space-x-reverse'
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-user-message' : 'bg-ai-message'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[80%]',
        isUser && 'flex flex-col items-end'
      )}>
        {/* Message Bubble */}
        <div className={cn(
          'rounded-lg p-4 shadow-sm',
          isUser 
            ? 'message-user ml-auto' 
            : 'message-ai mr-auto'
        )}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom components for better medical formatting
                  h1: ({ children }) => <h1 className="text-lg font-semibold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => (
                    <code className="bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-700 p-3 rounded-md overflow-x-auto text-xs font-mono mb-2">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic mb-2">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-2">
                      <table className="min-w-full border border-gray-600 text-xs">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-600 px-2 py-1 bg-gray-700 font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-600 px-2 py-1">
                      {children}
                    </td>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={cn(
          'flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser && 'flex-row-reverse space-x-reverse'
        )}>
          <div className="text-xs text-muted-foreground">
            {format(message.timestamp, 'HH:mm')}
          </div>

          {!isUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('👍')}
                className={cn(
                  'p-1 h-auto text-muted-foreground hover:text-foreground',
                  reactions.includes('👍') && 'text-green-500'
                )}
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('👎')}
                className={cn(
                  'p-1 h-auto text-muted-foreground hover:text-foreground',
                  reactions.includes('👎') && 'text-red-500'
                )}
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="p-1 h-auto text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isUser ? 'end' : 'start'} className="w-32">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-3 h-3 mr-2" />
                Copy
              </DropdownMenuItem>
              {!isUser && (
                <>
                  <DropdownMenuItem onClick={() => handleReaction('👍')}>
                    <ThumbsUp className="w-3 h-3 mr-2" />
                    Like
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReaction('👎')}>
                    <ThumbsDown className="w-3 h-3 mr-2" />
                    Dislike
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reactions Display */}
        {reactions.length > 0 && (
          <div className={cn(
            'flex items-center space-x-1 mt-1',
            isUser && 'justify-end'
          )}>
            {reactions.map((reaction, index) => (
              <span key={index} className="text-xs">
                {reaction}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

