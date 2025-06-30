import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GrowthChartRequest {
  tool: 'growth-chart'
  age: number // in months
  weight?: number // in kg
  height?: number // in cm
  headCircumference?: number // in cm
  gender: 'male' | 'female'
}

interface DrugCalculatorRequest {
  tool: 'drug-calculator'
  drugName: string
  weight: number // in kg
  age: number // in months
  indication: string
}

interface BMICalculatorRequest {
  tool: 'bmi-calculator'
  weight: number // in kg
  height: number // in cm
  age: number // in months
  gender: 'male' | 'female'
}

type MedicalToolRequest = GrowthChartRequest | DrugCalculatorRequest | BMICalculatorRequest

// Growth chart percentile data (simplified - in production, use complete CDC data)
const growthPercentiles = {
  male: {
    weight: {
      // Age in months -> percentiles [3rd, 5th, 10th, 25th, 50th, 75th, 90th, 95th, 97th]
      0: [2.5, 2.7, 2.9, 3.2, 3.5, 3.8, 4.1, 4.3, 4.5],
      1: [3.4, 3.6, 3.9, 4.3, 4.7, 5.1, 5.5, 5.8, 6.0],
      2: [4.3, 4.5, 4.9, 5.4, 5.9, 6.4, 6.9, 7.3, 7.5],
      3: [5.0, 5.2, 5.7, 6.2, 6.8, 7.4, 8.0, 8.4, 8.7],
      6: [6.4, 6.7, 7.3, 7.9, 8.6, 9.4, 10.2, 10.7, 11.1],
      12: [8.4, 8.8, 9.4, 10.2, 11.0, 11.9, 12.8, 13.4, 13.8],
      24: [10.5, 11.0, 11.7, 12.6, 13.6, 14.7, 15.8, 16.5, 17.0],
      36: [12.1, 12.6, 13.4, 14.4, 15.5, 16.7, 18.0, 18.8, 19.4]
    },
    height: {
      0: [46.1, 47.0, 48.0, 49.4, 50.8, 52.3, 53.7, 54.6, 55.2],
      1: [50.8, 51.7, 52.8, 54.4, 56.0, 57.6, 59.2, 60.1, 60.8],
      2: [54.4, 55.3, 56.4, 58.1, 59.9, 61.7, 63.5, 64.4, 65.1],
      3: [57.3, 58.2, 59.4, 61.1, 63.0, 64.9, 66.8, 67.8, 68.5],
      6: [63.3, 64.2, 65.5, 67.4, 69.4, 71.4, 73.5, 74.5, 75.3],
      12: [71.0, 72.0, 73.4, 75.6, 77.9, 80.2, 82.5, 83.6, 84.4],
      24: [81.7, 82.8, 84.4, 87.0, 89.6, 92.3, 95.0, 96.3, 97.3],
      36: [89.0, 90.2, 92.0, 94.9, 97.9, 101.0, 104.1, 105.6, 106.7]
    }
  },
  female: {
    weight: {
      0: [2.4, 2.5, 2.8, 3.0, 3.4, 3.7, 4.0, 4.2, 4.4],
      1: [3.2, 3.4, 3.6, 4.0, 4.4, 4.8, 5.2, 5.5, 5.7],
      2: [3.9, 4.1, 4.5, 4.9, 5.4, 5.9, 6.4, 6.7, 7.0],
      3: [4.5, 4.8, 5.2, 5.7, 6.2, 6.8, 7.4, 7.7, 8.0],
      6: [5.7, 6.0, 6.5, 7.1, 7.8, 8.5, 9.3, 9.8, 10.1],
      12: [7.4, 7.8, 8.4, 9.2, 10.0, 10.9, 11.9, 12.5, 12.9],
      24: [9.7, 10.2, 10.8, 11.7, 12.7, 13.8, 15.0, 15.8, 16.3],
      36: [11.6, 12.2, 12.9, 13.9, 15.1, 16.4, 17.8, 18.7, 19.3]
    },
    height: {
      0: [45.4, 46.2, 47.3, 48.6, 50.0, 51.5, 52.9, 53.7, 54.3],
      1: [49.8, 50.7, 51.7, 53.2, 54.7, 56.3, 57.8, 58.6, 59.2],
      2: [53.0, 53.9, 55.0, 56.6, 58.2, 59.8, 61.5, 62.4, 63.0],
      3: [55.6, 56.5, 57.7, 59.3, 61.0, 62.7, 64.5, 65.4, 66.1],
      6: [61.2, 62.1, 63.3, 65.0, 66.8, 68.6, 70.5, 71.4, 72.1],
      12: [68.9, 69.8, 71.1, 73.0, 74.9, 76.9, 78.9, 79.9, 80.7],
      24: [80.0, 81.0, 82.5, 84.6, 86.8, 89.0, 91.3, 92.4, 93.3],
      36: [87.4, 88.4, 90.0, 92.4, 94.8, 97.3, 99.8, 101.0, 102.0]
    }
  }
}

// Common pediatric drug dosages (simplified - in production, use complete drug database)
const drugDosages = {
  'acetaminophen': {
    name: 'Acetaminophen (Paracetamol)',
    dosage: '10-15 mg/kg/dose',
    frequency: 'every 4-6 hours',
    maxDaily: '75 mg/kg/day',
    route: 'oral',
    indications: ['fever', 'pain']
  },
  'ibuprofen': {
    name: 'Ibuprofen',
    dosage: '5-10 mg/kg/dose',
    frequency: 'every 6-8 hours',
    maxDaily: '40 mg/kg/day',
    route: 'oral',
    indications: ['fever', 'pain', 'inflammation'],
    contraindications: ['<6 months', 'dehydration', 'kidney disease']
  },
  'amoxicillin': {
    name: 'Amoxicillin',
    dosage: '20-40 mg/kg/day',
    frequency: 'divided every 8 hours',
    maxDaily: '90 mg/kg/day for severe infections',
    route: 'oral',
    indications: ['bacterial infections', 'otitis media', 'pneumonia']
  },
  'prednisolone': {
    name: 'Prednisolone',
    dosage: '1-2 mg/kg/day',
    frequency: 'once daily or divided',
    maxDaily: '60 mg/day',
    route: 'oral',
    indications: ['asthma', 'allergic reactions', 'inflammatory conditions']
  }
}

function calculatePercentile(value: number, percentiles: number[]): number {
  if (value <= percentiles[0]) return 3
  if (value >= percentiles[8]) return 97
  
  for (let i = 0; i < percentiles.length - 1; i++) {
    if (value >= percentiles[i] && value <= percentiles[i + 1]) {
      const percentileValues = [3, 5, 10, 25, 50, 75, 90, 95, 97]
      const ratio = (value - percentiles[i]) / (percentiles[i + 1] - percentiles[i])
      return percentileValues[i] + ratio * (percentileValues[i + 1] - percentileValues[i])
    }
  }
  return 50 // fallback
}

function getClosestAgeData(age: number, data: any) {
  const ages = Object.keys(data).map(Number).sort((a, b) => a - b)
  
  if (age <= ages[0]) return data[ages[0]]
  if (age >= ages[ages.length - 1]) return data[ages[ages.length - 1]]
  
  for (let i = 0; i < ages.length - 1; i++) {
    if (age >= ages[i] && age <= ages[i + 1]) {
      // Linear interpolation between two age points
      const ratio = (age - ages[i]) / (ages[i + 1] - ages[i])
      const lower = data[ages[i]]
      const upper = data[ages[i + 1]]
      
      return lower.map((val: number, idx: number) => 
        val + ratio * (upper[idx] - val)
      )
    }
  }
  
  return data[ages[Math.floor(ages.length / 2)]] // fallback to middle age
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData: MedicalToolRequest = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    let result: any = {}

    switch (requestData.tool) {
      case 'growth-chart': {
        const { age, weight, height, headCircumference, gender } = requestData
        
        result = {
          tool: 'growth-chart',
          age,
          gender,
          measurements: {}
        }

        if (weight) {
          const weightPercentiles = getClosestAgeData(age, growthPercentiles[gender].weight)
          const weightPercentile = calculatePercentile(weight, weightPercentiles)
          result.measurements.weight = {
            value: weight,
            percentile: Math.round(weightPercentile * 10) / 10,
            status: weightPercentile < 5 ? 'underweight' : 
                   weightPercentile > 95 ? 'overweight' : 'normal'
          }
        }

        if (height) {
          const heightPercentiles = getClosestAgeData(age, growthPercentiles[gender].height)
          const heightPercentile = calculatePercentile(height, heightPercentiles)
          result.measurements.height = {
            value: height,
            percentile: Math.round(heightPercentile * 10) / 10,
            status: heightPercentile < 5 ? 'short stature' : 
                   heightPercentile > 95 ? 'tall stature' : 'normal'
          }
        }

        // Calculate BMI if both weight and height are provided
        if (weight && height) {
          const bmi = weight / Math.pow(height / 100, 2)
          result.measurements.bmi = {
            value: Math.round(bmi * 10) / 10,
            status: bmi < 18.5 ? 'underweight' : 
                   bmi > 25 ? 'overweight' : 'normal'
          }
        }

        break
      }

      case 'drug-calculator': {
        const { drugName, weight, age, indication } = requestData
        const drug = drugDosages[drugName.toLowerCase()]

        if (!drug) {
          throw new Error(`Drug "${drugName}" not found in database`)
        }

        // Parse dosage range
        const dosageMatch = drug.dosage.match(/(\d+)-?(\d+)?\s*mg\/kg/)
        if (!dosageMatch) {
          throw new Error('Unable to parse dosage information')
        }

        const minDose = parseInt(dosageMatch[1])
        const maxDose = parseInt(dosageMatch[2] || dosageMatch[1])

        const minDoseTotal = minDose * weight
        const maxDoseTotal = maxDose * weight

        // Parse max daily dose
        const maxDailyMatch = drug.maxDaily.match(/(\d+)\s*mg\/kg/)
        const maxDailyPerKg = maxDailyMatch ? parseInt(maxDailyMatch[1]) : null
        const maxDailyTotal = maxDailyPerKg ? maxDailyPerKg * weight : null

        result = {
          tool: 'drug-calculator',
          drug: drug.name,
          weight,
          age,
          indication,
          dosage: {
            perDose: `${minDoseTotal}${maxDose !== minDose ? `-${maxDoseTotal}` : ''} mg`,
            frequency: drug.frequency,
            maxDaily: maxDailyTotal ? `${maxDailyTotal} mg` : drug.maxDaily,
            route: drug.route
          },
          warnings: drug.contraindications || [],
          indications: drug.indications
        }

        // Add age-specific warnings
        if (drugName.toLowerCase() === 'ibuprofen' && age < 6) {
          result.warnings.push('Not recommended for infants under 6 months')
        }

        break
      }

      case 'bmi-calculator': {
        const { weight, height, age, gender } = requestData
        
        const bmi = weight / Math.pow(height / 100, 2)
        
        // BMI percentiles for children (simplified)
        let bmiStatus = 'normal'
        if (age < 24) { // Under 2 years
          if (bmi < 14) bmiStatus = 'underweight'
          else if (bmi > 18) bmiStatus = 'overweight'
        } else { // 2+ years
          if (bmi < 15) bmiStatus = 'underweight'
          else if (bmi > 20) bmiStatus = 'overweight'
        }

        result = {
          tool: 'bmi-calculator',
          weight,
          height,
          age,
          gender,
          bmi: Math.round(bmi * 10) / 10,
          status: bmiStatus,
          recommendations: bmiStatus === 'normal' ? 
            ['Maintain healthy diet and regular physical activity'] :
            ['Consult with pediatrician for personalized recommendations']
        }

        break
      }

      default:
        throw new Error('Unknown tool requested')
    }

    // Log tool usage
    await supabaseClient
      .from('medical_tools_usage')
      .insert({
        user_id: user.id,
        tool_name: requestData.tool,
        input_data: requestData,
        output_data: result
      })

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in medical tools:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

