const express = require('express');
const cors = require('cors');
const stockService = require('./stockService');
const analysisEngine = require('./analysisEngine');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Aandelen AI Backend is online met echte data!' });
});

// Nieuwe analyse route met echte data
app.post('/api/analyze', async (req, res) => {
  try {
    const { question } = req.body;
    
    // Extract aandeel symbool uit de vraag
    const symbol = extractStockSymbol(question);
    
    if (!symbol) {
      return res.json({
        answer: "Ik kon geen aandeel herkennen in je vraag. Probeer iets zoals 'Moet ik Apple (AAPL) kopen?' of gebruik symbolen zoals MSFT, GOOGL, TSLA.",
        recommendation: "HOLD",
        confidence: 0,
        error: "Geen aandeel gevonden"
      });
    }

    console.log(`Analyseren van ${symbol}...`);

    // Haal echte data op
    const stockInfo = await stockService.getStockInfo(symbol);
    const historicalData = await stockService.getHistoricalData(symbol, '3mo');
    const technicalIndicators = stockService.calculateTechnicalIndicators(historicalData);

    // Voer analyse uit
    const analysis = await analysisEngine.analyzeStock(stockInfo, historicalData, technicalIndicators);

    // Format response
    const response = {
      answer: `Analyse van ${analysis.name} (${analysis.symbol}):`,
      symbol: analysis.symbol,
      name: analysis.name,
      currentPrice: analysis.currentPrice,
      priceChange: analysis.priceChange,
      priceChangePercent: analysis.priceChangePercent,
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      analysis: {
        fundamental_score: Math.round(analysis.fundamental.score),
        technical_score: Math.round(analysis.technical.score),
        overall_score: Math.round(analysis.overall.score)
      },
      technicalData: analysis.technical.signals,
      fundamentalData: analysis.fundamental.metrics
    };

    res.json(response);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Er ging iets mis met de analyse',
      message: error.message,
      answer: "Sorry, ik kon de analyse niet uitvoeren. Controleer of het aandeel symbool correct is."
    });
  }
});

// Route voor aandeel info (bonus)
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stockInfo = await stockService.getStockInfo(symbol);
    res.json(stockInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hulp functie om aandeel symbool te vinden (uitgebreid)
function extractStockSymbol(text) {
  const upperText = text.toUpperCase();
  
  // Uitgebreide lijst van aandelen
  const stocks = {
    // Tech
    'APPLE': 'AAPL', 'AAPL': 'AAPL',
    'MICROSOFT': 'MSFT', 'MSFT': 'MSFT',
    'GOOGLE': 'GOOGL', 'GOOGL': 'GOOGL', 'ALPHABET': 'GOOGL',
    'TESLA': 'TSLA', 'TSLA': 'TSLA',
    'AMAZON': 'AMZN', 'AMZN': 'AMZN',
    'META': 'META', 'FACEBOOK': 'META',
    'NVIDIA': 'NVDA', 'NVDA': 'NVDA',
    'NETFLIX': 'NFLX', 'NFLX': 'NFLX',
    
    // Finance
    'BERKSHIRE': 'BRK-B', 'BERKSHIRE HATHAWAY': 'BRK-B',
    'JPM': 'JPM', 'JPMORGAN': 'JPM',
    'VISA': 'V',
    
    // Other popular
    'COCA COLA': 'KO', 'COKE': 'KO', 'KO': 'KO',
    'DISNEY': 'DIS', 'DIS': 'DIS',
    'WALMART': 'WMT', 'WMT': 'WMT',
    'MCDONALDS': 'MCD', 'MCD': 'MCD'
  };
  
  // Zoek naar bekende namen/symbolen
  for (let [name, symbol] of Object.entries(stocks)) {
    if (upperText.includes(name)) {
      return symbol;
    }
  }
  
  // Zoek naar mogelijke symbolen (2-5 hoofdletters)
  const symbolMatch = upperText.match(/\b[A-Z]{2,5}\b/);
  if (symbolMatch) {
    return symbolMatch[0];
  }
  
  return null;
}

app.listen(PORT, () => {
  console.log(`🚀 Server draait op http://localhost:${PORT}`);
  console.log('💹 Echte aandelendata is nu beschikbaar!');
});