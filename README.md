# 💰 Price Tracker

A full-stack AI-powered price tracker that monitors product prices across any e-commerce site and helps you decide when to buy.

## ✨ Features

- 🔍 **Browser Extension** — detect and track any product on any site with one click
- 📈 **Price History Charts** — visualize price trends over time
- 🤖 **AI Shopping Assistant** — ask questions like "Is now a good time to buy?" powered by Groq (Llama 3)
- 🔔 **Price Alerts** — get notified when a product drops below your target price
- ⏰ **Auto Scraping** — prices update automatically every 6 hours
- 🌐 **Cross-site Comparison** — track the same product across multiple sites

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Recharts |
| Backend | Node.js, Express |
| Database | SQLite (Prisma ORM) |
| Scraping | Cheerio, Playwright |
| AI | Groq API (Llama 3.3) |
| Extension | Chrome Manifest V3 |
| Scheduling | node-cron |

## 🚀 Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/Gokul0678/price-tracker.git
cd price-tracker
```

### 2. Set up backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
```

Create a `.env` file in the backend folder:
DATABASE_URL="file:./dev.db"
GROQ_API_KEY=your_groq_api_key

Start the backend:
```bash
node index.js
```

### 3. Set up frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Load the extension
- Open Chrome and go to `chrome://extensions`
- Enable Developer Mode
- Click "Load unpacked" and select the `extension` folder

## 📸 Screenshots

### Dashboard
![Dashboard showing tracked products]

### Price History Chart
![Price history chart with AI chat]

## 🤖 AI Features
The AI shopping assistant is powered by Groq's Llama 3.3 model. It receives the full price history as context and answers natural language questions about buying decisions, price trends, and historical data.