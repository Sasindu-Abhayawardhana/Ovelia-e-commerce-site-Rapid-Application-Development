import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react'
import { generateProductSuggestions, AIResponse } from '@/lib/aiService'
import { getProducts } from '@/lib/firestore'
import { Product } from '@/types'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  suggestedProducts?: Product[]
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi there! I'm the Ovelia AI assistant. What are you looking for today? I can help suggest the perfect products for you or as a gift!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [catalog, setCatalog] = useState<Product[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch catalog on first open
  useEffect(() => {
    if (isOpen && catalog.length === 0) {
      getProducts({}, 'newest', 100).then(({ products }) => {
        setCatalog(products)
      }).catch(err => {
        console.error('Failed to load catalog for AI', err)
      })
    }
  }, [isOpen, catalog.length])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    setInput('')
    
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText }
    setMessages(prev => [...prev, newUserMsg])
    setIsLoading(true)

    try {
      const response: AIResponse = await generateProductSuggestions(userText, catalog)
      
      const suggestedProducts = response.suggestedProductIds
        .map(id => catalog.find(p => p.id === id))
        .filter(Boolean) as Product[]

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: response.text,
          suggestedProducts: suggestedProducts.length > 0 ? suggestedProducts : undefined,
        },
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Oops, something went wrong while I was thinking! Do you have the Gemini API key configured correctly in your .env?',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-charcoal-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-terracotta-300" />
              <h3 className="font-serif font-semibold text-lg">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={twMerge(
                  "flex flex-col max-w-[85%]",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={twMerge(
                    "px-4 py-2.5 rounded-2xl text-sm",
                    msg.role === 'user'
                      ? "bg-terracotta-500 text-white rounded-tr-sm"
                      : "bg-white border border-gray-200 text-charcoal-900 rounded-tl-sm shadow-sm"
                  )}
                >
                  {msg.text}
                </div>
                
                {/* Product Suggestions */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {msg.suggestedProducts.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.slug}`}
                        className="flex items-center gap-3 bg-white p-2 border border-gray-100 rounded-xl hover:border-terracotta-200 transition-colors shadow-sm"
                      >
                        <img 
                          src={product.images[0] ?? 'https://placehold.co/100'} 
                          alt={product.name} 
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-charcoal-900 truncate">{product.name}</p>
                          <p className="text-xs text-terracotta-600">${product.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-auto items-start flex gap-2 text-gray-400">
                <Bot className="w-5 h-5" />
                <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-terracotta-500" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I'm looking for a gift..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 disabled:opacity-50 disabled:hover:bg-terracotta-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-charcoal-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-charcoal-800 transition-all hover:scale-105 active:scale-95 group relative"
        >
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-terracotta-500 border-2 border-charcoal-900"></span>
          </div>
          <Sparkles className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
