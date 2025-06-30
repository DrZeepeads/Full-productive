import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  BookOpen, 
  Compass, 
  Settings, 
  Plus, 
  Stethoscope,
  // ChevronLeft, // Removed as the toggle button is now in Menubar
  MoreHorizontal,
  Trash2,
  Edit3,
  Archive
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    currentView,
    setCurrentView,
    chats,
    currentChatId,
    setCurrentChat,
    createNewChat,
    deleteChat,
    updateChat
    // user // Removed user from store destructuring
  } = useAppStore()

  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleNewChat = async () => {
    try {
      await createNewChat()
      setCurrentView('chat')
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleEditChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId)
    setEditTitle(currentTitle)
  }

  const handleSaveEdit = async (chatId: string) => {
    if (editTitle.trim()) {
      updateChat(chatId, { title: editTitle.trim() })
    }
    setEditingChatId(null)
    setEditTitle('')
  }

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId)
  }

  const handleArchiveChat = (chatId: string) => {
    updateChat(chatId, { isArchived: true })
  }

  const navigationItems = [
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      view: 'chat' as const
    },
    {
      id: 'medical-tools',
      label: 'Medical Tools',
      icon: Stethoscope,
      view: 'medical-tools' as const
    },
    {
      id: 'library',
      label: 'Library',
      icon: BookOpen,
      view: 'library' as const
    },
    {
      id: 'explore',
      label: 'Explore GPTs',
      icon: Compass,
      view: 'explore' as const
    }
  ]

  // The parent component (Layout) now controls the visibility and width of the sidebar container.
  // This component will always render its content as if it's visible.
  // The toggle button for the sidebar is now in the Menubar for desktop.
  // The concept of a "closed" sidebar rendering nothing, or a button to open it from here, is removed.

  return (
    <div className="h-full flex flex-col"> {/* Removed bg and border, handled by container in Layout */}
      {/* Header - Simplified, as the main app header/logo is in Menubar */}
      <div className="p-4 border-b border-sidebar-border">
        {/* Title can remain or be removed if redundant with Menubar */}
        {/* <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">Nelson-GPT</span>
          </div>
        </div> */}

        {/* New Chat Button */}
        <Button
          onClick={handleNewChat}
          className="w-full btn-medical flex items-center space-x-2"
          // disabled={!user} // Removed disabled attribute
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Navigation */}
      <div className="px-4 py-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setCurrentView(item.view)}
                className={cn(
                  'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent',
                  currentView === item.view && 'bg-sidebar-accent'
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-4 py-2">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-sidebar-foreground/70">Recent Chats</h3>
        </div>
        
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {chats
              .filter(chat => !chat.isArchived)
              .slice(0, 20)
              .map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-sidebar-accent transition-colors',
                    currentChatId === chat.id && 'bg-sidebar-accent'
                  )}
                  onClick={() => {
                    setCurrentChat(chat.id)
                    setCurrentView('chat')
                  }}
                >
                  <MessageSquare className="w-4 h-4 text-sidebar-foreground/70 flex-shrink-0" />
                  
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(chat.id)
                        } else if (e.key === 'Escape') {
                          setEditingChatId(null)
                          setEditTitle('')
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-sidebar-foreground"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sidebar-foreground truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-sidebar-foreground/50">
                        {format(chat.updatedAt, 'MMM d')}
                      </p>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-sidebar-foreground/70 hover:text-sidebar-foreground"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditChat(chat.id, chat.title)
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchiveChat(chat.id)
                        }}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChat(chat.id)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('settings')}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        
        {/* {user && ( // Removed user email display
          <div className="mt-2 p-2 rounded-md bg-sidebar-accent">
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user.email}
            </p>
          </div>
        )} */}
      </div>
    </div>
  )
}

