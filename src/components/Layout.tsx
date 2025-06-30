import React from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Sidebar } from './Sidebar'
import { Menubar } from './Menubar' // Added Menubar import
import { ChatInterface } from './ChatInterface'
import { LibraryView } from './LibraryView'
import { ExploreView } from './ExploreView'
import { SettingsView } from './SettingsView'
import MedicalToolsView from './MedicalToolsView'

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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Menubar /> {/* Added Menubar component */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            'bg-sidebar text-sidebar-foreground border-r border-sidebar-border', // Added sidebar bg and border
            sidebarOpen ? 'w-64 md:w-72' : 'w-0', // Adjusted widths
            'hidden md:block' // Hide sidebar on mobile, Menubar handles mobile nav
          )}
        >
          {sidebarOpen && <Sidebar />} {/* Conditionally render Sidebar content */}
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto"> {/* Added overflow-y-auto */}
          {renderCurrentView()}
        </main>
      </div>
    </div>
  )
}

