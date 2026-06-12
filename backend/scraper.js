const axios = require('axios')
const cheerio = require('cheerio')
const { chromium } = require('playwright')

const siteSelectors = {
  'flipkart.com': '._30jeq3, ._16Jk6d',
  'amazon.in': '.a-price-whole, .a-offscreen',
  'myntra.com': '.pdp-price strong',
  'snapdeal.com': '.payBlkBig',
  'books.toscrape.com': '.price_color',
}

function getSite(url) {
  for (const site of Object.keys(siteSelectors)) {
    if (url.includes(site)) return site
  }
  return null
}

function cleanPrice(priceText) {
  if (!priceText) return null
  const cleaned = priceText.replace(/[^0-9.]/g, '')
  const price = parseFloat(cleaned)
  return isNaN(price) ? null : price
}

function getPriceFromJsonLd($) {
  try {
    const scripts = $('script[type="application/ld+json"]')
    let price = null
    scripts.each((i, el) => {
      const json = JSON.parse($(el).html())
      if (json.offers && json.offers.price) {
        price = parseFloat(json.offers.price)
      }
      if (json.offers && json.offers[0] && json.offers[0].price) {
        price = parseFloat(json.offers[0].price)
      }
    })
    return price
  } catch (e) {
    return null
  }
}

// Scrape using Playwright (real browser - works on protected sites)
async function scrapeWithPlaywright(url) {
  let browser = null
  try {
    console.log('Launching browser...')
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    // Pretend to be a real user
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

    // Wait a moment for prices to load
    await page.waitForTimeout(2000)

    const html = await page.content()
    const $ = cheerio.load(html)

    // Try JSON-LD first
    let price = getPriceFromJsonLd($)
    if (price) return price

    // Try site specific selector
    const site = getSite(url)
    if (site && siteSelectors[site]) {
      const priceText = $(siteSelectors[site]).first().text().trim()
      price = cleanPrice(priceText)
      if (price) return price
    }

    // Try generic selectors
    const genericSelectors = [
      '[itemprop="price"]',
      '.price',
      '#price',
      '.product-price',
      '.offer-price',
    ]
    for (const selector of genericSelectors) {
      const priceText = $(selector).first().text().trim()
      price = cleanPrice(priceText)
      if (price) return price
    }

    return null
  } catch (error) {
    console.log('Playwright error:', error.message)
    return null
  } finally {
    if (browser) await browser.close()
  }
}

// Scrape using Cheerio (fast - for simple sites)
async function scrapeWithCheerio(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(data)

    let price = getPriceFromJsonLd($)
    if (price) return price

    const site = getSite(url)
    if (site && siteSelectors[site]) {
      const priceText = $(siteSelectors[site]).first().text().trim()
      price = cleanPrice(priceText)
      if (price) return price
    }

    return null
  } catch (error) {
    return null
  }
}

// Main function - tries Cheerio first, falls back to Playwright
async function scrapePrice(url) {
  console.log(`Scraping: ${url}`)

  // Try fast method first
  let price = await scrapeWithCheerio(url)
  if (price) {
    console.log(`Found price (fast): ${price}`)
    return price
  }

  // Fall back to real browser
  console.log('Fast method failed, trying real browser...')
  price = await scrapeWithPlaywright(url)
  if (price) {
    console.log(`Found price (browser): ${price}`)
    return price
  }

  console.log('Could not find price')
  return null
}

module.exports = { scrapePrice }