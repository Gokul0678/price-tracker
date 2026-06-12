require('dotenv').config()
const express = require('express')
const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
require('./scheduler')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Test route - just to check server is working
app.get('/', (req, res) => {
  res.json({ message: 'Price Tracker API is running!' })
})

// Add a product to track
app.post('/products', async (req, res) => {
  const { url, name, site, price, currency } = req.body

  try {
    // Check if product already exists
    let product = await prisma.product.findUnique({
      where: { url }
    })

    // If not, create it
    if (!product) {
      product = await prisma.product.create({
        data: { url, name, site }
      })
    }

    // Save the price
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: parseFloat(price),
        currency: currency || 'INR'
      }
    })

    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all tracked products
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        prices: {
          orderBy: { scrapedAt: 'desc' },
          take: 1
        }
      }
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get price history for a product (for charts)
app.get('/products/:id/history', async (req, res) => {
  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId: parseInt(req.params.id) },
      orderBy: { scrapedAt: 'asc' }
    })
    res.json(history)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start the server
// Delete a product
// AI Chat endpoint
app.post('/products/:id/chat', async (req, res) => {
  try {
    const { message } = req.body
    const productId = parseInt(req.params.id)

    // Get product info
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    // Get price history
    const history = await prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { scrapedAt: 'asc' }
    })

    // Build price summary for AI context
    const prices = history.map(h => h.price)
    const currentPrice = prices[prices.length - 1]
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)
    const priceHistory = history.map(h =>
      `${new Date(h.scrapedAt).toLocaleDateString()}: Rs.${h.price}`
    ).join('\n')

    // Give AI the context about this product
    const context = `
You are a helpful shopping assistant for a price tracker app.
Here is the data for the product the user is asking about:

Product: ${product.name}
Site: ${product.site}
Current Price: Rs.${currentPrice}
Lowest Ever Price: Rs.${lowestPrice}
Highest Ever Price: Rs.${highestPrice}

Price History:
${priceHistory}

Answer the user's question based on this data. Be friendly, concise, and helpful.
If asked whether to buy, give practical advice based on the price trend.
Always mention specific prices from the data in your answer.
    `

    const result = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: context },
    { role: 'user', content: message }
  ]
})
const response = result.choices[0].message.content

    res.json({ reply: response })
  } catch (error) {
    console.log('AI error:', error.message)
    res.status(500).json({ error: error.message })
  }
})
app.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.priceHistory.deleteMany({ where: { productId: id } })
    await prisma.alert.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Save a price alert
app.post('/products/:id/alerts', async (req, res) => {
  try {
    const alert = await prisma.alert.create({
      data: {
        productId: parseInt(req.params.id),
        targetPrice: parseFloat(req.body.targetPrice)
      }
    })
    res.json(alert)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start the server
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})