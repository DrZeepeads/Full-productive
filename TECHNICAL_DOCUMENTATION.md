# Nelson-GPT Technical Documentation

## Architecture Overview

Nelson-GPT is a modern Progressive Web Application built with React, TypeScript, and Vite, featuring a comprehensive backend powered by Supabase and AI capabilities through Mistral AI. The application implements a Retrieval-Augmented Generation (RAG) pipeline for medical knowledge retrieval and provides specialized medical tools for pediatric healthcare.

## System Architecture

### Frontend Architecture

#### Component Structure
```
src/
├── components/
│   ├── Layout.tsx              # Main application layout
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── ChatInterface.tsx       # Main chat interface
│   ├── MessageBubble.tsx       # Individual message component
│   ├── TypingIndicator.tsx     # AI typing animation
│   ├── LibraryView.tsx         # Conversation history
│   ├── ExploreView.tsx         # Medical GPT specializations
│   ├── SettingsView.tsx        # User settings and auth
│   ├── MedicalToolsView.tsx    # Medical calculation tools
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── supabase.ts            # Supabase client configuration
│   ├── store.ts               # Zustand state management
│   └── utils.ts               # Utility functions
└── types/
    └── index.ts               # TypeScript type definitions
```

#### State Management
The application uses Zustand for state management with the following store structure:

```typescript
interface AppStore {
  // Authentication
  user: User | null
  authenticated: boolean
  
  // UI State
  sidebarOpen: boolean
  currentView: 'chat' | 'library' | 'explore' | 'settings' | 'medical-tools'
  
  // Chat State
  chats: Chat[]
  currentChatId: string | null
  messages: Message[]
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  createNewChat: (title?: string) => Promise<string>
  sendMessage: (content: string) => Promise<void>
  loadChats: () => Promise<void>
  // ... other actions
}
```

### Backend Architecture

#### Supabase Configuration
The backend leverages Supabase's comprehensive platform:

1. **PostgreSQL Database** with pgvector extension for vector similarity search
2. **Authentication** with Row Level Security (RLS) policies
3. **Edge Functions** for serverless API endpoints
4. **Real-time subscriptions** for live updates

#### Database Schema

```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge base with vector embeddings
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  chapter TEXT,
  section TEXT,
  embedding VECTOR(1024), -- Mistral embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.source,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### Edge Functions

##### Chat Completion Function
```typescript
// supabase/functions/chat-completion/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { message, chatId, useRAG = true } = await req.json()
  
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Get user from JWT
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token)
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  let context = ''
  
  if (useRAG) {
    // Generate embedding for the user message
    const embeddingResponse = await fetch('https://api.mistral.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-embed',
        input: [message],
      }),
    })
    
    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding
    
    // Search for relevant knowledge
    const { data: knowledgeResults } = await supabase
      .rpc('match_knowledge_base', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 3
      })
    
    if (knowledgeResults && knowledgeResults.length > 0) {
      context = knowledgeResults
        .map(result => `${result.title}: ${result.content}`)
        .join('\n\n')
    }
  }
  
  // Get chat history
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(10)
  
  // Prepare messages for Mistral
  const systemMessage = {
    role: 'system',
    content: `You are Nelson-GPT, a pediatric medical AI assistant based on Nelson Textbook of Pediatrics. 
    
    ${context ? `Relevant medical knowledge:\n${context}\n\n` : ''}
    
    Provide accurate, evidence-based medical information for pediatric healthcare. Always emphasize that this is for educational purposes and not a substitute for professional medical advice.`
  }
  
  const chatMessages = [
    systemMessage,
    ...(messages || []),
    { role: 'user', content: message }
  ]
  
  // Call Mistral API
  const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: chatMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })
  
  // Store user message
  await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role: 'user',
      content: message
    })
  
  // Stream response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = mistralResponse.body!.getReader()
      let assistantMessage = ''
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices[0]?.delta?.content
                if (content) {
                  assistantMessage += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
        
        // Store assistant message
        await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            role: 'assistant',
            content: assistantMessage
          })
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  })
})
```

##### Medical Tools Function
```typescript
// supabase/functions/medical-tools/index.ts
serve(async (req) => {
  const { tool, ...params } = await req.json()
  
  switch (tool) {
    case 'growth-chart':
      return handleGrowthChart(params)
    case 'drug-calculator':
      return handleDrugCalculator(params)
    case 'bmi-calculator':
      return handleBMICalculator(params)
    default:
      return new Response('Invalid tool', { status: 400 })
  }
})

function handleGrowthChart({ age, weight, height, headCircumference, gender }) {
  // CDC growth chart calculations
  const measurements = {}
  
  if (weight) {
    const percentile = calculateWeightPercentile(age, weight, gender)
    measurements.weight = {
      value: weight,
      percentile: percentile,
      status: getGrowthStatus(percentile)
    }
  }
  
  if (height) {
    const percentile = calculateHeightPercentile(age, height, gender)
    measurements.height = {
      value: height,
      percentile: percentile,
      status: getGrowthStatus(percentile)
    }
  }
  
  if (weight && height) {
    const bmi = weight / Math.pow(height / 100, 2)
    const percentile = calculateBMIPercentile(age, bmi, gender)
    measurements.bmi = {
      value: bmi.toFixed(1),
      percentile: percentile,
      status: getBMIStatus(percentile)
    }
  }
  
  return new Response(JSON.stringify({ measurements }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### AI Integration

#### RAG Pipeline Implementation

The Retrieval-Augmented Generation pipeline consists of:

1. **Knowledge Base Ingestion**
   - Medical content from Nelson Textbook of Pediatrics
   - Vector embedding generation using Mistral's embedding model
   - Storage in PostgreSQL with pgvector extension

2. **Query Processing**
   - User query embedding generation
   - Vector similarity search in knowledge base
   - Context retrieval and ranking

3. **Response Generation**
   - Context injection into system prompt
   - Mistral AI chat completion with medical context
   - Streaming response delivery

#### Vector Similarity Search
```typescript
// Vector similarity search implementation
const searchKnowledge = async (query: string, threshold = 0.7, limit = 3) => {
  // Generate embedding for query
  const embedding = await generateEmbedding(query)
  
  // Search similar content
  const { data } = await supabase
    .rpc('match_knowledge_base', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    })
  
  return data
}
```

### Progressive Web App Implementation

#### Service Worker Strategy
The application implements a comprehensive caching strategy:

```javascript
// Network-first for API calls
const handleApiRequest = async (request) => {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || createOfflineResponse()
  }
}

// Cache-first for static assets
const handleStaticRequest = async (request) => {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse
  
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME)
    cache.put(request, networkResponse.clone())
  }
  return networkResponse
}
```

#### Offline Functionality
- **Static Assets**: Cached for offline access
- **API Responses**: Intelligent caching with fallbacks
- **Graceful Degradation**: Offline indicators and alternative workflows

### Security Implementation

#### Authentication & Authorization
```typescript
// Row Level Security policies
CREATE POLICY "Users can only see their own chats" ON chats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );
```

#### Data Encryption
- **In Transit**: HTTPS/TLS encryption for all communications
- **At Rest**: Database-level encryption in Supabase
- **API Keys**: Secure environment variable management

### Performance Optimization

#### Bundle Optimization
```typescript
// Vite configuration for optimal bundling
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-select'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

#### Lazy Loading
```typescript
// Route-based code splitting
const LazyMedicalTools = lazy(() => import('./components/MedicalToolsView'))
const LazyExploreView = lazy(() => import('./components/ExploreView'))
```

### Medical Tools Implementation

#### Growth Chart Calculations
```typescript
const calculateWeightPercentile = (ageMonths: number, weight: number, gender: string) => {
  // CDC LMS parameters for weight-for-age
  const lmsData = getCDCWeightData(gender)
  const ageData = interpolateLMS(lmsData, ageMonths)
  
  // Calculate Z-score
  const zScore = (Math.pow(weight / ageData.M, ageData.L) - 1) / (ageData.L * ageData.S)
  
  // Convert to percentile
  return normalCDF(zScore) * 100
}
```

#### Drug Dosing Calculations
```typescript
const calculateDrugDose = (drug: string, weight: number, age: number, indication: string) => {
  const drugData = PEDIATRIC_DRUG_DATABASE[drug]
  
  if (!drugData) {
    throw new Error('Drug not found in database')
  }
  
  // Weight-based dosing
  const dosePerKg = drugData.dosing[indication] || drugData.dosing.default
  const calculatedDose = weight * dosePerKg
  
  // Apply age-based limits
  const maxDose = getMaxDoseForAge(drug, age)
  const finalDose = Math.min(calculatedDose, maxDose)
  
  return {
    perDose: `${finalDose.toFixed(1)} ${drugData.unit}`,
    frequency: drugData.frequency,
    maxDaily: `${(finalDose * drugData.dailyFrequency).toFixed(1)} ${drugData.unit}`,
    route: drugData.route,
    warnings: drugData.warnings,
    indications: drugData.indications
  }
}
```

### Testing Strategy

#### Unit Testing
```typescript
// Medical calculation tests
describe('Growth Chart Calculations', () => {
  test('calculates correct weight percentile for 2-year-old male', () => {
    const percentile = calculateWeightPercentile(24, 12.5, 'male')
    expect(percentile).toBeCloseTo(50, 1)
  })
  
  test('handles edge cases for extreme values', () => {
    const percentile = calculateWeightPercentile(24, 5, 'male')
    expect(percentile).toBeLessThan(3)
  })
})
```

#### Integration Testing
```typescript
// API endpoint tests
describe('Chat Completion API', () => {
  test('returns streaming response for valid input', async () => {
    const response = await fetch('/functions/v1/chat-completion', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${testToken}` },
      body: JSON.stringify({
        message: 'What are signs of dehydration in infants?',
        chatId: testChatId
      })
    })
    
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/event-stream')
  })
})
```

### Deployment Architecture

#### Production Environment
```yaml
# Production deployment configuration
environment: production
domain: akzuuncs.manus.space
ssl: enabled
cdn: enabled
compression: gzip
caching:
  static_assets: 1y
  api_responses: 5m
  html: 1h
```

#### Monitoring & Analytics
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging
- **Usage Analytics**: Medical tool usage patterns
- **Security Monitoring**: Authentication and access patterns

### Compliance & Standards

#### HIPAA Compliance
- **Data Minimization**: Only collect necessary medical information
- **Access Controls**: Role-based access with audit trails
- **Encryption**: End-to-end encryption for sensitive data
- **Business Associate Agreements**: Compliant third-party services

#### Medical Standards
- **Evidence-Based**: All medical content sourced from Nelson Textbook
- **Peer Review**: Medical content reviewed by healthcare professionals
- **Disclaimer**: Clear medical disclaimer and limitations
- **Updates**: Regular updates to maintain medical accuracy

This technical documentation provides a comprehensive overview of the Nelson-GPT implementation, covering all aspects from frontend architecture to backend services, AI integration, and compliance considerations.

