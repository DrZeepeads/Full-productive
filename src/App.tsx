import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/Layout'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Layout />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E1E1E',
            color: '#FFFFFF',
            border: '1px solid #333333',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </div>
  )
}

export default App

