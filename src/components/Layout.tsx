import React from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Sidebar } from './Sidebar'
import { ChatInterface } from './ChatInterface'
import { LibraryView } from './LibraryView'
import { ExploreView } from './ExploreView'
import { SettingsView } from './SettingsView'
import { MedicalToolsView } from './MedicalToolsView'

export function Layout() {
  const { currentView, sidebarOpen } = useAppStore()

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface />
      case 'library':
        return <LibraryView />
      case 'explore':
        return <ExploreView />
      case 'settings':
        return <SettingsView />
      case 'medical-tools':
        return <MedicalToolsView />
      default:
        return <ChatInterface />
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-0'
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {renderCurrentView()}
      </div>
    </div>
  )
}

