import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Calculator, Heart, Stethoscope, Pill, AlertTriangle, Info, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { 
  PEDIATRIC_DRUG_DATABASE, 
  calculateDrugDose, 
  searchDrugsBySystem, 
  searchDrugsByIndication,
  getAllSystems,
  type DrugInfo,
  type MedicalSystem
} from '../lib/pediatric-drugs'

interface GrowthResult {
  measurements: {
    weight?: { value: number; percentile: number; status: string }
    height?: { value: number; percentile: number; status: string }
    bmi?: { value: number; percentile: number; status: string }
    headCircumference?: { value: number; percentile: number; status: string }
  }
}

interface DrugCalculationResult {
  drug: string
  genericName: string
  system: string
  indication: string
  dosing: any
  contraindications: string[]
  warnings: string[]
  monitoring?: string[]
  sideEffects: string[]
  ageRestrictions?: string
  renalAdjustment?: string
  hepaticAdjustment?: string
}

export default function MedicalToolsView() {
  const [growthData, setGrowthData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    headCircumference: ''
  })
  
  const [drugData, setDrugData] = useState({
    selectedSystem: '',
    selectedDrug: '',
    indication: '',
    weight: '',
    age: '',
    route: 'PO'
  })
  
  const [bmiData, setBmiData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: ''
  })
  
  const [growthResults, setGrowthResults] = useState<GrowthResult | null>(null)
  const [drugResults, setDrugResults] = useState<DrugCalculationResult | null>(null)
  const [bmiResults, setBmiResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDrugs, setFilteredDrugs] = useState<DrugInfo[]>([])
  const [selectedDrugInfo, setSelectedDrugInfo] = useState<DrugInfo | null>(null)
  
  const systems = getAllSystems()
  
  useEffect(() => {
    if (drugData.selectedSystem) {
      const systemDrugs = searchDrugsBySystem(drugData.selectedSystem)
      setFilteredDrugs(systemDrugs)
    } else if (searchTerm) {
      const searchResults = searchDrugsByIndication(searchTerm)
      setFilteredDrugs(searchResults)
    } else {
      setFilteredDrugs([])
    }
  }, [drugData.selectedSystem, searchTerm])
  
  useEffect(() => {
    if (drugData.selectedDrug) {
      const drug = filteredDrugs.find(d => 
        d.name.toLowerCase() === drugData.selectedDrug.toLowerCase() ||
        d.genericName.toLowerCase() === drugData.selectedDrug.toLowerCase()
      )
      setSelectedDrugInfo(drug || null)
    }
  }, [drugData.selectedDrug, filteredDrugs])

  const calculateGrowthPercentiles = async () => {
    if (!growthData.age || !growthData.gender) {
      toast.error('Please enter age and gender')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('medical-tools', {
        body: {
          tool: 'growth-chart',
          age: parseInt(growthData.age),
          weight: growthData.weight ? parseFloat(growthData.weight) : undefined,
          height: growthData.height ? parseFloat(growthData.height) : undefined,
          headCircumference: growthData.headCircumference ? parseFloat(growthData.headCircumference) : undefined,
          gender: growthData.gender
        }
      })

      if (error) throw error
      setGrowthResults(data)
      toast.success('Growth percentiles calculated successfully')
    } catch (error) {
      console.error('Error calculating growth percentiles:', error)
      toast.error('Failed to calculate growth percentiles')
    } finally {
      setLoading(false)
    }
  }

  const calculateDrugDosing = async () => {
    if (!drugData.selectedDrug || !drugData.weight || !drugData.age) {
      toast.error('Please select drug and enter weight and age')
      return
    }

    setLoading(true)
    try {
      const result = calculateDrugDose(
        drugData.selectedDrug,
        parseFloat(drugData.weight),
        parseInt(drugData.age),
        drugData.indication || 'general',
        drugData.route
      )
      
      setDrugResults(result)
      toast.success('Drug dosing calculated successfully')
    } catch (error) {
      console.error('Error calculating drug dose:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to calculate drug dose')
    } finally {
      setLoading(false)
    }
  }

  const calculateBMI = async () => {
    if (!bmiData.age || !bmiData.weight || !bmiData.height || !bmiData.gender) {
      toast.error('Please enter all BMI calculation fields')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('medical-tools', {
        body: {
          tool: 'bmi-calculator',
          age: parseInt(bmiData.age),
          weight: parseFloat(bmiData.weight),
          height: parseFloat(bmiData.height),
          gender: bmiData.gender
        }
      })

      if (error) throw error
      setBmiResults(data)
      toast.success('BMI calculated successfully')
    } catch (error) {
      console.error('Error calculating BMI:', error)
      toast.error('Failed to calculate BMI')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'underweight': return 'bg-yellow-100 text-yellow-800'
      case 'overweight': return 'bg-orange-100 text-orange-800'
      case 'obese': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 p-6 bg-[#121212] text-white">
      <div className="flex items-center gap-3 mb-6">
        <Stethoscope className="h-8 w-8 text-white" />
        <h1 className="text-3xl font-bold">Medical Tools</h1>
      </div>
      
      <p className="text-[#B0B0B0] mb-8">
        Comprehensive pediatric medical calculation tools with evidence-based drug dosing by medical system
      </p>

      <Tabs defaultValue="drug-calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#2A2A2A]">
          <TabsTrigger value="drug-calculator" className="data-[state=active]:bg-[#1E1E1E]">
            Drug Calculator
          </TabsTrigger>
          <TabsTrigger value="growth-charts" className="data-[state=active]:bg-[#1E1E1E]">
            Growth Charts
          </TabsTrigger>
          <TabsTrigger value="bmi-calculator" className="data-[state=active]:bg-[#1E1E1E]">
            BMI Calculator
          </TabsTrigger>
          <TabsTrigger value="immunizations" className="data-[state=active]:bg-[#1E1E1E]">
            Immunizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drug-calculator">
          <Card className="bg-[#1E1E1E] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Pill className="h-5 w-5" />
                Pediatric Drug Calculator by Medical System
              </CardTitle>
              <CardDescription className="text-[#B0B0B0]">
                Calculate safe medication dosing for pediatric patients organized by medical specialties with authentic Nelson Textbook dosing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system" className="text-white">Medical System</Label>
                  <select
                    id="system"
                    value={drugData.selectedSystem}
                    onChange={(e) => {
                      setDrugData({ ...drugData, selectedSystem: e.target.value, selectedDrug: '' })
                      setSelectedDrugInfo(null)
                    }}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select medical system</option>
                    {systems.map((system) => (
                      <option key={system.id} value={system.id}>
                        {system.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="drug-search" className="text-white">Search by Indication</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#B0B0B0]" />
                    <input
                      id="drug-search"
                      type="text"
                      placeholder="e.g., asthma, pneumonia, UTI"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setDrugData({ ...drugData, selectedSystem: '', selectedDrug: '' })
                      }}
                      className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="drug" className="text-white">Select Drug</Label>
                  <select
                    id="drug"
                    value={drugData.selectedDrug}
                    onChange={(e) => setDrugData({ ...drugData, selectedDrug: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={filteredDrugs.length === 0}
                  >
                    <option value="">Select drug</option>
                    {filteredDrugs.map((drug) => (
                      <option key={drug.name} value={drug.name}>
                        {drug.name} ({drug.genericName}) - {drug.category}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedDrugInfo && (
                  <div className="md:col-span-2 bg-[#2A2A2A] p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">{selectedDrugInfo.name}</h4>
                    <p className="text-sm text-[#B0B0B0] mb-2">
                      <strong>Generic:</strong> {selectedDrugInfo.genericName}
                    </p>
                    <p className="text-sm text-[#B0B0B0] mb-2">
                      <strong>Category:</strong> {selectedDrugInfo.category}
                    </p>
                    <p className="text-sm text-[#B0B0B0] mb-2">
                      <strong>Indications:</strong> {selectedDrugInfo.indications.join(', ')}
                    </p>
                    {selectedDrugInfo.ageRestrictions && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-900/20 rounded">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-200">
                          <strong>Age Restrictions:</strong> {selectedDrugInfo.ageRestrictions}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="indication" className="text-white">Indication</Label>
                  <input
                    id="indication"
                    type="text"
                    placeholder="e.g., pneumonia, asthma"
                    value={drugData.indication}
                    onChange={(e) => setDrugData({ ...drugData, indication: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="route" className="text-white">Route</Label>
                  <select
                    id="route"
                    value={drugData.route}
                    onChange={(e) => setDrugData({ ...drugData, route: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PO">Oral (PO)</option>
                    <option value="IV">Intravenous (IV)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="SC">Subcutaneous (SC)</option>
                    <option value="Nebulizer">Nebulizer</option>
                    <option value="MDI">Metered Dose Inhaler</option>
                    <option value="Topical">Topical</option>
                    <option value="Nasal">Nasal</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="drug-weight" className="text-white">Weight (kg) *</Label>
                  <input
                    id="drug-weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 15.5"
                    value={drugData.weight}
                    onChange={(e) => setDrugData({ ...drugData, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="drug-age" className="text-white">Age (years) *</Label>
                  <input
                    id="drug-age"
                    type="number"
                    placeholder="e.g., 5"
                    value={drugData.age}
                    onChange={(e) => setDrugData({ ...drugData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                onClick={calculateDrugDosing}
                disabled={loading || !drugData.selectedDrug}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Calculating...' : 'Calculate Drug Dosing'}
              </button>
              
              {drugResults && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Dosing Calculation Results</h3>
                  <div className="bg-[#2A2A2A] p-4 rounded-lg space-y-4">
                    <div>
                      <h4 className="font-semibold text-white">{drugResults.drug}</h4>
                      <p className="text-sm text-[#B0B0B0]">
                        Generic: {drugResults.genericName} | System: {drugResults.system}
                      </p>
                    </div>
                    
                    <Separator className="bg-[#333]" />
                    
                    <div>
                      <h5 className="font-medium text-white mb-2">Dosing Information</h5>
                      <div className="space-y-2 text-sm">
                        <p className="text-[#B0B0B0]">
                          <strong>Route:</strong> {drugResults.dosing.route}
                        </p>
                        <p className="text-[#B0B0B0]">
                          <strong>Dose:</strong> {drugResults.dosing.dose}
                        </p>
                        <p className="text-[#B0B0B0]">
                          <strong>Frequency:</strong> {drugResults.dosing.frequency}
                        </p>
                        {drugResults.dosing.maxDose && (
                          <p className="text-[#B0B0B0]">
                            <strong>Maximum Dose:</strong> {drugResults.dosing.maxDose}
                          </p>
                        )}
                        {drugResults.dosing.duration && (
                          <p className="text-[#B0B0B0]">
                            <strong>Duration:</strong> {drugResults.dosing.duration}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {drugResults.contraindications.length > 0 && (
                      <>
                        <Separator className="bg-[#333]" />
                        <div>
                          <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Contraindications
                          </h5>
                          <ul className="text-sm text-red-200 space-y-1">
                            {drugResults.contraindications.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {drugResults.warnings.length > 0 && (
                      <>
                        <Separator className="bg-[#333]" />
                        <div>
                          <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Warnings
                          </h5>
                          <ul className="text-sm text-yellow-200 space-y-1">
                            {drugResults.warnings.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {drugResults.monitoring && drugResults.monitoring.length > 0 && (
                      <>
                        <Separator className="bg-[#333]" />
                        <div>
                          <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-500" />
                            Monitoring Parameters
                          </h5>
                          <ul className="text-sm text-blue-200 space-y-1">
                            {drugResults.monitoring.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    <div className="bg-red-900/20 p-3 rounded border border-red-800">
                      <p className="text-sm text-red-200">
                        <strong>⚠️ Medical Disclaimer:</strong> This tool is for educational purposes only. 
                        Always verify dosing with current prescribing information and consult with a qualified 
                        healthcare professional before administering any medication.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth-charts">
          <Card className="bg-[#1E1E1E] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calculator className="h-5 w-5" />
                Pediatric Growth Charts
              </CardTitle>
              <CardDescription className="text-[#B0B0B0]">
                Assess growth patterns using CDC growth charts for children
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">Age (months) *</Label>
                  <input
                    id="age"
                    type="number"
                    placeholder="e.g., 24"
                    value={growthData.age}
                    onChange={(e) => setGrowthData({ ...growthData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">Gender *</Label>
                  <select
                    id="gender"
                    value={growthData.gender}
                    onChange={(e) => setGrowthData({ ...growthData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-white">Weight (kg)</Label>
                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 12.5"
                    value={growthData.weight}
                    onChange={(e) => setGrowthData({ ...growthData, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">Height (cm)</Label>
                  <input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 85.5"
                    value={growthData.height}
                    onChange={(e) => setGrowthData({ ...growthData, height: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="headCircumference" className="text-white">Head Circumference (cm)</Label>
                  <input
                    id="headCircumference"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 48.0"
                    value={growthData.headCircumference}
                    onChange={(e) => setGrowthData({ ...growthData, headCircumference: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                onClick={calculateGrowthPercentiles}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Calculating...' : 'Calculate Growth Percentiles'}
              </button>
              
              {growthResults && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Growth Assessment Results</h3>
                  <div className="grid gap-4">
                    {Object.entries(growthResults.measurements).map(([measurement, data]) => (
                      <div key={measurement} className="bg-[#2A2A2A] p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white capitalize">
                            {measurement.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <Badge className={getStatusColor(data.status)}>
                            {data.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-[#B0B0B0]">
                          Value: {data.value} | Percentile: {data.percentile.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bmi-calculator">
          <Card className="bg-[#1E1E1E] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calculator className="h-5 w-5" />
                BMI Calculator
              </CardTitle>
              <CardDescription className="text-[#B0B0B0]">
                Calculate BMI and percentiles for pediatric patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bmi-age" className="text-white">Age (years) *</Label>
                  <input
                    id="bmi-age"
                    type="number"
                    placeholder="e.g., 8"
                    value={bmiData.age}
                    onChange={(e) => setBmiData({ ...bmiData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bmi-gender" className="text-white">Gender *</Label>
                  <select
                    id="bmi-gender"
                    value={bmiData.gender}
                    onChange={(e) => setBmiData({ ...bmiData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bmi-weight" className="text-white">Weight (kg) *</Label>
                  <input
                    id="bmi-weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 25.5"
                    value={bmiData.weight}
                    onChange={(e) => setBmiData({ ...bmiData, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bmi-height" className="text-white">Height (cm) *</Label>
                  <input
                    id="bmi-height"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 125.0"
                    value={bmiData.height}
                    onChange={(e) => setBmiData({ ...bmiData, height: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#333] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                onClick={calculateBMI}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Calculating...' : 'Calculate BMI'}
              </button>
              
              {bmiResults && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">BMI Results</h3>
                  <div className="bg-[#2A2A2A] p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#B0B0B0]">BMI</p>
                        <p className="text-xl font-semibold text-white">{bmiResults.bmi}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#B0B0B0]">Percentile</p>
                        <p className="text-xl font-semibold text-white">{bmiResults.percentile}%</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Badge className={getStatusColor(bmiResults.status)}>
                        {bmiResults.status}
                      </Badge>
                    </div>
                    {bmiResults.recommendations && (
                      <div className="mt-4">
                        <p className="text-sm text-[#B0B0B0]">Recommendations:</p>
                        <p className="text-sm text-white mt-1">{bmiResults.recommendations}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="immunizations">
          <Card className="bg-[#1E1E1E] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="h-5 w-5" />
                Immunization Schedule
              </CardTitle>
              <CardDescription className="text-[#B0B0B0]">
                CDC recommended vaccination schedules for children and adolescents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#2A2A2A] p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">Birth to 6 Years</h3>
                  <div className="space-y-2 text-sm text-[#B0B0B0]">
                    <p><strong>Birth:</strong> Hepatitis B</p>
                    <p><strong>2 months:</strong> DTaP, IPV, Hib, PCV13, RV</p>
                    <p><strong>4 months:</strong> DTaP, IPV, Hib, PCV13, RV</p>
                    <p><strong>6 months:</strong> DTaP, IPV, Hib, PCV13, RV, Influenza (annually)</p>
                    <p><strong>12-15 months:</strong> MMR, Varicella, PCV13, Hib</p>
                    <p><strong>15-18 months:</strong> DTaP</p>
                    <p><strong>4-6 years:</strong> DTaP, IPV, MMR, Varicella</p>
                  </div>
                </div>
                
                <div className="bg-[#2A2A2A] p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">7-18 Years</h3>
                  <div className="space-y-2 text-sm text-[#B0B0B0]">
                    <p><strong>11-12 years:</strong> Tdap, HPV (2-3 doses), Meningococcal</p>
                    <p><strong>16 years:</strong> Meningococcal booster</p>
                    <p><strong>Annually:</strong> Influenza vaccine</p>
                  </div>
                </div>
                
                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800">
                  <p className="text-sm text-yellow-200">
                    <strong>Note:</strong> This is a simplified schedule. Always refer to the current CDC 
                    immunization schedule and consult with healthcare providers for individual patient needs, 
                    catch-up schedules, and special circumstances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

