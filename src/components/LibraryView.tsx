import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Archive, 
  Download,
  ExternalLink,
  Menu
} from 'lucide-react'
import { format } from 'date-fns'

export function LibraryView() {
  const { sidebarOpen, setSidebarOpen, chats } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterArchived, setFilterArchived] = useState(false)

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = filterArchived ? chat.isArchived : !chat.isArchived
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
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
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Medical Library</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterArchived(!filterArchived)}
              className={filterArchived ? 'bg-accent' : ''}
            >
              <Archive className="w-4 h-4 mr-2" />
              {filterArchived ? 'Show Active' : 'Show Archived'}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations and medical topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-medical"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Total Conversations</h3>
              <p className="text-2xl font-semibold">{chats.filter(c => !c.isArchived).length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Archived</h3>
              <p className="text-2xl font-semibold">{chats.filter(c => c.isArchived).length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Total Messages</h3>
              <p className="text-2xl font-semibold">
                {chats.reduce((total, chat) => total + chat.messages.length, 0)}
              </p>
            </div>
          </div>

          {/* Conversation List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {filterArchived ? 'Archived Conversations' : 'Recent Conversations'}
            </h2>
            
            {filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Start a new conversation to build your medical library'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredChats.map((chat) => (
                  <div key={chat.id} className="bg-card p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">{chat.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {format(chat.updatedAt, 'MMM d, yyyy')}
                        </span>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      {chat.messages.length} messages • Last updated {format(chat.updatedAt, 'MMM d')}
                    </div>
                    
                    {/* Preview of first user message */}
                    {chat.messages.length > 0 && (
                      <div className="text-sm text-foreground/80 line-clamp-2">
                        {chat.messages.find(m => m.role === 'user')?.content || 'No user messages'}
                      </div>
                    )}
                    
                    {/* Tags/Topics (could be extracted from content) */}
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="flex flex-wrap gap-1">
                        {/* Example tags - in production, these could be auto-generated */}
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Pediatrics
                        </span>
                        {chat.messages.some(m => m.content.toLowerCase().includes('fever')) && (
                          <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">
                            Fever
                          </span>
                        )}
                        {chat.messages.some(m => m.content.toLowerCase().includes('medication') || m.content.toLowerCase().includes('drug')) && (
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">
                            Medication
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

