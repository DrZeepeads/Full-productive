import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Menu, 
  Stethoscope, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  MoreHorizontal,
  User,
  Bot
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { format } from 'date-fns'

export function ChatInterface() {
  const {
    sidebarOpen,
    setSidebarOpen,
    currentChatId,
    chats,
    sendMessage,
    isStreaming,
    user,
    createNewChat,
    setCurrentView
  } = useAppStore()

  const [input, setInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentChat = chats.find(chat => chat.id === currentChatId)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [currentChat?.messages, isStreaming])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const message = input.trim()
    setInput('')

    // Create new chat if none exists
    if (!currentChatId) {
      await createNewChat('New Medical Consultation')
    }

    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Welcome to Nelson-GPT</h2>
          <p className="text-muted-foreground mb-6">
            Your AI-powered pediatric healthcare assistant. Please sign in to start a consultation.
          </p>
          <Button 
            onClick={() => setCurrentView('settings')}
            className="btn-medical"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-foreground hover:bg-accent"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">
              {currentChat?.title || 'Nelson-GPT Medical Assistant'}
            </h1>
          </div>
        </div>

        {currentChat && (
          <div className="text-sm text-muted-foreground">
            {format(currentChat.updatedAt, 'MMM d, yyyy')}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="max-w-md">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a Medical Consultation</h3>
              <p className="text-muted-foreground mb-6">
                Ask me about pediatric conditions, treatments, drug dosages, growth patterns, 
                or any other medical questions. I'm here to assist with evidence-based information.
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="p-3 bg-card rounded-lg border text-left">
                  <p className="font-medium mb-1">Example questions:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• "What's the recommended acetaminophen dose for a 2-year-old?"</li>
                    <li>• "How do I evaluate fever in a 6-month-old infant?"</li>
                    <li>• "What are the signs of asthma exacerbation in children?"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {currentChat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isStreaming && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-ai-message flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="Ask about pediatric conditions, treatments, or medical guidance..."
              className="input-medical resize-none pr-12 min-h-[44px] max-h-[200px]"
              disabled={isStreaming}
            />
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              size="sm"
              className="absolute right-2 bottom-2 btn-medical p-2 h-8 w-8"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Nelson-GPT can make mistakes. Please verify important medical information with healthcare professionals.
          </div>
        </div>
      </div>
    </div>
  )
}

