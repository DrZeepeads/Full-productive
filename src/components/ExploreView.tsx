import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Compass, 
  Search, 
  Heart, 
  Brain, 
  Stethoscope, 
  Baby, 
  Activity, 
  Pill,
  Menu,
  Star,
  Users,
  MessageSquare
} from 'lucide-react'

interface MedicalGPT {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  specialties: string[]
  rating: number
  conversations: number
  featured: boolean
}

const medicalGPTs: MedicalGPT[] = [
  {
    id: 'pediatric-cardiology',
    name: 'Pediatric Cardiology Assistant',
    description: 'Specialized in congenital heart diseases, arrhythmias, and cardiovascular conditions in children.',
    icon: Heart,
    category: 'Cardiology',
    specialties: ['Congenital Heart Disease', 'Arrhythmias', 'Heart Murmurs', 'Cardiac Surgery'],
    rating: 4.9,
    conversations: 1250,
    featured: true
  },
  {
    id: 'pediatric-neurology',
    name: 'Pediatric Neurology Expert',
    description: 'Expert in neurological disorders, developmental delays, and seizure management in children.',
    icon: Brain,
    category: 'Neurology',
    specialties: ['Epilepsy', 'Developmental Delays', 'Cerebral Palsy', 'Headaches'],
    rating: 4.8,
    conversations: 980,
    featured: true
  },
  {
    id: 'neonatal-care',
    name: 'Neonatal Care Specialist',
    description: 'Focused on newborn care, NICU management, and early infant development.',
    icon: Baby,
    category: 'Neonatology',
    specialties: ['NICU Care', 'Premature Infants', 'Birth Complications', 'Feeding Issues'],
    rating: 4.9,
    conversations: 750,
    featured: true
  },
  {
    id: 'pediatric-emergency',
    name: 'Pediatric Emergency Medicine',
    description: 'Emergency care protocols, acute conditions, and critical care for children.',
    icon: Activity,
    category: 'Emergency Medicine',
    specialties: ['Trauma', 'Poisoning', 'Respiratory Distress', 'Shock'],
    rating: 4.7,
    conversations: 1100,
    featured: false
  },
  {
    id: 'pediatric-pharmacology',
    name: 'Pediatric Pharmacology Guide',
    description: 'Drug dosing, interactions, and medication safety specifically for pediatric patients.',
    icon: Pill,
    category: 'Pharmacology',
    specialties: ['Drug Dosing', 'Interactions', 'Safety', 'Adverse Effects'],
    rating: 4.8,
    conversations: 890,
    featured: false
  },
  {
    id: 'general-pediatrics',
    name: 'General Pediatrics Assistant',
    description: 'Comprehensive pediatric care covering common conditions and routine healthcare.',
    icon: Stethoscope,
    category: 'General Pediatrics',
    specialties: ['Well-child Care', 'Common Illnesses', 'Growth & Development', 'Immunizations'],
    rating: 4.6,
    conversations: 2100,
    featured: false
  }
]

export function ExploreView() {
  const { sidebarOpen, setSidebarOpen, createNewChat, setCurrentView } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(medicalGPTs.map(gpt => gpt.category)))
  
  const filteredGPTs = medicalGPTs.filter(gpt => {
    const matchesSearch = gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gpt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gpt.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || gpt.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const featuredGPTs = filteredGPTs.filter(gpt => gpt.featured)
  const otherGPTs = filteredGPTs.filter(gpt => !gpt.featured)

  const handleStartConversation = async (gpt: MedicalGPT) => {
    try {
      const chatId = await createNewChat(`${gpt.name} Consultation`)
      setCurrentView('chat')
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

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
              <Compass className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Explore Medical GPTs</h1>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search medical specialties, conditions, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-medical"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Featured GPTs */}
          {featuredGPTs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Featured Medical Assistants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredGPTs.map((gpt) => (
                  <GPTCard key={gpt.id} gpt={gpt} onStart={handleStartConversation} featured />
                ))}
              </div>
            </div>
          )}

          {/* All GPTs */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              All Medical Assistants ({otherGPTs.length})
            </h2>
            
            {otherGPTs.length === 0 ? (
              <div className="text-center py-8">
                <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No assistants found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or category filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherGPTs.map((gpt) => (
                  <GPTCard key={gpt.id} gpt={gpt} onStart={handleStartConversation} />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

interface GPTCardProps {
  gpt: MedicalGPT
  onStart: (gpt: MedicalGPT) => void
  featured?: boolean
}

function GPTCard({ gpt, onStart, featured = false }: GPTCardProps) {
  const Icon = gpt.icon

  return (
    <div className={`bg-card p-4 rounded-lg border hover:bg-accent/50 transition-colors ${featured ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{gpt.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {gpt.category}
            </Badge>
          </div>
        </div>
        {featured && (
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {gpt.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {gpt.specialties.slice(0, 3).map((specialty) => (
          <Badge key={specialty} variant="outline" className="text-xs">
            {specialty}
          </Badge>
        ))}
        {gpt.specialties.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{gpt.specialties.length - 3} more
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-current text-yellow-500" />
            <span>{gpt.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-3 h-3" />
            <span>{gpt.conversations.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={() => onStart(gpt)}
        className="w-full btn-medical"
        size="sm"
      >
        Start Consultation
      </Button>
    </div>
  )
}

