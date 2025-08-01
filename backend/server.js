const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Aandelen AI Backend is online!' });
});

// Aandeel analyse route (nog simpel)
app.post('/api/analyze', async (req, res) => {
  try {
    const { question } = req.body;
    
    // Extract aandeel symbool uit de vraag (simpele versie)
    const symbol = extractStockSymbol(question);
    
    if (!symbol) {
      return res.json({
        answer: "Ik kon geen aandeel herkennen in je vraag. Probeer iets zoals 'Moet ik Apple (AAPL) kopen?'",
        recommendation: "HOLD",
        confidence: 0
      });
    }

    // Voor nu een simpele fake analyse
    // Later maken we dit echt
    const analysis = await performSimpleAnalysis(symbol);
    
    res.json(analysis);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Er ging iets mis met de analyse' });
  }
});

// Hulp functie om aandeel symbool te vinden
function extractStockSymbol(text) {
  const upperText = text.toUpperCase();
  
  // Simpele matching voor bekende aandelen
  const stocks = {
    'APPLE': 'AAPL',
    'AAPL': 'AAPL',
    'MICROSOFT': 'MSFT',
    'MSFT': 'MSFT',
    'GOOGLE': 'GOOGL',
    'GOOGL': 'GOOGL',
    'TESLA': 'TSLA',
    'TSLA': 'TSLA',
    'AMAZON': 'AMZN',
    'AMZN': 'AMZN'
  };
  
  for (let [name, symbol] of Object.entries(stocks)) {
    if (upperText.includes(name)) {
      return symbol;
    }
  }
  
  return null;
}

// Simpele analyse functie (later maken we deze echt)
async function performSimpleAnalysis(symbol) {
  // Voor nu genereren we random maar realistische data
  const recommendations = ['BUY', 'SELL', 'HOLD'];
  const recommendation = recommendations[Math.floor(Math.random() * 3)];
  const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
  
  const reasons = {
    'BUY': [
      'Sterke fundamentele groei verwacht',
      'Technische indicatoren zijn positief',
      'Ondergewaardeerd ten opzichte van sector'
    ],
    'SELL': [
      'Hoge waardering voor huidige prestaties',
      'Technische indicatoren tonen zwakte',
      'Sector headwinds verwacht'
    ],
    'HOLD': [
      'Gemixte signalen in de analyse',
      'Afwachten van komende earnings',
      'Neutrale markt sentiment'
    ]
  };
  
  const reasoning = reasons[recommendation];
  
  return {
    symbol: symbol,
    answer: `Op basis van mijn analyse van ${symbol}:`,
    recommendation: recommendation,
    confidence: confidence,
    reasoning: reasoning,
    analysis: {
      fundamental_score: Math.floor(Math.random() * 40) + 60,
      technical_score: Math.floor(Math.random() * 40) + 60,
      sentiment_score: Math.floor(Math.random() * 40) + 60
    }
  };
}

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});