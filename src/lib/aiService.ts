import { GoogleGenerativeAI } from '@google/generative-ai'
import { Product } from '@/types'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface AIResponse {
  text: string
  suggestedProductIds: string[]
}

export async function generateProductSuggestions(
  userQuery: string,
  catalog: Product[]
): Promise<AIResponse> {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Simplify catalog to save tokens
  const simplifiedCatalog = catalog.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    price: p.price
  }))

  const prompt = `
You are a helpful, friendly AI shopping assistant for our store "Ovelia".
The user says: "${userQuery}"

Here is the current product catalog (in JSON):
${JSON.stringify(simplifiedCatalog)}

Task:
Respond to the user in a helpful, conversational tone. If they are looking for ideas, suggest 1 to 3 products from the catalog that match their request.

Your response MUST be valid JSON with two fields:
- "text": A friendly conversational response string.
- "suggestedProductIds": An array of strings containing the IDs of the products you recommend.

Example Response:
{
  "text": "I have some great options for a cozy evening!",
  "suggestedProductIds": ["prod_123", "prod_456"]
}

Respond ONLY with valid JSON. Do not include markdown code block formatting in your output, just the raw JSON object.
`
  
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIResponse
    }
    return JSON.parse(text) as AIResponse
  } catch (e) {
    console.error('Failed to parse AI response', text, e)
    return {
      text: "I'm having trouble finding the perfect products right now, but feel free to browse our catalog!",
      suggestedProductIds: []
    }
  }
}
