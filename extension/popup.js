// When the popup opens, ask content.js for product info
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getProductInfo' }, (response) => {
    const content = document.getElementById('content')

    if (!response || !response.price) {
      content.innerHTML = `
        <div class="no-product">
          <div class="icon">🔍</div>
          <p>No product detected on this page.</p>
          <p style="margin-top:8px;font-size:11px;">Visit any product page to track its price.</p>
        </div>
      `
      return
    }

    const { price, name, site, url } = response

    content.innerHTML = `
      <div class="product-name">${name}</div>
      <span class="site-badge">${site}</span>
      <div class="price-box">
        <div class="price-label">Current Price</div>
        <div class="price-value">₹${price.toLocaleString()}</div>
      </div>
      <button class="track-btn" id="trackBtn">📌 Track this product</button>
      <div class="success-msg" id="successMsg">✅ Now tracking this product!</div>
      <div class="error-msg" id="errorMsg">❌ Could not save. Is the server running?</div>
    `

    document.getElementById('trackBtn').addEventListener('click', async () => {
      const btn = document.getElementById('trackBtn')
      btn.disabled = true
      btn.textContent = 'Saving...'

      try {
        const res = await fetch('https://price-tracker-production-0874.up.railway.app/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, name, site, price, currency: 'INR' })
        })

        if (res.ok) {
          document.getElementById('successMsg').style.display = 'block'
          btn.textContent = '✅ Tracked!'
        } else {
          throw new Error('Server error')
        }
      } catch (e) {
        document.getElementById('errorMsg').style.display = 'block'
        btn.disabled = false
        btn.textContent = '📌 Track this product'
      }
    })
  })
})
