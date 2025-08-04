const newsService = require('./newsService');
const mlDatabase = require('./mlDatabase');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Start ML evaluation cycle
setInterval(() => {
  mlDatabase.evaluatePredictions();
}, 60000); // Check every minute for demo (in production: every few hours)

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 Server met ECHTE Yahoo Finance data!' });
});

// ML Performance route
app.get('/api/ml/performance', async (req, res) => {
  try {
    const performance = mlDatabase.getPerformanceMetrics();
    res.json(performance);
  } catch (error) {
    console.error('ML Performance error:', error);
    res.status(500).json({ error: 'Could not get ML performance' });
  }
});

// ECHTE CHART ROUTE
app.get('/api/chart/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`📊 Ophalen van ECHTE data voor: ${symbol}`);
    
    let chartData;
    let source = 'Yahoo Finance';
    
    try {
      // Probeer echte Yahoo Finance data
      const yahooFinance = require('yahoo-finance2').default;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // 3 maanden terug
      
      const historicalData = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });
      
      if (historicalData && historicalData.length > 0) {
        chartData = historicalData.map(item => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));
        
        console.log(`✅ Yahoo Finance: ${chartData.length} dagen data voor ${symbol}`);
      } else {
        throw new Error('Geen data ontvangen van Yahoo Finance');
      }
      
    } catch (yahooError) {
      console.log(`⚠️ Yahoo Finance niet beschikbaar voor ${symbol}, using fallback data`);
      console.log('Yahoo error:', yahooError.message);
      source = 'Fallback Data';
      
      // Fallback naar fake data
      chartData = generateFakeHistoricalData();
    }
    
    // Bereken technische indicatoren
    const technical = calculateTechnicalIndicators(chartData);
    
    const response = {
      symbol: symbol,
      period: '3mo',
      data: chartData,
      technical: technical,
      dataPoints: chartData.length,
      source: source
    };
    
    console.log(`📈 Verzonden: ${response.dataPoints} data points van ${source}`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Chart error:', error);
    res.status(500).json({ 
      error: 'Chart data niet beschikbaar',
      message: error.message 
    });
  }
});

// ANALYSE ROUTE MET NIEUWS
app.post('/api/analyze', async (req, res) => {
  try {
    const { question } = req.body;
    console.log('📋 Analyse vraag:', question);
    
    const symbol = extractStockSymbol(question);
    
    if (!symbol) {
      return res.json({
        answer: "🤔 Ik kon geen aandeel herkennen. Probeer: 'Analyseer Apple' of AAPL, MSFT, TSLA.",
        recommendation: "HOLD",
        confidence: 0
      });
    }

    console.log(`🔍 Ophalen van data en nieuws voor: ${symbol}`);
    
    let stockInfo;
    let newsData;
    let source = 'Yahoo Finance';
    
    try {
      // Haal stock data op
      const yahooFinance = require('yahoo-finance2').default;
      const quote = await yahooFinance.quote(symbol);
      
      stockInfo = {
        symbol: symbol,
        name: quote.displayName || quote.shortName || `${symbol} Stock`,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        pe: quote.trailingPE || null,
        beta: quote.beta || null,
        high52: quote.fiftyTwoWeekHigh || 0,
        low52: quote.fiftyTwoWeekLow || 0
      };
      
      console.log(`✅ Stock data: ${stockInfo.name} - $${stockInfo.price}`);
      
      // Haal nieuws op
      newsData = await newsService.getStockNews(symbol, stockInfo.name);
      console.log(`📰 News: ${newsData.articles.length} artikelen, sentiment: ${newsData.summary.overallSentiment}%`);
      
    } catch (yahooError) {
      console.log(`⚠️ Fallback data voor ${symbol}`);
      source = 'Fallback Data';
      
      stockInfo = generateFakeStockInfo(symbol);
      // Haal nieuws op
      console.log(`📰 Requesting news for ${symbol} - ${stockInfo.name}`);
      newsData = await newsService.getStockNews(symbol, stockInfo.name);
      console.log(`📰 News received:`, {
        articles: newsData.articles.length,
        summary: newsData.summary,
        firstHeadline: newsData.articles[0]?.title
      });
    }
    
    // Haal historische data op voor technische analyse
    let historicalData;
    try {
      const yahooFinance = require('yahoo-finance2').default;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const data = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });
      
      historicalData = data || [];
    } catch (e) {
      historicalData = generateFakeHistoricalData();
    }
    
    // Bereken technische indicatoren
    const technical = calculateTechnicalIndicators(historicalData);
    
    // Genereer slimme analyse MET nieuws sentiment
    const analysis = await generateSmartAnalysisWithNews(stockInfo, technical, newsData);
    
    const response = {
      answer: `📊 Complete analyse van ${stockInfo.name} (${symbol}):`,
      symbol: symbol,
      name: stockInfo.name,
      currentPrice: stockInfo.price,
      priceChange: stockInfo.change,
      priceChangePercent: stockInfo.changePercent,
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      analysis: {
        fundamental_score: analysis.fundamentalScore,
        technical_score: analysis.technicalScore,
        news_sentiment_score: analysis.newsScore,
        overall_score: analysis.overallScore
      },
      technicalData: {
        rsi: technical.rsi,
        trend: technical.trend,
        sma20: technical.sma20,
        volumeRatio: technical.volumeRatio
      },
      newsData: {
        summary: newsData.summary,
        topHeadlines: newsData.articles.slice(0, 5).map(article => ({
          title: article.title,
          sentiment: article.sentiment?.sentiment || 'neutral',
          score: article.sentiment?.score || 50,
          date: article.date,
          source: article.source
        }))
      },
      source: source
    };

    console.log(`✅ Complete analyse: ${response.recommendation} (${response.confidence}%) - News: ${newsData.summary.overallSentiment}%`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      error: 'Analyse mislukt',
      message: error.message,
      answer: "Sorry, er ging iets mis met de analyse."
    });
  }
});

// HELPER FUNCTIES

function generateFakeHistoricalData() {
  const data = [];
  const today = new Date();
  const basePrice = 100 + Math.random() * 200;
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const price = basePrice + (Math.random() - 0.5) * 20;
    data.push({
      date: date,
      open: price + (Math.random() - 0.5) * 5,
      high: price + Math.random() * 5,
      low: price - Math.random() * 5,
      close: price,
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  
  return data;
}

function generateFakeStockInfo(symbol) {
  const basePrice = 100 + Math.random() * 200;
  const change = (Math.random() - 0.5) * 10;
  
  return {
    symbol: symbol,
    name: `${symbol} Company`,
    price: basePrice,
    change: change,
    changePercent: (change / basePrice) * 100,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    pe: 15 + Math.random() * 20,
    beta: 0.8 + Math.random() * 0.8,
    high52: basePrice + 20,
    low52: basePrice - 20
  };
}

function calculateTechnicalIndicators(historicalData) {
  if (!historicalData || historicalData.length < 20) {
    return {
      rsi: (50 + Math.random() * 40).toFixed(1),
      trend: 'NEUTRAL',
      sma20: null,
      sma50: null,
      volumeRatio: (1 + Math.random()).toFixed(1)
    };
  }

  const closes = historicalData.map(d => d.close);
  const volumes = historicalData.map(d => d.volume);

  // Simple Moving Average
  const sma20 = closes.length >= 20 ? 
    closes.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;
  
  const sma50 = closes.length >= 50 ? 
    closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null;

  // RSI berekening (simplified)
  const rsi = calculateRSI(closes);
  
  // Trend analyse
  const trend = analyzeTrend(closes);
  
  // Volume ratio
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentVolume = volumes[volumes.length - 1];
  const volumeRatio = currentVolume / avgVolume;

  return {
    rsi: rsi.toFixed(1),
    trend: trend,
    sma20: sma20 ? sma20.toFixed(2) : null,
    sma50: sma50 ? sma50.toFixed(2) : null,
    volumeRatio: volumeRatio.toFixed(1)
  };
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50 + Math.random() * 40;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function analyzeTrend(prices) {
  if (prices.length < 10) return 'NEUTRAL';
  
  const recent = prices.slice(-10);
  const older = prices.slice(-20, -10);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const trendStrength = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (trendStrength > 2) return 'STRONG_UP';
  if (trendStrength > 0.5) return 'UP';
  if (trendStrength < -2) return 'STRONG_DOWN';
  if (trendStrength < -0.5) return 'DOWN';
  return 'NEUTRAL';
}

function generateSmartAnalysis(stockInfo, technical) {
  let fundamentalScore = 50;
  let technicalScore = 50;
  const reasoning = [];

  // Fundamentele analyse
  if (stockInfo.pe && stockInfo.pe < 15) {
    fundamentalScore += 15;
    reasoning.push(`Lage P/E ratio (${stockInfo.pe.toFixed(1)}) suggereert ondergewaardeerd`);
  } else if (stockInfo.pe && stockInfo.pe > 30) {
    fundamentalScore -= 10;
    reasoning.push(`Hoge P/E ratio (${stockInfo.pe.toFixed(1)}) kan overgewaardeerd betekenen`);
  }

  if (stockInfo.changePercent > 2) {
    fundamentalScore += 10;
    reasoning.push(`Sterke dagelijkse winst van ${stockInfo.changePercent.toFixed(2)}%`);
  } else if (stockInfo.changePercent < -2) {
    fundamentalScore -= 10;
    reasoning.push(`Dagelijks verlies van ${stockInfo.changePercent.toFixed(2)}%`);
  }

  // Technische analyse
  const rsi = parseFloat(technical.rsi) || 50;
  if (rsi < 30) {
    technicalScore += 20;
    reasoning.push(`RSI van ${rsi.toFixed(1)} toont oversold conditie (koop kans)`);
  } else if (rsi > 70) {
    technicalScore -= 15;
    reasoning.push(`RSI van ${rsi.toFixed(1)} toont overbought conditie`);
  }

  // Trend analyse
  switch (technical.trend) {
    case 'STRONG_UP':
      technicalScore += 15;
      reasoning.push('Sterke opwaartse trend gedetecteerd');
      break;
    case 'UP':
      technicalScore += 8;
      reasoning.push('Positieve prijstrend');
      break;
    case 'STRONG_DOWN':
      technicalScore -= 15;
      reasoning.push('Sterke neerwaartse trend');
      break;
    case 'DOWN':
      technicalScore -= 8;
      reasoning.push('Negatieve prijstrend');
      break;
    default:
      reasoning.push('Neutrale markttrend');
  }

  // Overall score
  const overallScore = Math.round((fundamentalScore * 0.4) + (technicalScore * 0.6));
  
  let recommendation;
  let confidence;
  
  if (overallScore >= 70) {
    recommendation = 'BUY';
    confidence = Math.min(90, overallScore + 5);
  } else if (overallScore >= 55) {
    recommendation = 'HOLD';
    confidence = Math.max(60, overallScore);
  } else {
    recommendation = 'SELL';
    confidence = Math.min(90, 100 - overallScore + 5);
  }

  return {
    recommendation,
    confidence: Math.round(confidence),
    reasoning: reasoning.slice(0, 4),
    fundamentalScore: Math.round(fundamentalScore),
    technicalScore: Math.round(technicalScore),
    overallScore: Math.round(overallScore)
  };
}

// Slimme analyse MET nieuws sentiment
async function generateSmartAnalysisWithNews(stockInfo, technical, newsData) {
  let fundamentalScore = 50;
  let technicalScore = 50;
  let newsScore = newsData.summary.overallSentiment || 50;
  const reasoning = [];

  // Fundamentele analyse
  if (stockInfo.pe && stockInfo.pe < 15) {
    fundamentalScore += 15;
    reasoning.push(`Lage P/E ratio (${stockInfo.pe.toFixed(1)}) suggereert ondergewaardeerd`);
  } else if (stockInfo.pe && stockInfo.pe > 30) {
    fundamentalScore -= 10;
    reasoning.push(`Hoge P/E ratio (${stockInfo.pe.toFixed(1)}) kan overgewaardeerd betekenen`);
  }

  if (stockInfo.changePercent > 2) {
    fundamentalScore += 10;
    reasoning.push(`Sterke dagelijkse winst van ${stockInfo.changePercent.toFixed(2)}%`);
  } else if (stockInfo.changePercent < -2) {
    fundamentalScore -= 10;
    reasoning.push(`Dagelijks verlies van ${stockInfo.changePercent.toFixed(2)}%`);
  }

  // Technische analyse
  const rsi = parseFloat(technical.rsi) || 50;
  if (rsi < 30) {
    technicalScore += 20;
    reasoning.push(`RSI van ${rsi.toFixed(1)} toont oversold conditie (koop kans)`);
  } else if (rsi > 70) {
    technicalScore -= 15;
    reasoning.push(`RSI van ${rsi.toFixed(1)} toont overbought conditie`);
  }

  // Trend analyse
  switch (technical.trend) {
    case 'STRONG_UP':
      technicalScore += 15;
      reasoning.push('Sterke opwaartse trend gedetecteerd');
      break;
    case 'UP':
      technicalScore += 8;
      reasoning.push('Positieve prijstrend');
      break;
    case 'STRONG_DOWN':
      technicalScore -= 15;
      reasoning.push('Sterke neerwaartse trend');
      break;
    case 'DOWN':
      technicalScore -= 8;
      reasoning.push('Negatieve prijstrend');
      break;
    default:
      reasoning.push('Neutrale markttrend');
  }

  // NIEUWS SENTIMENT ANALYSE
  if (newsScore > 70) {
    reasoning.push(`Zeer positief nieuws sentiment (${newsScore}%) ondersteunt bullish outlook`);
  } else if (newsScore > 60) {
    reasoning.push(`Positief nieuws sentiment (${newsScore}%) is gunstig`);
  } else if (newsScore < 40) {
    reasoning.push(`Negatief nieuws sentiment (${newsScore}%) creëert zorgen`);
  } else if (newsScore < 30) {
    reasoning.push(`Zeer negatief nieuws sentiment (${newsScore}%) suggereert voorzichtigheid`);
  } else {
    reasoning.push(`Neutraal nieuws sentiment (${newsScore}%)`);
  }

  // Overall score met nieuws sentiment
  const overallScore = Math.round((fundamentalScore * 0.3) + (technicalScore * 0.4) + (newsScore * 0.3));
  
  let recommendation;
  let confidence;
  
  if (overallScore >= 75) {
    recommendation = 'STRONG BUY';
    confidence = Math.min(95, overallScore + 5);
  } else if (overallScore >= 65) {
    recommendation = 'BUY';
    confidence = Math.min(90, overallScore + 5);
  } else if (overallScore >= 55) {
    recommendation = 'HOLD';
    confidence = Math.max(60, overallScore);
  } else if (overallScore >= 35) {
    recommendation = 'SELL';
    confidence = Math.min(90, 100 - overallScore + 5);
  } else {
    recommendation = 'STRONG SELL';
    confidence = Math.min(95, 100 - overallScore + 10);
  }

  // 🤖 MACHINE LEARNING ADJUSTMENT
  const mlAdjustedConfidence = mlDatabase.adjustConfidenceWithML(confidence);
  const stockPerformance = mlDatabase.getStockSpecificPerformance(stockInfo.symbol);
  
  // Add ML insights to reasoning
  const mlMetrics = mlDatabase.getPerformanceMetrics();
  if (mlMetrics.totalPredictions > 10) {
    reasoning.push(`🤖 AI track record: ${mlMetrics.accuracyPercent}% accuracy over ${mlMetrics.totalPredictions} voorspellingen`);
  }
  
  if (stockPerformance && stockPerformance.predictions > 3) {
    reasoning.push(`📊 Voor ${stockInfo.symbol}: ${stockPerformance.accuracyPercent}% accuracy in ${stockPerformance.predictions} analyses`);
  }

  const analysisResult = {
    recommendation,
    confidence: Math.round(mlAdjustedConfidence),
    reasoning: reasoning.slice(0, 6), // Max 6 redenen
    fundamentalScore: Math.round(fundamentalScore),
    technicalScore: Math.round(technicalScore),
    newsScore: Math.round(newsScore),
    overallScore: Math.round(overallScore),
    mlMetrics: {
      totalPredictions: mlMetrics.totalPredictions,
      accuracy: mlMetrics.accuracyPercent,
      confidenceAdjustment: mlMetrics.confidenceCalibration.toFixed(2)
    }
  };

  // Store prediction for future evaluation
  await mlDatabase.storePrediction({
    symbol: stockInfo.symbol,
    recommendation: analysisResult.recommendation,
    confidence: analysisResult.confidence,
    currentPrice: stockInfo.price,
    reasoning: analysisResult.reasoning,
    technicalScore: analysisResult.technicalScore,
    fundamentalScore: analysisResult.fundamentalScore,
    newsScore: analysisResult.newsScore,
    overallScore: analysisResult.overallScore
  });

  return analysisResult;
}

function extractStockSymbol(text) {
  const upperText = text.toUpperCase();
  
  const stocks = {
    'APPLE': 'AAPL', 'AAPL': 'AAPL',
    'MICROSOFT': 'MSFT', 'MSFT': 'MSFT',
    'TESLA': 'TSLA', 'TSLA': 'TSLA',
    'GOOGLE': 'GOOGL', 'GOOGL': 'GOOGL', 'ALPHABET': 'GOOGL',
    'AMAZON': 'AMZN', 'AMZN': 'AMZN',
    'META': 'META', 'FACEBOOK': 'META',
    'NVIDIA': 'NVDA', 'NVDA': 'NVDA',
    'NETFLIX': 'NFLX', 'NFLX': 'NFLX',
    'COCA COLA': 'KO', 'COKE': 'KO', 'KO': 'KO',
    'DISNEY': 'DIS', 'DIS': 'DIS'
  };
  
  for (let [name, symbol] of Object.entries(stocks)) {
    if (upperText.includes(name)) {
      return symbol;
    }
  }
  
  const symbolMatch = upperText.match(/\b[A-Z]{2,5}\b/);
  return symbolMatch ? symbolMatch[0] : null;
}

app.listen(PORT, () => {
  console.log(`🚀 Server draait met ECHTE Yahoo Finance data!`);
  console.log(`📊 http://localhost:${PORT}`);
  console.log(`💹 Probeer: http://localhost:${PORT}/api/chart/AAPL`);
  console.log('');
  console.log('🎯 Systeem probeert eerst echte data, dan fallback naar test data');
});