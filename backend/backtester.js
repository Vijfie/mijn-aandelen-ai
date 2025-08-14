// backend/aiBacktester.js - Professional AI Backtesting System
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AIBacktester {
  constructor() {
    this.resultsPath = path.join(__dirname, 'backtest_results.json');
    this.historicalData = [];
    this.trades = [];
    this.portfolio = {
      initialCapital: 100000,
      currentCapital: 100000,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
  }

  // 📊 Load Historical Data
  async loadHistoricalData(symbol, timeframe = '1d', period = '2y') {
    try {
      console.log(`📈 Loading historical data for ${symbol}...`);
      
      // Use Yahoo Finance or your preferred data source
      const response = await axios.get(`http://localhost:3001/api/chart/${symbol}`);
      this.historicalData = response.data.data.map(candle => ({
        timestamp: new Date(candle.date),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));

      console.log(`✅ Loaded ${this.historicalData.length} data points`);
      return this.historicalData;
    } catch (error) {
      console.error('❌ Error loading historical data:', error);
      throw error;
    }
  }

  // 🧠 Simulate AI Analysis on Historical Data
  async simulateAIAnalysis(dataPoint, index) {
    // Get historical context (previous 20 candles for indicators)
    const contextStart = Math.max(0, index - 20);
    const context = this.historicalData.slice(contextStart, index + 1);
    
    if (context.length < 10) return null; // Need minimum data

    // Calculate indicators
    const indicators = this.calculateIndicators(context);
    
    // Simulate AI confidence based on indicators
    const aiConfidence = this.calculateAIConfidence(indicators, dataPoint);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(aiConfidence, indicators);

    return {
      timestamp: dataPoint.timestamp,
      price: dataPoint.close,
      indicators,
      aiConfidence,
      recommendation,
      reasoning: this.generateReasoning(indicators, aiConfidence)
    };
  }

  // 📈 Calculate Technical Indicators
  calculateIndicators(data) {
    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);

    return {
      sma10: this.calculateSMA(closes, 10),
      sma20: this.calculateSMA(closes, 20),
      rsi: this.calculateRSI(closes, 14),
      macd: this.calculateMACD(closes),
      volumeRatio: volumes[volumes.length - 1] / this.calculateSMA(volumes, 10),
      trend: this.calculateTrend(closes),
      support: Math.min(...lows.slice(-5)),
      resistance: Math.max(...highs.slice(-5))
    };
  }

  // 🎯 Calculate AI Confidence (Simulate your AI logic)
  calculateAIConfidence(indicators, dataPoint) {
    let confidence = 50; // Base confidence

    // Technical indicators boost/penalty
    if (indicators.sma10 > indicators.sma20) confidence += 15;
    else confidence -= 15;

    if (indicators.rsi < 30) confidence += 20;
    else if (indicators.rsi > 70) confidence -= 20;

    if (indicators.macd === 'BUY') confidence += 10;
    else if (indicators.macd === 'SELL') confidence -= 10;

    if (indicators.volumeRatio > 1.5) confidence += 5;

    // Price action
    if (dataPoint.close > indicators.resistance) confidence += 10;
    if (dataPoint.close < indicators.support) confidence -= 10;

    return Math.max(0, Math.min(100, confidence));
  }

  // 📊 Generate Recommendation
  generateRecommendation(confidence, indicators) {
    if (confidence >= 75) return 'STRONG_BUY';
    if (confidence >= 65) return 'BUY';
    if (confidence >= 55) return 'WEAK_BUY';
    if (confidence >= 45) return 'HOLD';
    if (confidence >= 35) return 'WEAK_SELL';
    if (confidence >= 25) return 'SELL';
    return 'STRONG_SELL';
  }

  // 💭 Generate AI Reasoning
  generateReasoning(indicators, confidence) {
    const reasons = [];
    
    if (indicators.sma10 > indicators.sma20) {
      reasons.push('📈 Bullish trend - SMA10 > SMA20');
    } else {
      reasons.push('📉 Bearish trend - SMA10 < SMA20');
    }

    if (indicators.rsi < 30) {
      reasons.push('🔥 Oversold RSI suggests buying opportunity');
    } else if (indicators.rsi > 70) {
      reasons.push('⚠️ Overbought RSI suggests caution');
    }

    if (indicators.volumeRatio > 1.5) {
      reasons.push('🔊 High volume confirms price movement');
    }

    reasons.push(`🎯 AI Confidence: ${confidence.toFixed(1)}%`);

    return reasons.slice(0, 4); // Max 4 reasons
  }

  // 💰 Simulate Trading Strategy
  async runBacktest(symbol, strategy = 'ai_enhanced') {
    console.log(`🚀 Starting backtest for ${symbol} with ${strategy} strategy...`);
    
    // Reset portfolio
    this.portfolio = {
      initialCapital: 100000,
      currentCapital: 100000,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      maxDrawdown: 0,
      positions: [],
      equityCurve: []
    };

    let currentPosition = null;
    const riskPerTrade = 0.02; // 2% risk per trade

    // Iterate through historical data
    for (let i = 20; i < this.historicalData.length; i++) {
      const dataPoint = this.historicalData[i];
      const analysis = await this.simulateAIAnalysis(dataPoint, i);
      
      if (!analysis) continue;

      // Track equity
      if (currentPosition) {
        const unrealizedPnL = (dataPoint.close - currentPosition.entryPrice) * currentPosition.quantity;
        this.portfolio.equityCurve.push({
          timestamp: dataPoint.timestamp,
          equity: this.portfolio.currentCapital + unrealizedPnL,
          price: dataPoint.close
        });
      }

      // Entry Logic
      if (!currentPosition && (analysis.recommendation === 'BUY' || analysis.recommendation === 'STRONG_BUY')) {
        if (analysis.aiConfidence >= 65) {
          currentPosition = this.openPosition('LONG', dataPoint, analysis, riskPerTrade);
        }
      }

      // Exit Logic
      if (currentPosition) {
        const shouldExit = this.shouldExitPosition(currentPosition, dataPoint, analysis, i);
        if (shouldExit.exit) {
          this.closePosition(currentPosition, dataPoint, shouldExit.reason);
          currentPosition = null;
        }
      }

      // Risk Management - Stop Loss
      if (currentPosition) {
        const currentPnL = (dataPoint.close - currentPosition.entryPrice) / currentPosition.entryPrice;
        if (currentPnL <= -0.05) { // 5% stop loss
          this.closePosition(currentPosition, dataPoint, 'STOP_LOSS');
          currentPosition = null;
        }
      }
    }

    // Close any remaining position
    if (currentPosition) {
      const lastPoint = this.historicalData[this.historicalData.length - 1];
      this.closePosition(currentPosition, lastPoint, 'END_OF_DATA');
    }

    // Calculate final metrics
    this.calculatePerformanceMetrics();
    
    console.log('📊 Backtest completed!');
    return this.generateBacktestReport();
  }

  // 📈 Open Position
  openPosition(direction, dataPoint, analysis, riskPerTrade) {
    const riskAmount = this.portfolio.currentCapital * riskPerTrade;
    const quantity = Math.floor(riskAmount / (dataPoint.close * 0.05)); // 5% max loss per share

    const position = {
      id: `TRADE_${Date.now()}`,
      direction,
      entryPrice: dataPoint.close,
      entryTime: dataPoint.timestamp,
      quantity,
      analysis,
      stopLoss: dataPoint.close * (direction === 'LONG' ? 0.95 : 1.05),
      targetPrice: dataPoint.close * (direction === 'LONG' ? 1.10 : 0.90)
    };

    console.log(`📈 OPEN ${direction}: ${quantity} shares @ $${dataPoint.close} (Confidence: ${analysis.aiConfidence}%)`);
    return position;
  }

  // 📉 Close Position
  closePosition(position, dataPoint, reason) {
    const pnl = (dataPoint.close - position.entryPrice) * position.quantity;
    const pnlPercent = ((dataPoint.close - position.entryPrice) / position.entryPrice) * 100;
    
    const trade = {
      ...position,
      exitPrice: dataPoint.close,
      exitTime: dataPoint.timestamp,
      pnl,
      pnlPercent,
      reason,
      duration: (dataPoint.timestamp - position.entryTime) / (1000 * 60 * 60 * 24), // days
      isWin: pnl > 0
    };

    this.trades.push(trade);
    this.portfolio.currentCapital += pnl;
    this.portfolio.totalTrades++;
    
    if (trade.isWin) {
      this.portfolio.winningTrades++;
    } else {
      this.portfolio.losingTrades++;
    }

    console.log(`📉 CLOSE: $${dataPoint.close} | P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%) | ${reason}`);
  }

  // 🎯 Exit Conditions
  shouldExitPosition(position, dataPoint, analysis, index) {
    // Time-based exit (max 30 days)
    const daysDuration = (dataPoint.timestamp - position.entryTime) / (1000 * 60 * 60 * 24);
    if (daysDuration > 30) {
      return { exit: true, reason: 'TIME_LIMIT' };
    }

    // AI confidence drop
    if (analysis.aiConfidence < 30) {
      return { exit: true, reason: 'LOW_CONFIDENCE' };
    }

    // Technical exit
    if (analysis.recommendation === 'SELL' || analysis.recommendation === 'STRONG_SELL') {
      return { exit: true, reason: 'AI_SIGNAL' };
    }

    // Profit target
    const currentPnL = (dataPoint.close - position.entryPrice) / position.entryPrice;
    if (currentPnL >= 0.15) { // 15% profit target
      return { exit: true, reason: 'PROFIT_TARGET' };
    }

    return { exit: false };
  }

  // 📊 Calculate Performance Metrics
  calculatePerformanceMetrics() {
    if (this.trades.length === 0) return;

    // Win rate
    this.portfolio.winRate = (this.portfolio.winningTrades / this.portfolio.totalTrades) * 100;

    // Total return
    this.portfolio.totalReturn = ((this.portfolio.currentCapital - this.portfolio.initialCapital) / this.portfolio.initialCapital) * 100;

    // Average trade
    const totalPnL = this.trades.reduce((sum, trade) => sum + trade.pnl, 0);
    this.portfolio.avgTrade = totalPnL / this.trades.length;

    // Max drawdown calculation
    let peak = this.portfolio.initialCapital;
    let maxDD = 0;
    
    this.portfolio.equityCurve.forEach(point => {
      if (point.equity > peak) peak = point.equity;
      const drawdown = (peak - point.equity) / peak;
      if (drawdown > maxDD) maxDD = drawdown;
    });
    
    this.portfolio.maxDrawdown = maxDD * 100;

    // Sharpe ratio (simplified)
    const returns = this.trades.map(t => t.pnlPercent);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sq, n) => sq + Math.pow(n - avgReturn, 2), 0) / returns.length);
    this.portfolio.sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
  }

  // 📋 Generate Backtest Report
  generateBacktestReport() {
    const report = {
      summary: {
        symbol: 'BACKTEST',
        totalTrades: this.portfolio.totalTrades,
        winningTrades: this.portfolio.winningTrades,
        losingTrades: this.portfolio.losingTrades,
        winRate: this.portfolio.winRate?.toFixed(2) + '%',
        totalReturn: this.portfolio.totalReturn?.toFixed(2) + '%',
        maxDrawdown: this.portfolio.maxDrawdown?.toFixed(2) + '%',
        sharpeRatio: this.portfolio.sharpeRatio?.toFixed(2),
        avgTradeReturn: this.portfolio.avgTrade?.toFixed(2),
        initialCapital: this.portfolio.initialCapital,
        finalCapital: this.portfolio.currentCapital.toFixed(2)
      },
      trades: this.trades.slice(-20), // Last 20 trades
      equityCurve: this.portfolio.equityCurve,
      topTrades: this.trades.sort((a, b) => b.pnl - a.pnl).slice(0, 5),
      worstTrades: this.trades.sort((a, b) => a.pnl - b.pnl).slice(0, 5)
    };

    // Save to file
    fs.writeFileSync(this.resultsPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  // 🧮 Technical Indicator Calculations
  calculateSMA(data, period) {
    if (data.length < period) return data[data.length - 1];
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  }

  calculateRSI(data, period) {
    if (data.length < period + 1) return 50;
    
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter(change => change > 0);
    const losses = recentChanges.filter(change => change < 0).map(loss => Math.abs(loss));
    
    if (losses.length === 0) return 100;
    if (gains.length === 0) return 0;
    
    const avgGain = gains.reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(data) {
    if (data.length < 26) return 'NEUTRAL';
    
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    const macdLine = ema12 - ema26;
    
    if (data.length < 27) return 'NEUTRAL';
    const prevEma12 = this.calculateEMA(data.slice(0, -1), 12);
    const prevEma26 = this.calculateEMA(data.slice(0, -1), 26);
    const prevMacd = prevEma12 - prevEma26;
    
    if (macdLine > 0 && macdLine > prevMacd) return 'BUY';
    if (macdLine < 0 && macdLine < prevMacd) return 'SELL';
    return 'NEUTRAL';
  }

  calculateEMA(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema = (data[i] * k) + (ema * (1 - k));
    }
    
    return ema;
  }

  calculateTrend(data) {
    if (data.length < 10) return 'NEUTRAL';
    
    const recent = data.slice(-5);
    const previous = data.slice(-10, -5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    
    const change = (recentAvg - previousAvg) / previousAvg;
    
    if (change > 0.02) return 'STRONG_UP';
    if (change > 0.005) return 'UP';
    if (change < -0.02) return 'STRONG_DOWN';
    if (change < -0.005) return 'DOWN';
    return 'NEUTRAL';
  }
}

module.exports = AIBacktester;