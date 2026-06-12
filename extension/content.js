// This script runs on every webpage automatically
// It tries to find the product name and price on the current page

function getPriceFromJsonLd() {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    for (const script of scripts) {
      const json = JSON.parse(script.innerHTML)
      if (json.offers && json.offers.price) return parseFloat(json.offers.price)
      if (json.offers && json.offers[0]) return parseFloat(json.offers[0].price)
    }
  } catch (e) {}
  return null
}

function findPrice() {
  // Try JSON-LD first
  const jsonPrice = getPriceFromJsonLd()
  if (jsonPrice) return jsonPrice

  // Try common price selectors
  const selectors = [
    '._30jeq3',         // Flipkart
    '.a-offscreen',     // Amazon
    '.price_color',     // books.toscrape.com
    '[itemprop="price"]',
    '.product-price',
    '.offer-price',
    '.price',
    '#price',
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el) {
      const text = el.innerText || el.getAttribute('content') || ''
      const price = parseFloat(text.replace(/[^0-9.]/g, ''))
      if (!isNaN(price) && price > 0) return price
    }
  }

  return null
}

function findName() {
  // Try common product name locations
  const selectors = [
    'h1',
    '[itemprop="name"]',
    '.product-title',
    '.pdp-title',
    '#productTitle',
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el && el.innerText.trim().length > 0) {
      return el.innerText.trim().substring(0, 100)
    }
  }

  return document.title || 'Unknown Product'
}

function getSite(url) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch (e) {
    return 'unknown'
  }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProductInfo') {
    const price = findPrice()
    const name = findName()
    const site = getSite(window.location.href)
    const url = window.location.href

    sendResponse({ price, name, site, url })
  }
})