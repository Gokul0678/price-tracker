const { scrapePrice } = require('./scraper')

async function test() {
  // This site is made specifically for scraping practice - always works
  const url = 'http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html'
  const price = await scrapePrice(url)
  console.log('Final price found:', price)
}

test()