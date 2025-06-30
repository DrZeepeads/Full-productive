import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Download, 
  Trash2,
  LogOut,
  Menu,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export function SettingsView() {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    user, 
    setUser, 
    setAuthenticated,
    loadChats 
  } = useAppStore()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setAuthenticated(true)
        await loadChats()
      }
    }
    
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          setAuthenticated(true)
          await loadChats()
          toast.success('Successfully signed in!')
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setAuthenticated(false)
          toast.success('Successfully signed out!')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setAuthenticated, loadChats])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error
      
      toast.success('Check your email for verification link!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  if (!user) {
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
              <h1 className="text-xl font-semibold">Authentication</h1>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? 'Join Nelson-GPT to access personalized medical assistance'
                  : 'Welcome back to Nelson-GPT medical assistant'
                }
              </p>
            </div>

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-medical"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-medical"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-medical pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-medical"
                disabled={loading}
              >
                {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              By using Nelson-GPT, you agree to our terms of service and privacy policy. 
              This is a medical assistance tool and should not replace professional medical advice.
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          {/* Profile Section */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={user.email || ''}
                  disabled
                  className="input-medical"
                />
              </div>
              
              <div>
                <Label>Full Name</Label>
                <Input
                  value={user.user_metadata?.full_name || ''}
                  disabled
                  className="input-medical"
                />
              </div>
              
              <div>
                <Label>Member Since</Label>
                <Input
                  value={new Date(user.created_at).toLocaleDateString()}
                  disabled
                  className="input-medical"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Data Encryption</h3>
                  <p className="text-sm text-muted-foreground">
                    All conversations are encrypted and stored securely
                  </p>
                </div>
                <div className="text-green-500 text-sm font-medium">Enabled</div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">HIPAA Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    Medical data handling follows HIPAA guidelines
                  </p>
                </div>
                <div className="text-green-500 text-sm font-medium">Compliant</div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Medical dark theme optimized for healthcare professionals
                  </p>
                </div>
                <div className="text-sm font-medium">Dark</div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Language</h3>
                  <p className="text-sm text-muted-foreground">
                    Interface and response language
                  </p>
                </div>
                <div className="text-sm font-medium">English</div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Data Management</h2>
            </div>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Conversation History
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Data
              </Button>
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-card p-6 rounded-lg border">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* App Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Nelson-GPT Medical Assistant v1.0.0</p>
            <p>Built with medical expertise and AI technology</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

