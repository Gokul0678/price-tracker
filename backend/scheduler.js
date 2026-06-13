const cron = require('node-cron')
const { PrismaClient } = require('@prisma/client')
const { scrapePrice } = require('./scraper')
const { sendPriceAlert } = require('./mailer')

const prisma = new PrismaClient()

async function scrapeAllProducts() {
  console.log('⏰ Scheduler running:', new Date().toLocaleTimeString())

  // Get all tracked products from database
  const products = await prisma.product.findMany()

  if (products.length === 0) {
    console.log('No products to scrape yet.')
    return
  }

  console.log(`Found ${products.length} product(s) to scrape...`)

  for (const product of products) {
    const price = await scrapePrice(product.url)

    if (price) {
      // Save new price to history
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: price,
          currency: 'INR'
        }
      })

      // Check if any alert should be triggered
      const alerts = await prisma.alert.findMany({
        where: {
          productId: product.id,
          notified: false
        }
      })

      for (const alert of alerts) {
  if (price <= alert.targetPrice) {
    console.log(`🔔 Alert triggered for ${product.name}! Price dropped to ${price}`)
    
    // Send email if user provided one
    if (alert.email) {
      await sendPriceAlert({
        productName: product.name,
        currentPrice: price,
        targetPrice: alert.targetPrice,
        productUrl: product.url,
        toEmail: alert.email
      })
    }

    await prisma.alert.update({
      where: { id: alert.id },
      data: { notified: true }
    })
  }
}

      console.log(`✅ ${product.name}: ${price}`)
    } else {
      console.log(`❌ Could not scrape: ${product.name}`)
    }
  }

  console.log('Scraping done!\n')
}

// Run every 6 hours
// Format: minute hour * * *
cron.schedule('0 */6 * * *', scrapeAllProducts)

console.log('✅ Scheduler started - runs every 6 hours')
console.log('Running first scrape now...')

// Also run immediately when server starts
scrapeAllProducts()

module.exports = { scrapeAllProducts }