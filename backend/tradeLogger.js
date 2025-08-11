// backend/tradeLogger.js
const fs = require('fs');
const path = require('path');

class TradeLogger {
  constructor() {
    this.dbPath = path.join(__dirname, 'trades.json');
    this.performanceDbPath = path.join(__dirname, 'performance.json');
    this.initializeDatabase();
  }

  // Initialize database files
  initializeDatabase() {
    // Initialize trades database
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ trades: [] }, null, 2));
    }
    
    // Initialize performance database
    if (!fs.existsSync(this.performanceDbPath)) {
      const initialPerformance = {
        totalTrades: 0,
        correctPredictions: 0,
        accuracy: 0,
        totalProfitLoss: 0,
        avgProfitLoss: 0,
        bestTrade: null,
        worstTrade: null,
        bySymbol: {},
        byConfidence: {},
        byTrend: {},
        byRSI: {},
        lastUpdated: new Date()
      };
      fs.writeFileSync(this.performanceDbPath, JSON.stringify(initialPerformance, null, 2));
    }
  }

  // Log een nieuwe trade recommendation
  logTrade(analysisData) {
    const tradeId = this.generateTradeId();
    
    const trade = {
      id: tradeId,
      timestamp: new Date(),
      symbol: analysisData.symbol,
      companyName: analysisData.name,
      
      // AI Prediction Data
      recommendation: analysisData.recommendation,
      confidence: analysisData.confidence,
      aiReasoning: analysisData.reasoning,
      
      // Market Conditions at time of prediction
      currentPrice: analysisData.currentPrice,
      priceChange: analysisData.priceChange,
      priceChangePercent: analysisData.priceChangePercent,
      
      // Technical Indicators
      rsi: analysisData.technicalData?.rsi,
      trend: analysisData.technicalData?.trend,
      volumeRatio: analysisData.technicalData?.volumeRatio,
      
      // Sentiment Data
      newsScore: analysisData.newsData?.summary?.overallSentiment || 50,
      
      // AI Scores
      fundamentalScore: analysisData.analysis?.fundamental_score,
      technicalScore: analysisData.analysis?.technical_score,
      overallScore: analysisData.analysis?.overall_score,
      
      // Results (to be filled later)
      actualOutcome: null, // 'WIN' | 'LOSS' | 'NEUTRAL'
      actualProfitLoss: null, // percentage
      daysHeld: null,
      closePrice: null,
      resultEnteredAt: null,
      resultEnteredBy: 'manual', // 'manual' | 'automatic'
      
      // Status
      status: 'PENDING', // 'PENDING' | 'COMPLETED' | 'CANCELLED'
      notes: ''
    };

    // Save trade to database
    const db = this.loadDatabase();
    db.trades.push(trade);
    this.saveDatabase(db);
    
    console.log(`📊 Trade logged: ${trade.symbol} - ${trade.recommendation} (${trade.confidence}%)`);
    return tradeId;
  }

  // Update trade result
  updateTradeResult(tradeId, result) {
    const db = this.loadDatabase();
    const tradeIndex = db.trades.findIndex(t => t.id === tradeId);
    
    if (tradeIndex === -1) {
      throw new Error(`Trade with ID ${tradeId} not found`);
    }
    
    const trade = db.trades[tradeIndex];
    
    // Update trade with results
    trade.actualOutcome = result.outcome; // 'WIN' | 'LOSS' | 'NEUTRAL'
    trade.actualProfitLoss = result.profitLoss;
    trade.daysHeld = result.daysHeld || this.calculateDaysHeld(trade.timestamp);
    trade.closePrice = result.closePrice;
    trade.resultEnteredAt = new Date();
    trade.notes = result.notes || '';
    trade.status = 'COMPLETED';
    
    // Save updated trade
    this.saveDatabase(db);
    
    // Update performance metrics
    this.updatePerformanceMetrics();
    
    console.log(`✅ Trade result updated: ${trade.symbol} - ${result.outcome} (${result.profitLoss}%)`);
    return trade;
  }

  // Get all trades
  getAllTrades() {
    const db = this.loadDatabase();
    return db.trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get pending trades (waiting for results)
  getPendingTrades() {
    const db = this.loadDatabase();
    return db.trades.filter(t => t.status === 'PENDING');
  }

  // Get completed trades
  getCompletedTrades() {
    const db = this.loadDatabase();
    return db.trades.filter(t => t.status === 'COMPLETED');
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return JSON.parse(fs.readFileSync(this.performanceDbPath, 'utf8'));
  }

  // Update performance metrics
  updatePerformanceMetrics() {
    const completedTrades = this.getCompletedTrades();
    
    if (completedTrades.length === 0) {
      return {
        totalTrades: 0,
        accuracy: 0,
        avgProfitLoss: 0,
        totalProfitLoss: 0
      };
    }
    
    const performance = {
      totalTrades: completedTrades.length,
      correctPredictions: 0,
      totalProfitLoss: 0,
      winningTrades: 0,
      losingTrades: 0,
      neutralTrades: 0,
      avgProfitLoss: 0,
      bestTrade: null,
      worstTrade: null,
      bySymbol: {},
      byConfidence: this.analyzeByConfidence(completedTrades),
      byTrend: this.analyzeByTrend(completedTrades),
      byRSI: this.analyzeByRSI(completedTrades),
      recentPerformance: this.getRecentPerformance(completedTrades),
      lastUpdated: new Date()
    };
    
    // Calculate basic metrics
    completedTrades.forEach(trade => {
      const isCorrect = this.isTradeCorrect(trade);
      const profitLoss = trade.actualProfitLoss || 0;
      
      if (isCorrect) performance.correctPredictions++;
      performance.totalProfitLoss += profitLoss;
      
      if (trade.actualOutcome === 'WIN') performance.winningTrades++;
      else if (trade.actualOutcome === 'LOSS') performance.losingTrades++;
      else performance.neutralTrades++;
      
      // Track best and worst trades
      if (!performance.bestTrade || profitLoss > performance.bestTrade.actualProfitLoss) {
        performance.bestTrade = trade;
      }
      if (!performance.worstTrade || profitLoss < performance.worstTrade.actualProfitLoss) {
        performance.worstTrade = trade;
      }
      
      // By symbol analysis
      if (!performance.bySymbol[trade.symbol]) {
        performance.bySymbol[trade.symbol] = {
          total: 0,
          correct: 0,
          totalProfitLoss: 0,
          accuracy: 0
        };
      }
      performance.bySymbol[trade.symbol].total++;
      if (isCorrect) performance.bySymbol[trade.symbol].correct++;
      performance.bySymbol[trade.symbol].totalProfitLoss += profitLoss;
      performance.bySymbol[trade.symbol].accuracy = 
        (performance.bySymbol[trade.symbol].correct / performance.bySymbol[trade.symbol].total) * 100;
    });
    
    performance.accuracy = (performance.correctPredictions / performance.totalTrades) * 100;
    performance.avgProfitLoss = performance.totalProfitLoss / performance.totalTrades;
    
    fs.writeFileSync(this.performanceDbPath, JSON.stringify(performance, null, 2));
    return performance;
  }

  // Analyze performance by confidence levels
  analyzeByConfidence(trades) {
    const confidenceRanges = {
      '90-100%': { total: 0, correct: 0, avgProfitLoss: 0, totalProfitLoss: 0 },
      '80-89%': { total: 0, correct: 0, avgProfitLoss: 0, totalProfitLoss: 0 },
      '70-79%': { total: 0, correct: 0, avgProfitLoss: 0, totalProfitLoss: 0 },
      '60-69%': { total: 0, correct: 0, avgProfitLoss: 0, totalProfitLoss: 0 },
      '50-59%': { total: 0, correct: 0, avgProfitLoss: 0, totalProfitLoss: 0 }
    };
    
    trades.forEach(trade => {
      const confidence = trade.confidence;
      let range;
      
      if (confidence >= 90) range = '90-100%';
      else if (confidence >= 80) range = '80-89%';
      else if (confidence >= 70) range = '70-79%';
      else if (confidence >= 60) range = '60-69%';
      else range = '50-59%';
      
      confidenceRanges[range].total++;
      if (this.isTradeCorrect(trade)) confidenceRanges[range].correct++;
      confidenceRanges[range].totalProfitLoss += trade.actualProfitLoss || 0;
    });
    
    // Calculate averages
    Object.keys(confidenceRanges).forEach(range => {
      const data = confidenceRanges[range];
      data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      data.avgProfitLoss = data.total > 0 ? data.totalProfitLoss / data.total : 0;
    });
    
    return confidenceRanges;
  }

  // Analyze by trend
  analyzeByTrend(trades) {
    const trendAnalysis = {};
    
    trades.forEach(trade => {
      const trend = trade.trend || 'UNKNOWN';
      if (!trendAnalysis[trend]) {
        trendAnalysis[trend] = { total: 0, correct: 0, totalProfitLoss: 0 };
      }
      
      trendAnalysis[trend].total++;
      if (this.isTradeCorrect(trade)) trendAnalysis[trend].correct++;
      trendAnalysis[trend].totalProfitLoss += trade.actualProfitLoss || 0;
    });
    
    Object.keys(trendAnalysis).forEach(trend => {
      const data = trendAnalysis[trend];
      data.accuracy = (data.correct / data.total) * 100;
      data.avgProfitLoss = data.totalProfitLoss / data.total;
    });
    
    return trendAnalysis;
  }

  // Analyze by RSI ranges
  analyzeByRSI(trades) {
    const rsiRanges = {
      'Oversold (0-30)': { total: 0, correct: 0, totalProfitLoss: 0 },
      'Neutral (30-70)': { total: 0, correct: 0, totalProfitLoss: 0 },
      'Overbought (70-100)': { total: 0, correct: 0, totalProfitLoss: 0 }
    };
    
    trades.forEach(trade => {
      if (!trade.rsi) return;
      
      const rsi = parseFloat(trade.rsi);
      let range;
      
      if (rsi <= 30) range = 'Oversold (0-30)';
      else if (rsi >= 70) range = 'Overbought (70-100)';
      else range = 'Neutral (30-70)';
      
      rsiRanges[range].total++;
      if (this.isTradeCorrect(trade)) rsiRanges[range].correct++;
      rsiRanges[range].totalProfitLoss += trade.actualProfitLoss || 0;
    });
    
    Object.keys(rsiRanges).forEach(range => {
      const data = rsiRanges[range];
      data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      data.avgProfitLoss = data.total > 0 ? data.totalProfitLoss / data.total : 0;
    });
    
    return rsiRanges;
  }

  // Get recent performance (last 30 days)
  getRecentPerformance(trades) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrades = trades.filter(trade => 
      new Date(trade.timestamp) >= thirtyDaysAgo
    );
    
    if (recentTrades.length === 0) return null;
    
    const correct = recentTrades.filter(t => this.isTradeCorrect(t)).length;
    const totalProfitLoss = recentTrades.reduce((sum, t) => sum + (t.actualProfitLoss || 0), 0);
    
    return {
      trades: recentTrades.length,
      accuracy: (correct / recentTrades.length) * 100,
      avgProfitLoss: totalProfitLoss / recentTrades.length,
      totalProfitLoss: totalProfitLoss
    };
  }

  // Check if trade prediction was correct
  isTradeCorrect(trade) {
    if (!trade.actualOutcome) return false;
    
    // If recommendation was BUY, trade is correct if outcome is WIN
    // If recommendation was SELL, trade is correct if outcome is WIN (shorting) or if we avoided loss
    if (trade.recommendation === 'BUY' || trade.recommendation === 'STRONG BUY') {
      return trade.actualOutcome === 'WIN';
    } else if (trade.recommendation === 'SELL' || trade.recommendation === 'STRONG SELL') {
      return trade.actualOutcome === 'WIN'; // Assuming we can short or we avoided buying
    } else if (trade.recommendation === 'HOLD') {
      return trade.actualOutcome !== 'LOSS'; // HOLD is correct if we don't lose money
    }
    
    return false;
  }

  // Helper functions
  generateTradeId() {
    return 'TRADE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateDaysHeld(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  loadDatabase() {
    return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
  }

  saveDatabase(data) {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  // Get insights and suggestions for AI improvement
  getAIInsights() {
    const performance = this.getPerformanceMetrics();
    const insights = [];
    
    // Confidence calibration insights
    if (performance.byConfidence) {
      const highConfidenceAccuracy = performance.byConfidence['90-100%']?.accuracy || 0;
      if (highConfidenceAccuracy < 80) {
        insights.push({
          type: 'warning',
          category: 'confidence',
          message: `High confidence predictions (90-100%) only have ${highConfidenceAccuracy.toFixed(1)}% accuracy. Consider being more conservative with confidence levels.`
        });
      }
    }
    
    // Trend analysis insights
    if (performance.byTrend) {
      const bestTrend = Object.entries(performance.byTrend)
        .sort((a, b) => b[1].accuracy - a[1].accuracy)[0];
      
      if (bestTrend && bestTrend[1].accuracy > 70) {
        insights.push({
          type: 'success',
          category: 'trend',
          message: `${bestTrend[0]} trend predictions are most accurate (${bestTrend[1].accuracy.toFixed(1)}%). Consider increasing confidence for these conditions.`
        });
      }
    }
    
    // RSI insights
    if (performance.byRSI) {
      const rsiData = performance.byRSI;
      if (rsiData['Oversold (0-30)'].accuracy > rsiData['Overbought (70-100)'].accuracy + 20) {
        insights.push({
          type: 'info',
          category: 'rsi',
          message: 'Oversold conditions show much better prediction accuracy than overbought. Consider being more aggressive with oversold buy signals.'
        });
      }
    }
    
    return insights;
  }
}

module.exports = new TradeLogger();