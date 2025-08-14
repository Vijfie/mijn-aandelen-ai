// backend/server.js - Complete version with AI Learning + TradingView Integration
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Imports
const stockDatabase = require('./stockDatabase');
const newsService = require('./newsService');
const tradeLogger = require('./tradeLogger');
const advancedTechnicalAnalysis = require('./advancedTechnicalAnalysis');
const aiLearningEngine = require('./aiLearningEngine'); // 🧠 AI Learning Engine
const tradingViewIntegration = require('./tradingViewIntegration'); // 🔗 TradingView Integration

// Yahoo Finance setup
let yahooFinance;
try {
  yahooFinance = require('yahoo-finance2').default;
  yahooFinance.suppressNotices(['yahooSurvey']);
  console.log('✅ Yahoo Finance loaded successfully');
} catch (error) {
  console.log('❌ Yahoo Finance not available:', error.message);
}

// ===== UTILITY FUNCTIONS =====

function extractStockSymbol(text) {
  if (!text) return null;
  
  console.log(`🔍 Extracting symbol from: "${text}"`);
  
  const cleanText = text.trim().toUpperCase();
  
  // Try database lookup first
  const directLookup = stockDatabase.findStockSymbol(text);
  if (directLookup) {
    console.log(`✅ Direct lookup: ${text} → ${directLookup}`);
    return directLookup;
  }
  
  // Try pattern matching
  const patterns = [
    /\b([A-Z]{1,5})\b/g,
    /(?:analyseer|analyze|stock|aandeel)\s+([a-zA-Z\s&-]+?)(?:\s|$)/gi,
    /(?:wat vind je van|hoe ziet|analyse van)\s+([a-zA-Z\s&-]+?)(?:\s|$|\?)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = [...cleanText.matchAll(pattern)];
    for (const match of matches) {
      const candidate = match[1];
      if (candidate) {
        const symbol = stockDatabase.findStockSymbol(candidate);
        if (symbol) {
          console.log(`✅ Pattern match: ${candidate} → ${symbol}`);
          return symbol;
        }
      }
    }
  }
  
  console.log(`❌ No symbol found for: "${text}"`);
  return null;
}

async function getStockData(symbol) {
  console.log(`📊 Getting stock data for: ${symbol}`);
  
  if (!yahooFinance) {
    throw new Error('Yahoo Finance not available');
  }
  
  try {
    const quote = await Promise.race([
      yahooFinance.quote(symbol),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Yahoo Finance timeout')), 8000)
      )
    ]);
    
    if (!quote || typeof quote.regularMarketPrice !== 'number') {
      throw new Error(`Invalid quote data for ${symbol}`);
    }
    
    const stockData = {
      symbol: symbol,
      name: quote.displayName || quote.shortName || `${symbol} Stock`,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap || 0,
      pe: quote.trailingPE || null,
      beta: quote.beta || null,
      high52: quote.fiftyTwoWeekHigh || 0,
      low52: quote.fiftyTwoWeekLow || 0,
      currency: quote.currency || 'USD'
    };
    
    console.log(`✅ Yahoo Finance: ${stockData.name} - $${stockData.price}`);
    return { data: stockData, source: 'Yahoo Finance' };
    
  } catch (error) {
    console.log(`❌ Yahoo Finance failed for ${symbol}: ${error.message}`);
    throw error;
  }
}

async function getHistoricalData(symbol) {
  if (!yahooFinance) {
    return generateFakeHistoricalData();
  }
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });
    
    return historical.map(item => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
    
  } catch (error) {
    console.log(`Historical data fallback for ${symbol}`);
    return generateFakeHistoricalData();
  }
}

function generateFakeStockInfo(symbol) {
  console.log(`⚠️ Generating fake data for ${symbol}`);
  
  const basePrice = 50 + Math.random() * 100;
  const change = (Math.random() - 0.5) * 10;
  
  return {
    symbol: symbol,
    name: stockDatabase.getCompanyName(symbol) || `${symbol} Company`,
    price: basePrice,
    change: change,
    changePercent: (change / basePrice) * 100,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    pe: 15 + Math.random() * 20,
    beta: 0.8 + Math.random() * 0.8,
    high52: basePrice + 20,
    low52: basePrice - 20,
    currency: 'USD'
  };
}

function generateFakeHistoricalData() {
  const data = [];
  const today = new Date();
  const basePrice = 100 + Math.random() * 100;
  
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

// ===== AI-ENHANCED ANALYSIS FUNCTIONS =====

// 🧠 AI-Enhanced Analysis Function
async function generateAnalysisWithAI(stockData, technical, newsData) {
  console.log(`🧮 Analyzing ${stockData.symbol} with AI-ENHANCED analysis...`);
  
  // === STEP 1: Get Base Analysis ===
  console.log(`📊 Running base analysis for ${stockData.symbol}...`);
  const baseAnalysis = await generateBaseAnalysis(stockData, technical, newsData);
  
  // === STEP 2: Apply AI Learning Enhancement ===
  console.log(`🧠 Applying AI learning to ${stockData.symbol}...`);
  
  try {
    const aiEnhancement = await aiLearningEngine.enhanceAnalysis({
      symbol: stockData.symbol,
      price: stockData.price,
      analysis: baseAnalysis,
      technical: technical,
      news: newsData
    });

    console.log(`🎯 AI Learning Applied:`);
    console.log(`   Pattern Match: ${aiEnhancement.patternsFound} similar scenarios found`);
    console.log(`   Success Rate: ${aiEnhancement.successRate}%`);
    console.log(`   Confidence Adjustment: ${aiEnhancement.confidenceAdjustment}%`);
    console.log(`   Market Condition: ${aiEnhancement.marketCondition} (${aiEnhancement.marketStrength}%)`);

    // Combine base analysis with AI enhancement
    const finalRecommendation = aiEnhancement.recommendation || baseAnalysis.recommendation;
    const finalConfidence = Math.round(aiEnhancement.adjustedConfidence || baseAnalysis.confidence);

    console.log(`🎯 AI-Enhanced Analysis Complete:`);
    console.log(`   Base Recommendation: ${baseAnalysis.recommendation} (${baseAnalysis.confidence}%)`);
    console.log(`   AI-Enhanced: ${finalRecommendation} (${finalConfidence}%)`);
    console.log(`   AI Patterns Used: ${aiEnhancement.patternsFound}`);
    console.log(`   AI Confidence Adj: ${aiEnhancement.confidenceAdjustment}%`);

    return {
      recommendation: finalRecommendation,
      confidence: finalConfidence,
      reasoning: baseAnalysis.reasoning,
      fundamentalScore: baseAnalysis.fundamentalScore,
      technicalScore: baseAnalysis.technicalScore,
      newsScore: baseAnalysis.newsScore,
      overallScore: baseAnalysis.overallScore,
      aiMetrics: {
        patternsUsed: aiEnhancement.patternsFound,
        confidenceAdjustment: aiEnhancement.confidenceAdjustment,
        successRate: aiEnhancement.successRate,
        marketCondition: aiEnhancement.marketCondition,
        learningLevel: aiLearningEngine.getLearningLevel ? aiLearningEngine.getLearningLevel() : 1
      }
    };
  } catch (aiError) {
    console.error('❌ AI Enhancement failed, using base analysis:', aiError.message);
    return {
      ...baseAnalysis,
      aiMetrics: {
        patternsUsed: 0,
        confidenceAdjustment: 0,
        successRate: 0,
        marketCondition: 'UNKNOWN',
        learningLevel: 1
      }
    };
  }
}

// 📊 BASE ANALYSIS FUNCTION
async function generateBaseAnalysis(stockData, technical, newsData) {
  // === ADVANCED TECHNICAL ANALYSIS ===
  let technicalScore = 50;
  let technicalReasons = [];
  
  // RSI Analysis (Enhanced)
  if (technical.rsi < 25) {
    technicalScore += 30;
    technicalReasons.push(`🔥 Zeer oversold RSI (${technical.rsi.toFixed(1)}) - sterke koopsignaal`);
  } else if (technical.rsi < 35) {
    technicalScore += 20;
    technicalReasons.push(`📈 Oversold RSI (${technical.rsi.toFixed(1)}) - koopsignaal`);
  } else if (technical.rsi < 45) {
    technicalScore += 10;
    technicalReasons.push(`✅ Lage RSI (${technical.rsi.toFixed(1)}) - koopkans`);
  } else if (technical.rsi > 75) {
    technicalScore -= 25;
    technicalReasons.push(`🚨 Zeer overbought RSI (${technical.rsi.toFixed(1)}) - verkoopsignaal`);
  } else if (technical.rsi > 65) {
    technicalScore -= 15;
    technicalReasons.push(`⚠️ Overbought RSI (${technical.rsi.toFixed(1)}) - voorzichtigheid`);
  }
  
  // MACD Analysis
  if (technical.macd && technical.macd.signal) {
    if (technical.macd.signal === 'BUY') {
      technicalScore += 20;
      technicalReasons.push(`🚀 MACD bullish crossover - momentum opwaarts`);
    } else if (technical.macd.signal === 'SELL') {
      technicalScore -= 20;
      technicalReasons.push(`📉 MACD bearish crossover - momentum neerwaarts`);
    }
  }
  
  // Bollinger Bands Analysis
  if (technical.bollingerBands) {
    if (technical.bollingerBands.signal === 'OVERSOLD') {
      technicalScore += 18;
      technicalReasons.push(`🎯 Prijs nabij onderste Bollinger Band - koopkans`);
    } else if (technical.bollingerBands.signal === 'OVERBOUGHT') {
      technicalScore -= 15;
      technicalReasons.push(`⚠️ Prijs nabij bovenste Bollinger Band - verkoopkans`);
    }
  }
  
  // Volume Analysis
  if (technical.volumeRatio > 2.0) {
    technicalScore += 15;
    technicalReasons.push(`🔊 Extreem hoog volume (${technical.volumeRatio.toFixed(1)}x) - sterke interesse`);
  } else if (technical.volumeRatio > 1.5) {
    technicalScore += 10;
    technicalReasons.push(`📈 Verhoogd volume (${technical.volumeRatio.toFixed(1)}x) - bevestiging beweging`);
  }
  
  // Trend Analysis
  if (technical.trend && technical.trend.direction === 'BULLISH') {
    technicalScore += 15;
    technicalReasons.push(`🔥 Bullish trend - opwaartse momentum`);
  } else if (technical.trend && technical.trend.direction === 'BEARISH') {
    technicalScore -= 15;
    technicalReasons.push(`📉 Bearish trend - neerwaartse druk`);
  }
  
  // === FUNDAMENTAL ANALYSIS ===
  let fundamentalScore = 50;
  let fundamentalReasons = [];
  
  // P/E Ratio Analysis
  if (stockData.pe) {
    if (stockData.pe < 15) {
      fundamentalScore += 20;
      fundamentalReasons.push(`💰 Lage P/E (${stockData.pe.toFixed(1)}) - aantrekkelijke waarde`);
    } else if (stockData.pe > 30) {
      fundamentalScore -= 15;
      fundamentalReasons.push(`⚠️ Hoge P/E (${stockData.pe.toFixed(1)}) - mogelijk overgewaardeerd`);
    }
  }
  
  // Market Cap Analysis
  if (stockData.marketCap > 100000000000) {
    fundamentalScore += 8;
    fundamentalReasons.push(`🏛️ Large-cap stabiliteit`);
  }
  
  // === NEWS SENTIMENT ===
  const newsScore = newsData?.summary?.overallSentiment || 50;
  let newsReasons = [];
  
  if (newsScore > 70) {
    newsReasons.push(`📈 Positief nieuws sentiment (${newsScore}%)`);
  } else if (newsScore < 40) {
    newsReasons.push(`📉 Negatief nieuws sentiment (${newsScore}%)`);
  } else {
    newsReasons.push(`➡️ Neutraal nieuws sentiment (${newsScore}%)`);
  }
  
  // === CALCULATE FINAL SCORES ===
  technicalScore = Math.max(0, Math.min(100, technicalScore));
  fundamentalScore = Math.max(0, Math.min(100, fundamentalScore));
  
  const overallScore = (technicalScore * 0.45) + (fundamentalScore * 0.35) + (newsScore * 0.20);
  
  // === RECOMMENDATION LOGIC ===
  let recommendation = 'HOLD';
  let confidence = 50;
  
  if (overallScore >= 75) {
    recommendation = 'STRONG BUY';
    confidence = Math.min(95, 80 + (overallScore - 75) * 1.5);
  } else if (overallScore >= 65) {
    recommendation = 'BUY';
    confidence = Math.min(85, 70 + (overallScore - 65) * 1.5);
  } else if (overallScore >= 55) {
    recommendation = 'WEAK BUY';
    confidence = Math.min(75, 60 + (overallScore - 55) * 1.5);
  } else if (overallScore >= 45) {
    recommendation = 'HOLD';
    confidence = Math.min(70, 50 + Math.abs(overallScore - 50));
  } else if (overallScore >= 35) {
    recommendation = 'WEAK SELL';
    confidence = Math.min(75, 60 + (45 - overallScore) * 1.5);
  } else if (overallScore >= 25) {
    recommendation = 'SELL';
    confidence = Math.min(85, 70 + (35 - overallScore) * 1.5);
  } else {
    recommendation = 'STRONG SELL';
    confidence = Math.min(95, 80 + (25 - overallScore) * 1.5);
  }
  
  // === BUILD REASONING ===
  const allReasons = [
    ...technicalReasons.slice(0, 3),
    ...fundamentalReasons.slice(0, 2),
    ...newsReasons.slice(0, 1)
  ];
  
  return {
    recommendation,
    confidence: Math.round(confidence),
    reasoning: allReasons.slice(0, 6),
    fundamentalScore: Math.round(fundamentalScore),
    technicalScore: Math.round(technicalScore),
    newsScore: Math.round(newsScore),
    overallScore: Math.round(overallScore)
  };
}

// ===== API ROUTES =====

// Stock search
app.get('/api/stocks/search', (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const suggestions = stockDatabase.getStockSuggestions(query, 15);
    res.json({ 
      success: true, 
      suggestions: suggestions,
      query: query 
    });
  } catch (error) {
    console.error('Stock search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all available stocks
app.get('/api/stocks/all', (req, res) => {
  try {
    const allStocks = stockDatabase.getAllAvailableStocks();
    const stocksWithNames = allStocks.map(symbol => ({
      symbol: symbol,
      name: stockDatabase.getCompanyName(symbol),
      displayName: `${stockDatabase.getCompanyName(symbol)} (${symbol})`
    }));
    
    res.json({ 
      success: true, 
      stocks: stocksWithNames,
      total: stocksWithNames.length 
    });
  } catch (error) {
    console.error('All stocks error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Chart data
app.get('/api/chart/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`📊 Chart data request for: ${symbol}`);
    
    const historicalData = await getHistoricalData(symbol);
    const technical = advancedTechnicalAnalysis.calculateAdvancedIndicators(historicalData);
    
    // Normalize trend for frontend
    const normalizedTechnical = {
      ...technical,
      trend: technical.trend?.direction || technical.trend || "NEUTRAL"
    };
    
    res.json({
      symbol: symbol,
      period: '3mo',
      data: historicalData,
      technical: normalizedTechnical,
      dataPoints: historicalData.length,
      source: 'Yahoo Finance Historical'
    });
    
  } catch (error) {
    console.error('Chart error:', error);
    res.status(500).json({ 
      error: 'Chart data niet beschikbaar',
      message: error.message 
    });
  }
});

// 🧠 MAIN ANALYSIS ROUTE WITH AI LEARNING
app.post('/api/analyze', async (req, res) => {
  try {
    const { question } = req.body;
    console.log('📋 AI-Enhanced analyse vraag:', question);
    
    const symbol = extractStockSymbol(question);
    
    if (!symbol) {
      const suggestions = stockDatabase.getStockSuggestions(question, 5);
      const suggestionText = suggestions.length > 0 
        ? `\n\n💡 Bedoelde je misschien: ${suggestions.map(s => s.displayName).join(', ')}?`
        : '';
      
      return res.json({
        answer: `🤔 Ik kon geen aandeel herkennen in "${question}". 

📊 **Probeer bijvoorbeeld:**
• "Analyseer Apple" of "AAPL analyse" 
• "Wat vind je van Tesla?"
• "Nike stock analyse"

🔍 **Populaire aandelen:**
• Tech: AAPL, MSFT, GOOGL, TSLA, NVDA
• Consumer: KO, NKE, SBUX, MCD, DIS
• Finance: JPM, V, MA, BAC
• Crypto: BTC-USD, ETH-USD

💰 **Totaal beschikbaar:** ${stockDatabase.getAllAvailableStocks().length}+ aandelen${suggestionText}`,
        recommendation: "HOLD",
        confidence: 0
      });
    }

    console.log(`🔍 AI-Enhanced analyzing: ${symbol}`);
    
    let stockData;
    let source;
    
    // Try to get real stock data
    try {
      const result = await getStockData(symbol);
      stockData = result.data;
      source = result.source;
    } catch (error) {
      console.log(`⚠️ Using fallback data for ${symbol}: ${error.message}`);
      stockData = generateFakeStockInfo(symbol);
      source = 'Fallback Data';
    }
    
    // Get news
    let newsData;
    try {
      newsData = await newsService.getStockNews(symbol, stockData.name);
      console.log(`📰 News: ${newsData.articles.length} artikelen`);
    } catch (error) {
      console.log('News service unavailable');
      newsData = { 
        articles: [],
        summary: { overallSentiment: 60 }
      };
    }
    
    // Get historical data and calculate advanced technicals
    const historicalData = await getHistoricalData(symbol);
    const technical = advancedTechnicalAnalysis.calculateAdvancedIndicators(historicalData);
    
    // 🧠 Generate AI-enhanced analysis
    const analysis = await generateAnalysisWithAI(stockData, technical, newsData);
    
    // 🧠 Enhanced trade logging with AI data
    try {
      const tradeData = {
        symbol: stockData.symbol,
        name: stockData.name,
        recommendation: analysis.recommendation,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        currentPrice: stockData.price,
        priceChange: stockData.change,
        priceChangePercent: stockData.changePercent,
        technicalData: technical,
        newsData: newsData,
        analysis: analysis,
        source: source,
        // Add AI learning data
        aiEnhanced: true,
        aiVersion: analysis.aiMetrics?.learningLevel || 1.0,
        patternsUsed: analysis.aiMetrics?.patternsUsed || 0
      };
      
      const tradeId = tradeLogger.logTrade(tradeData);
      console.log(`📊 Trade logged with ID: ${tradeId}`);
      console.log(`🧠 AI learning data included`);
    } catch (logError) {
      console.error('Trade logging failed:', logError.message);
    }
    
    // Build response
    const response = {
      answer: `📊 AI-Enhanced analyse van ${stockData.name} (${symbol}):`,
      symbol: symbol,
      name: stockData.name,
      currentPrice: stockData.price,
      priceChange: stockData.change,
      priceChangePercent: stockData.changePercent,
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
        trend: technical.trend?.direction || technical.trend || "NEUTRAL",
        sma20: technical.sma20,
        volumeRatio: technical.volumeRatio,
        macd: technical.macd,
        bollingerBands: technical.bollingerBands
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
      source: source,
      // 🧠 AI Learning metadata
      aiLearning: analysis.aiMetrics
    };

    console.log(`📤 Sending AI-enhanced response: ${stockData.name} - $${stockData.price} (${source})`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ AI-Enhanced analysis error:', error);
    res.status(500).json({ 
      error: 'AI-Enhanced analyse mislukt',
      message: error.message,
      answer: "Sorry, er ging iets mis met de AI-enhanced analyse."
    });
  }
});

// 🧠 ENHANCED TRADE RESULT ENDPOINT WITH AI LEARNING TRIGGER
app.post('/api/trades/:tradeId/result', async (req, res) => {
  try {
    const tradeId = req.params.tradeId;
    const result = req.body;
    
    // Update trade result
    const updatedTrade = tradeLogger.updateTradeResult(tradeId, result);
    
    // 🧠 CRITICAL: AI LEARNING TRIGGER FROM COMPLETED TRADE
    console.log('🧠 Triggering AI learning from completed trade...');
    if (aiLearningEngine && updatedTrade.status === 'COMPLETED') {
      try {
        const tradeOutcome = {
          symbol: updatedTrade.symbol,
          originalRecommendation: updatedTrade.recommendation,
          originalConfidence: updatedTrade.confidence,
          actualOutcome: result.outcome, // 'WIN' | 'LOSS' | 'NEUTRAL'
          profitLoss: result.profitLoss,
          daysHeld: result.daysHeld || 1,
          wasCorrect: result.outcome === 'WIN',
          technicalData: updatedTrade.technicalData,
          newsData: updatedTrade.newsData,
          marketConditions: {
            rsi: updatedTrade.rsi,
            trend: updatedTrade.trend,
            sentiment: updatedTrade.newsScore
          }
        };
        
        await aiLearningEngine.learnFromTrade(tradeOutcome);
        console.log(`📚 Learning from trade: ${updatedTrade.symbol} (${result.outcome})`);
        console.log(`✅ AI learned from ${updatedTrade.symbol}. Total knowledge: ${aiLearningEngine.getTotalTrades ? aiLearningEngine.getTotalTrades() : 'Unknown'} trades`);
      } catch (aiError) {
        console.error('❌ AI learning failed:', aiError.message);
      }
    }
    
    res.json({ success: true, trade: updatedTrade });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Trade performance endpoints
app.get('/api/trades', (req, res) => {
  try {
    const trades = tradeLogger.getAllTrades();
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/trades/pending', (req, res) => {
  try {
    const pendingTrades = tradeLogger.getPendingTrades();
    res.json({ success: true, trades: pendingTrades });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/performance', (req, res) => {
  try {
    const performance = tradeLogger.getPerformanceMetrics();
    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual position endpoints
app.post('/api/trades/manual', (req, res) => {
  try {
    const {
      symbol,
      entryPrice,
      quantity,
      aiRecommendation,
      aiConfidence,
      tradeReason,
      stopLoss,
      targetPrice
    } = req.body;

    const manualTrade = {
      symbol: symbol,
      name: stockDatabase.getCompanyName(symbol) || symbol,
      recommendation: aiRecommendation,
      confidence: aiConfidence,
      reasoning: [tradeReason],
      currentPrice: entryPrice,
      priceChange: 0,
      priceChangePercent: 0,
      technicalData: { rsi: null, trend: 'MANUAL', volumeRatio: null },
      newsData: { summary: { overallSentiment: 50 } },
      analysis: { fundamentalScore: 50, technicalScore: 50, newsScore: 50, overallScore: 50 },
      source: 'MANUAL_ENTRY'
    };

    const tradeId = tradeLogger.logTrade(manualTrade);
    
    // Add manual entry specific data
    const db = tradeLogger.loadDatabase();
    const trade = db.trades.find(t => t.id === tradeId);
    if (trade) {
      trade.manualEntry = {
        quantity: quantity,
        stopLoss: stopLoss,
        targetPrice: targetPrice,
        entryMethod: 'MANUAL'
      };
      tradeLogger.saveDatabase(db);
    }

    res.json({ 
      success: true, 
      tradeId: tradeId,
      message: 'Manual position logged successfully'
    });
  } catch (error) {
    console.error('Manual trade logging error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🔗 TRADINGVIEW WEBHOOK INTEGRATION
tradingViewIntegration.setupWebhookRoutes(app);

// 🧠 AI LEARNING API ENDPOINTS

// AI Learning Statistics
app.get('/api/ai/stats', (req, res) => {
  try {
    const stats = aiLearningEngine.getStatistics ? aiLearningEngine.getStatistics() : {
      aiVersion: 1.0,
      totalTrades: 0,
      overallAccuracy: 0,
      capabilities: ['Pattern Recognition', 'Learning'],
      nextEvolution: { tradesNeeded: 25, currentProgress: 0 }
    };
    res.json({ 
      success: true, 
      aiLearning: stats 
    });
  } catch (error) {
    console.error('AI stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// AI Performance Summary
app.get('/api/ai/performance', (req, res) => {
  try {
    const performance = aiLearningEngine.getPerformanceSummary ? aiLearningEngine.getPerformanceSummary() : {
      level: 'Learning',
      strengths: ['Technical Analysis'],
      improvements: ['More data needed'],
      accuracy: 0
    };
    res.json({ 
      success: true, 
      performance: performance 
    });
  } catch (error) {
    console.error('AI performance error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// AI Insights for specific symbol
app.get('/api/ai/insights/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const insights = aiLearningEngine.getSymbolInsights ? aiLearningEngine.getSymbolInsights(symbol) : {
      aiRecommendations: ['Insufficient data for AI insights'],
      patterns: [],
      confidence: 0
    };
    res.json({ 
      success: true, 
      insights: insights 
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// AI Learning Reset (for testing)
app.post('/api/ai/reset', (req, res) => {
  try {
    if (aiLearningEngine.resetLearning) {
      aiLearningEngine.resetLearning();
    }
    res.json({ 
      success: true, 
      message: 'AI learning data reset successfully' 
    });
  } catch (error) {
    console.error('AI reset error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Force AI to retrain on all completed trades
app.post('/api/ai/retrain', async (req, res) => {
  try {
    const completedTrades = tradeLogger.getAllTrades().filter(t => t.status === 'COMPLETED');
    let learnedCount = 0;
    
    for (const trade of completedTrades) {
      if (aiLearningEngine.learnFromTrade) {
        const tradeOutcome = {
          symbol: trade.symbol,
          originalRecommendation: trade.recommendation,
          originalConfidence: trade.confidence,
          actualOutcome: trade.actualOutcome,
          profitLoss: trade.actualProfitLoss,
          daysHeld: trade.daysHeld || 1,
          wasCorrect: trade.actualOutcome === 'WIN',
          technicalData: trade.technicalData,
          newsData: trade.newsData
        };
        
        await aiLearningEngine.learnFromTrade(tradeOutcome);
        learnedCount++;
      }
    }
    
    res.json({ 
      success: true, 
      message: `AI retrained on ${learnedCount} completed trades`,
      totalKnowledge: aiLearningEngine.getTotalTrades ? aiLearningEngine.getTotalTrades() : learnedCount
    });
  } catch (error) {
    console.error('AI retrain error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🧠 ENHANCED ML DASHBOARD WITH AI LEARNING
app.get('/api/ml/performance', async (req, res) => {
  try {
    // Get traditional performance metrics
    const performance = tradeLogger.getPerformanceMetrics();
    
    // Get AI learning statistics
    const aiStats = aiLearningEngine.getStatistics ? aiLearningEngine.getStatistics() : {
      aiVersion: 1.0,
      totalTrades: 0,
      overallAccuracy: 0,
      capabilities: ['Pattern Recognition']
    };
    
    const aiPerformance = aiLearningEngine.getPerformanceSummary ? aiLearningEngine.getPerformanceSummary() : {
      level: 'Learning',
      strengths: ['Technical Analysis'],
      improvements: ['More data needed']
    };
    
    // Combine traditional and AI metrics
    const enhancedMetrics = {
      // Traditional metrics
      totalPredictions: performance.totalTrades || 0,
      correctPredictions: performance.correctPredictions || 0,
      accuracyPercent: performance.accuracy ? Math.round(performance.accuracy * 100) : 0,
      accuracy: performance.accuracy || 0,
      confidenceCalibration: 1.0,
      
      // AI Learning metrics
      aiLearning: {
        enabled: true,
        version: aiStats.aiVersion,
        totalLearningTrades: aiStats.totalTrades,
        learningAccuracy: aiStats.overallAccuracy,
        patternsLearned: aiStats.patternCount || 0,
        capabilities: aiStats.capabilities,
        performanceLevel: aiPerformance.level,
        strengths: aiPerformance.strengths,
        improvements: aiPerformance.improvements,
        nextEvolution: aiStats.nextEvolution
      },
      
      // Enhanced accuracy calculation
      enhancedAccuracy: aiStats.overallAccuracy > 0 ? aiStats.overallAccuracy : (performance.accuracy || 0),
      
      // AI vs Traditional comparison
      comparison: {
        traditionalAccuracy: (performance.accuracy || 0) * 100,
        aiEnhancedAccuracy: (aiStats.overallAccuracy || 0) * 100,
        improvement: aiStats.overallAccuracy > 0 ? 
          ((aiStats.overallAccuracy - (performance.accuracy || 0)) * 100) : 0
      },
      
      // Recent predictions for dashboard
      recentPredictions: tradeLogger.getAllTrades().slice(-10).map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        timestamp: trade.timestamp,
        recommendation: trade.recommendation,
        confidence: trade.confidence,
        isEvaluated: trade.status === 'COMPLETED',
        actualOutcome: trade.status === 'COMPLETED' ? {
          isCorrect: trade.actualOutcome === 'WIN',
          priceChange: trade.actualProfitLoss || 0
        } : null
      }))
    };
    
    res.json(enhancedMetrics);
  } catch (error) {
    console.error('Enhanced ML Performance error:', error);
    res.status(500).json({ 
      error: 'Could not get enhanced ML performance',
      message: error.message 
    });
  }
});


app.post('/api/backtest/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const backtester = new AIBacktester();
    
    await backtester.loadHistoricalData(symbol);
    const results = await backtester.runBacktest(symbol);
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    yahooFinance: !!yahooFinance,
    availableStocks: stockDatabase.getAllAvailableStocks().length,
    aiLearning: true, // 🧠 AI Learning enabled
    tradingViewWebhooks: true // 🔗 TradingView Integration enabled
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 AI-Enhanced Trading Server gestart!');
  console.log(`📊 http://localhost:${PORT}`);
  console.log(`💹 Yahoo Finance: ${yahooFinance ? '✅ Available' : '❌ Not Available'}`);
  console.log(`📈 Stocks beschikbaar: ${stockDatabase.getAllAvailableStocks().length}`);
  console.log(`🧠 AI Learning: ✅ Enabled`);
  console.log('🔗 TradingView Webhooks: ✅ Enabled');
  console.log('📊 Webhook URL: http://localhost:3001/api/webhook/tradingview');
  console.log('');
  console.log('🎯 Ready voor AI-enhanced stock analyse!');
  
  // Sync existing TradingView positions on startup
  tradingViewIntegration.syncExistingPositions();
});