import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const mistralApiKey = process.env.VITE_MISTRAL_API_KEY

if (!supabaseUrl || !supabaseServiceKey || !mistralApiKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateEmbedding(text) {
  try {
    const response = await fetch('https://api.mistral.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-embed',
        input: [text],
      }),
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

async function populateKnowledgeBase() {
  try {
    console.log('Loading sample knowledge base data...')
    
    // Load the sample data
    const dataPath = path.join(__dirname, '..', 'supabase', 'sample-knowledge-base.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const knowledgeData = JSON.parse(rawData)
    
    console.log(`Found ${knowledgeData.length} knowledge base entries`)
    
    // Clear existing data
    console.log('Clearing existing knowledge base...')
    const { error: deleteError } = await supabase
      .from('knowledge_base')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.error('Error clearing knowledge base:', deleteError)
    }
    
    // Process entries in batches to avoid rate limits
    const batchSize = 5
    const results = []
    
    for (let i = 0; i < knowledgeData.length; i += batchSize) {
      const batch = knowledgeData.slice(i, i + batchSize)
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(knowledgeData.length / batchSize)}...`)
      
      const batchPromises = batch.map(async (entry) => {
        try {
          console.log(`  Generating embedding for: ${entry.title}`)
          const embedding = await generateEmbedding(entry.content)
          
          return {
            title: entry.title,
            content: entry.content,
            source: entry.source,
            chapter: entry.chapter || null,
            section: entry.section || null,
            embedding: embedding
          }
        } catch (error) {
          console.error(`Error processing entry "${entry.title}":`, error)
          return null
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      const validResults = batchResults.filter(result => result !== null)
      
      if (validResults.length > 0) {
        console.log(`  Inserting ${validResults.length} entries into database...`)
        const { data, error } = await supabase
          .from('knowledge_base')
          .insert(validResults)
          .select()
        
        if (error) {
          console.error('Error inserting batch:', error)
        } else {
          results.push(...(data || []))
          console.log(`  Successfully inserted ${data?.length || 0} entries`)
        }
      }
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < knowledgeData.length) {
        console.log('  Waiting 2 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log(`\n✅ Knowledge base population completed!`)
    console.log(`📊 Total entries processed: ${knowledgeData.length}`)
    console.log(`✅ Successfully inserted: ${results.length}`)
    console.log(`❌ Failed: ${knowledgeData.length - results.length}`)
    
    // Test the similarity search function
    console.log('\n🔍 Testing similarity search...')
    const testQuery = 'fever in children'
    const testEmbedding = await generateEmbedding(testQuery)
    
    const { data: searchResults, error: searchError } = await supabase
      .rpc('match_knowledge_base', {
        query_embedding: testEmbedding,
        match_threshold: 0.7,
        match_count: 3
      })
    
    if (searchError) {
      console.error('Error testing search:', searchError)
    } else {
      console.log(`Found ${searchResults?.length || 0} relevant results for "${testQuery}":`)
      searchResults?.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title} (similarity: ${result.similarity.toFixed(3)})`)
      })
    }
    
  } catch (error) {
    console.error('Error populating knowledge base:', error)
    process.exit(1)
  }
}

// Run the script
populateKnowledgeBase()
  .then(() => {
    console.log('\n🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })

