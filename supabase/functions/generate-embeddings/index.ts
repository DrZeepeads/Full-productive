import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmbeddingRequest {
  text: string
  title: string
  source: string
  chapter?: string
  section?: string
}

interface BatchEmbeddingRequest {
  documents: EmbeddingRequest[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if it's a batch request or single request
    const isBatch = 'documents' in requestData
    const documents: EmbeddingRequest[] = isBatch 
      ? requestData.documents 
      : [requestData as EmbeddingRequest]

    const results = []

    // Process documents in batches of 10 to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      
      // Generate embeddings for the batch
      const texts = batch.map(doc => doc.text)
      
      const embeddingResponse = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-embed',
          input: texts,
        }),
      })

      if (!embeddingResponse.ok) {
        throw new Error(`Mistral API error: ${embeddingResponse.statusText}`)
      }

      const embeddingData = await embeddingResponse.json()
      
      // Prepare data for database insertion
      const insertData = batch.map((doc, index) => ({
        title: doc.title,
        content: doc.text,
        source: doc.source,
        chapter: doc.chapter || null,
        section: doc.section || null,
        embedding: embeddingData.data[index].embedding,
      }))

      // Insert into knowledge base
      const { data, error } = await supabaseClient
        .from('knowledge_base')
        .insert(insertData)
        .select()

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      results.push(...(data || []))
      
      // Add a small delay between batches to respect rate limits
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results: results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error generating embeddings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

