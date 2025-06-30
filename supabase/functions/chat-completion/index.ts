import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  chatId: string
  stream?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, chatId, stream = true }: ChatRequest = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    // const authHeader = req.headers.get('Authorization')
    // if (!authHeader) {
    //   throw new Error('No authorization header')
    // }

    // const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
    //   authHeader.replace('Bearer ', '')
    // )

    // if (authError || !user) {
    //   throw new Error('Invalid authentication')
    // }

    // Get relevant context from knowledge base
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    let contextualInfo = ''

    if (lastUserMessage) {
      // Generate embedding for the user's question
      const embeddingResponse = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-embed',
          input: [lastUserMessage.content],
        }),
      })

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json()
        const queryEmbedding = embeddingData.data[0].embedding

        // Search knowledge base
        const { data: knowledgeResults } = await supabaseClient.rpc('match_knowledge_base', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 5
        })

        if (knowledgeResults && knowledgeResults.length > 0) {
          contextualInfo = knowledgeResults
            .map(result => `Source: ${result.source} (${result.chapter || 'General'})\n${result.content}`)
            .join('\n\n---\n\n')
        }
      }
    }

    // Prepare system message with medical context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are Nelson-GPT, an AI medical assistant specialized in pediatric healthcare based on the Nelson Textbook of Pediatrics. You provide evidence-based medical information and guidance.

IMPORTANT GUIDELINES:
- Always provide accurate, evidence-based medical information
- Emphasize that you are an AI assistant and not a replacement for professional medical advice
- Recommend consulting healthcare professionals for diagnosis and treatment decisions
- Be empathetic and professional in your responses
- Use clear, understandable language while maintaining medical accuracy
- When uncertain, acknowledge limitations and recommend professional consultation

${contextualInfo ? `RELEVANT MEDICAL CONTEXT:\n${contextualInfo}\n\n` : ''}

Please respond to the user's medical question with appropriate care and professionalism.`
    }

    // Prepare messages for Mistral API
    const mistralMessages = [systemMessage, ...messages]

    // Call Mistral API
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: mistralMessages,
        stream: stream,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!mistralResponse.ok) {
      throw new Error(`Mistral API error: ${mistralResponse.statusText}`)
    }

    if (stream) {
      // Handle streaming response
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          const reader = mistralResponse.body?.getReader()
          if (!reader) return

          let assistantMessage = ''

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
                    // Save complete message to database
                    if (assistantMessage.trim()) {
                      await supabaseClient
                        .from('messages')
                        .insert({
                          chat_id: chatId,
                          role: 'assistant',
                          content: assistantMessage.trim(),
                        })
                    }
                    controller.close()
                    return
                  }

                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content
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
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Handle non-streaming response
      const data = await mistralResponse.json()
      const assistantMessage = data.choices[0].message.content

      // Save message to database
      await supabaseClient
        .from('messages')
        .insert({
          chat_id: chatId,
          role: 'assistant',
          content: assistantMessage,
        })

      return new Response(
        JSON.stringify({ content: assistantMessage }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error in chat completion:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

