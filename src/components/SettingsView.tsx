import React from 'react'
import { useAppStore } from '@/lib/store'
// import { supabase } from '@/lib/supabase' // Removed supabase import
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input' // Removed Input import
// import { Label } from '@/components/ui/label' // Removed Label import
import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator' // Removed Separator import
import { 
  Settings, 
  // User, // Removed User import
  // Shield, // Removed Shield import
  // Bell, // Removed Bell import
  Palette, 
  Download, 
  Trash2,
  // LogOut, // Removed LogOut import
  Menu,
  // Eye, // Removed Eye import
  // EyeOff // Removed EyeOff import
} from 'lucide-react'
// import { toast } from 'react-hot-toast' // Removed toast import

export function SettingsView() {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    // user, // Removed user from store
    // setUser, // Removed setUser from store
    // setAuthenticated, // Removed setAuthenticated from store
    // loadChats // Removed loadChats from store - will be handled differently or removed
  } = useAppStore()

  // const [isSignUp, setIsSignUp] = useState(false) // Removed state
  // const [email, setEmail] = useState('') // Removed state
  // const [password, setPassword] = useState('') // Removed state
  // const [fullName, setFullName] = useState('') // Removed state
  // const [showPassword, setShowPassword] = useState(false) // Removed state
  // const [loading, setLoading] = useState(false) // Removed state

  // useEffect(() => { // Removed useEffect for auth
  //   // Check for existing session
  //   const checkSession = async () => {
  //     const { data: { session } } = await supabase.auth.getSession()
  //     if (session?.user) {
  //       setUser(session.user)
  //       setAuthenticated(true)
  //       await loadChats()
  //     }
  //   }
    
  //   checkSession()

  //   // Listen for auth changes
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       if (event === 'SIGNED_IN' && session?.user) {
  //         setUser(session.user)
  //         setAuthenticated(true)
  //         await loadChats()
  //         toast.success('Successfully signed in!')
  //       } else if (event === 'SIGNED_OUT') {
  //         setUser(null)
  //         setAuthenticated(false)
  //         toast.success('Successfully signed out!')
  //       }
  //     }
  //   )

  //   return () => subscription.unsubscribe()
  // }, [setUser, setAuthenticated, loadChats])

  // const handleSignIn = async (e: React.FormEvent) => { ... } // Removed function
  // const handleSignUp = async (e: React.FormEvent) => { ... } // Removed function
  // const handleSignOut = async () => { ... } // Removed function

  // if (!user) { // Removed conditional rendering based on user
    // return (
    //   <div className="flex-1 flex flex-col">
    //     {/* Header */}
    //     <div className="border-b border-border p-4">
    //       <div className="flex items-center space-x-3">
    //         {!sidebarOpen && (
    //           <Button
    //             variant="ghost"
    //             size="sm"
    //             onClick={() => setSidebarOpen(true)}
    //             className="text-foreground hover:bg-accent"
    //           >
    //             <Menu className="w-4 h-4" />
    //           </Button>
    //         )}
            
    //         <div className="flex items-center space-x-2">
    //           <Settings className="w-5 h-5 text-primary" />
    //           <h1 className="text-xl font-semibold">Authentication</h1>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Auth Form ... */}
    //   </div>
    // )
  // }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
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
            <Settings className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Placeholder for future non-user-specific settings */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Current theme: Medical Dark
                  </p>
                </div>
                <Button variant="outline" disabled>Change Theme (Coming Soon)</Button>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Data Management</h2>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" disabled>
                <Download className="w-4 h-4 mr-2" />
                Export Conversation History (Coming Soon)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                disabled
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Data (Coming Soon)
              </Button>
            </div>
          </div>

          {/* App Info */}
          <div className="text-center text-sm text-muted-foreground pt-6">
            <p>Nelson-GPT Medical Assistant v1.0.0</p>
            <p>Built with medical expertise and AI technology.</p>
            <p>This tool does not require user accounts.</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

