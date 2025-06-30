import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'
// import type { User } from '@supabase/supabase-js' // Removed User import

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  reactions?: string[]
  metadata?: Record<string, any>
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
}

export interface MedicalTool {
  id: string
  name: string
  description: string
  icon: string
  category: 'calculator' | 'chart' | 'reference'
}

export interface AppState { // Added export
  // Authentication
  // user: User | null // Removed user state
  // isAuthenticated: boolean // Removed isAuthenticated state
  
  // Chat state
  chats: Chat[]
  currentChatId: string | null
  isLoading: boolean
  isStreaming: boolean
  
  // UI state
  sidebarOpen: boolean
  currentView: 'chat' | 'library' | 'explore' | 'settings' | 'medical-tools'
  theme: 'dark' | 'light'
  
  // Medical tools
  medicalTools: MedicalTool[]
  
  // Actions
  // setUser: (user: User | null) => void // Removed setUser action
  // setAuthenticated: (authenticated: boolean) => void // Removed setAuthenticated action
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: AppState['currentView']) => void
  setCurrentChat: (chatId: string | null) => void
  addChat: (chat: Chat) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  deleteChat: (chatId: string) => void
  addMessage: (chatId: string, message: Message) => void
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void
  setLoading: (loading: boolean) => void
  setStreaming: (streaming: boolean) => void
  loadChats: () => Promise<void>
  createNewChat: (title?: string) => Promise<string>
  sendMessage: (content: string) => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      // user: null, // Removed initial user state
      // isAuthenticated: false, // Removed initial isAuthenticated state
      chats: [],
      currentChatId: null,
      isLoading: false,
      isStreaming: false,
      sidebarOpen: true,
      currentView: 'chat',
      theme: 'dark',
      medicalTools: [
        {
          id: 'growth-chart',
          name: 'Growth Charts',
          description: 'Track and analyze pediatric growth patterns',
          icon: 'TrendingUp',
          category: 'chart'
        },
        {
          id: 'drug-calculator',
          name: 'Drug Calculator',
          description: 'Calculate pediatric medication dosages',
          icon: 'Calculator',
          category: 'calculator'
        },
        // { // Removed BMI Calculator from medical tools
        //   id: 'bmi-calculator',
        //   name: 'BMI Calculator',
        //   description: 'Calculate and interpret pediatric BMI',
        //   icon: 'Activity',
        //   category: 'calculator'
        // },
        // { // Removed Immunization Schedule from medical tools
        //   id: 'immunization-schedule',
        //   name: 'Immunization Schedule',
        //   description: 'View recommended vaccination schedules',
        //   icon: 'Shield',
        //   category: 'reference'
        // }
      ],

      // Actions
      // setUser: (user) => set({ user, isAuthenticated: !!user }), // Removed setUser action
      
      // setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }), // Removed setAuthenticated action
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),
      
      addChat: (chat) => set((state) => ({ 
        chats: [chat, ...state.chats] 
      })),
      
      updateChat: (chatId, updates) => set((state) => ({
        chats: state.chats.map(chat => 
          chat.id === chatId ? { ...chat, ...updates } : chat
        )
      })),
      
      deleteChat: (chatId) => set((state) => ({
        chats: state.chats.filter(chat => chat.id !== chatId),
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId
      })),
      
      addMessage: (chatId, message) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, message], updatedAt: new Date() }
            : chat
        )
      })),
      
      updateMessage: (chatId, messageId, updates) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                )
              }
            : chat
        )
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      
      loadChats: async () => {
        // const { user } = get() // Removed user
        // if (!user) return // Removed user check

        if (!supabase) {
          console.warn('Supabase not initialized, skipping loadChats.')
          set({ chats: [], isLoading: false })
          return
        }

        try {
          set({ isLoading: true })
          
          // TODO: Decide on how to handle chats without user_id or remove chat loading if not needed
          // For now, let's assume chats are public or not tied to a specific user
          const { data: chatsData, error: chatsError } = await supabase
            .from('chats')
            .select('*')
            // .eq('user_id', user.id) // Removed user_id filter
            .order('updated_at', { ascending: false })

          if (chatsError) throw chatsError

          const chats: Chat[] = []
          
          for (const chatData of chatsData || []) {
            const { data: messagesData, error: messagesError } = await supabase
              .from('messages')
              .select('*')
              .eq('chat_id', chatData.id)
              .order('created_at', { ascending: true })

            if (messagesError) throw messagesError

            const messages: Message[] = (messagesData || []).map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.created_at),
              reactions: msg.reactions || [],
              metadata: msg.metadata
            }))

            chats.push({
              id: chatData.id,
              title: chatData.title,
              messages,
              createdAt: new Date(chatData.created_at),
              updatedAt: new Date(chatData.updated_at),
              isArchived: chatData.is_archived
            })
          }

          set({ chats })
        } catch (error) {
          console.error('Error loading chats:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      createNewChat: async (title = 'New Chat') => {
        // const { user } = get() // Removed user
        // if (!user) throw new Error('User not authenticated') // Removed user check

        if (!supabase) {
          console.warn('Supabase not initialized, cannot create new chat.')
          // Create a local-only chat if Supabase is not available
          const newChatId = crypto.randomUUID()
          const newChat: Chat = {
            id: newChatId,
            title,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isArchived: false,
          }
          get().addChat(newChat)
          set({ currentChatId: newChat.id })
          return newChat.id
        }

        try {
          // TODO: Decide on user_id for chats or make it nullable in the database
          const { data, error } = await supabase
            .from('chats')
            .insert({
              // user_id: user.id, // Removed user_id
              title,
              is_archived: false
            })
            .select()
            .single()

          if (error) throw error

          const newChat: Chat = {
            id: data.id,
            title: data.title,
            messages: [],
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            isArchived: data.is_archived
          }

          get().addChat(newChat)
          set({ currentChatId: newChat.id })
          
          return newChat.id
        } catch (error) {
          console.error('Error creating chat:', error)
          throw error
        }
      },
      
      sendMessage: async (content: string) => {
        const { currentChatId } = get() // Removed user
        if (!currentChatId) return // Removed user check

        if (!supabase) {
          console.warn('Supabase not initialized, cannot send message to backend.')
          // Add message locally only
          const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date()
          }
          get().addMessage(currentChatId, userMessage)
          // Optionally, add a local AI response or a message indicating offline mode
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: "Offline mode: Cannot connect to AI services.",
            timestamp: new Date()
          }
          get().addMessage(currentChatId, assistantMessage)
          return
        }

        try {
          // Add user message
          const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date()
          }

          get().addMessage(currentChatId, userMessage)

          // Save user message to database
          await supabase
            .from('messages')
            .insert({
              chat_id: currentChatId,
              role: 'user',
              content
            })

          // Get chat messages for context
          const currentChat = get().chats.find(chat => chat.id === currentChatId)
          const messages = currentChat?.messages || []

          // Call chat completion API
          set({ isStreaming: true })
          
          // Ensure supabase and auth are available before trying to get a session
          let accessToken = null
          if (supabase && supabase.auth) {
            const sessionResult = await supabase.auth.getSession()
            accessToken = sessionResult.data.session?.access_token
          }

          // If no access token (e.g. auth removed or Supabase not fully configured),
          // handle gracefully or skip API call that requires auth.
          // For now, we'll proceed assuming the function might not require auth or will handle it.
          // If it strictly requires auth, this call might fail.

          const response = await fetch(`${supabase.supabaseUrl}/functions/v1/chat-completion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }) // Conditionally add Auth header
            },
            body: JSON.stringify({
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              chatId: currentChatId,
              stream: true
            })
          })

          if (!response.ok) {
            throw new Error('Failed to get AI response')
          }

          // Handle streaming response
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          
          let assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '',
            timestamp: new Date()
          }
          
          get().addMessage(currentChatId, assistantMessage)

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.content) {
                      assistantMessage.content += data.content
                      get().updateMessage(currentChatId, assistantMessage.id, {
                        content: assistantMessage.content
                      })
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error sending message:', error)
        } finally {
          set({ isStreaming: false })
        }
      }
    }),
    {
      name: 'nelson-gpt-store',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        sidebarOpen: state.sidebarOpen,
        currentView: state.currentView,
        theme: state.theme
      })
    }
  )
)

