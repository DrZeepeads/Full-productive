import React from 'react'
import { useAppStore, AppState } from '@/lib/store' // Added AppState import
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageSquare, BookOpen, Compass, Settings, Stethoscope, Menu, X } from 'lucide-react'

export function Menubar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen } = useAppStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navigationItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, view: 'chat' as const },
    { id: 'medical-tools', label: 'Medical Tools', icon: Stethoscope, view: 'medical-tools' as const },
    { id: 'library', label: 'Library', icon: BookOpen, view: 'library' as const },
    { id: 'explore', label: 'Explore GPTs', icon: Compass, view: 'explore' as const },
    { id: 'settings', label: 'Settings', icon: Settings, view: 'settings' as const },
  ]

  const handleNavigation = (view: AppState['currentView']) => {
    setCurrentView(view)
    setIsMobileMenuOpen(false) // Close mobile menu on navigation
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Sidebar Toggle for Desktop */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 hidden md:flex text-foreground hover:bg-accent"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-7 h-7 text-primary" />
              <span className="font-semibold text-xl text-foreground">Nelson-GPT</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavigation(item.view)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground',
                    currentView === item.view && 'bg-accent text-accent-foreground'
                  )}
                  aria-current={currentView === item.view ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:bg-accent"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavigation(item.view)}
                  className={cn(
                    'w-full justify-start px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground',
                    currentView === item.view && 'bg-accent text-accent-foreground'
                  )}
                  aria-current={currentView === item.view ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

// Using the AppState['currentView'] type directly from the store
// No local AppState interface needed if the store's AppState is comprehensive
// and its types are exported or accessible.
// For handleNavigation's view parameter, we can use useAppStore.getState()['currentView'] type,
// but it's better if AppState['currentView'] is directly usable.
// Assuming AppState is implicitly available or its relevant parts are through useAppStore.
