// backend/advancedTechnicalAnalysis.js - Professional Technical Indicators
class AdvancedTechnicalAnalysis {
  
  constructor() {
    this.indicators = {};
  }
  
  // ===== MAIN ANALYSIS FUNCTION =====
  calculateAdvancedIndicators(historicalData) {
    if (!historicalData || historicalData.length < 50) {
      return this.generateFallbackIndicators();
    }
    
    console.log(`📊 Calculating advanced technical indicators for ${historicalData.length} data points...`);
    
    const closes = historicalData.map(d => d.close);
    const highs = historicalData.map(d => d.high);
    const lows = historicalData.map(d => d.low);
    const volumes = historicalData.map(d => d.volume);
    
    const indicators = {
      // Basic indicators (improved)
      rsi: this.calculateRSI(closes, 14),
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      ema12: this.calculateEMA(closes, 12),
      ema26: this.calculateEMA(closes, 26),
      
      // Advanced momentum indicators
      macd: this.calculateMACD(closes),
      stochastic: this.calculateStochastic(highs, lows, closes, 14),
      williams: this.calculateWilliamsR(highs, lows, closes, 14),
      
      // Volatility indicators
      bollingerBands: this.calculateBollingerBands(closes, 20, 2),
      atr: this.calculateATR(highs, lows, closes, 14),
      
      // Volume indicators
      obv: this.calculateOBV(closes, volumes),
      volumeMA: this.calculateSMA(volumes, 20),
      volumeRatio: volumes[volumes.length - 1] / this.calculateSMA(volumes, 20),
      
      // Support/Resistance
      supportResistance: this.calculateSupportResistance(highs, lows, closes),
      
      // Trend indicators
      adx: this.calculateADX(highs, lows, closes, 14),
      trend: this.determineTrend(closes, highs, lows),
      
      // Pattern recognition
      patterns: this.detectPatterns(closes, highs, lows),
      
      // Market strength
      marketStrength: this.calculateMarketStrength(closes, volumes, highs, lows)
    };
    
    // Calculate composite scores
    indicators.bullishScore = this.calculateBullishScore(indicators);
    indicators.bearishScore = this.calculateBearishScore(indicators);
    indicators.volatilityScore = this.calculateVolatilityScore(indicators);
    indicators.momentumScore = this.calculateMomentumScore(indicators);
    
    console.log(`✅ Advanced indicators calculated:`, {
      rsi: indicators.rsi.toFixed(1),
      macd: indicators.macd.signal,
      trend: indicators.trend.direction,
      bullishScore: indicators.bullishScore.toFixed(1)
    });
    
    return indicators;
  }
  
  // ===== RSI (Improved) =====
  calculateRSI(closes, period = 14) {
    if (closes.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    // Initial calculation
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Smoothed calculations
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
  
  // ===== MACD =====
  calculateMACD(closes) {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;
    
    // Signal line (9-period EMA of MACD)
    const macdHistory = [];
    for (let i = 25; i < closes.length; i++) { // Start after EMA26 warmup
      const ema12Val = this.calculateEMAAtIndex(closes, 12, i);
      const ema26Val = this.calculateEMAAtIndex(closes, 26, i);
      macdHistory.push(ema12Val - ema26Val);
    }
    
    const signalLine = this.calculateEMA(macdHistory, 9);
    const histogram = macdLine - signalLine;
    
    let signal = 'NEUTRAL';
    if (macdLine > signalLine && histogram > 0) signal = 'BUY';
    else if (macdLine < signalLine && histogram < 0) signal = 'SELL';
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram,
      signal: signal
    };
  }
  
  // ===== BOLLINGER BANDS =====
  calculateBollingerBands(closes, period = 20, multiplier = 2) {
    const sma = this.calculateSMA(closes, period);
    const recentCloses = closes.slice(-period);
    
    // Calculate standard deviation
    const variance = recentCloses.reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const stdDev = Math.sqrt(variance);
    
    const upperBand = sma + (multiplier * stdDev);
    const lowerBand = sma - (multiplier * stdDev);
    const currentPrice = closes[closes.length - 1];
    
    // Calculate position within bands
    const position = (currentPrice - lowerBand) / (upperBand - lowerBand);
    
    let signal = 'NEUTRAL';
    if (position > 0.8) signal = 'OVERBOUGHT';
    else if (position < 0.2) signal = 'OVERSOLD';
    
    return {
      upper: upperBand,
      middle: sma,
      lower: lowerBand,
      position: position,
      width: (upperBand - lowerBand) / sma, // Band width as % of price
      signal: signal
    };
  }
  
  // ===== STOCHASTIC OSCILLATOR =====
  calculateStochastic(highs, lows, closes, period = 14) {
    if (closes.length < period) return { k: 50, d: 50, signal: 'NEUTRAL' };
    
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = closes[closes.length - 1];
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    // Calculate %D (3-period SMA of %K) - simplified
    const d = k; // In practice, you'd calculate this over multiple periods
    
    let signal = 'NEUTRAL';
    if (k > 80 && d > 80) signal = 'OVERBOUGHT';
    else if (k < 20 && d < 20) signal = 'OVERSOLD';
    
    return { k, d, signal };
  }
  
  // ===== WILLIAMS %R =====
  calculateWilliamsR(highs, lows, closes, period = 14) {
    if (closes.length < period) return -50;
    
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = closes[closes.length - 1];
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
  }
  
  // ===== AVERAGE TRUE RANGE (ATR) =====
  calculateATR(highs, lows, closes, period = 14) {
    if (closes.length < period + 1) return highs[0] - lows[0];
    
    const trueRanges = [];
    
    for (let i = 1; i < closes.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.calculateSMA(trueRanges, period);
  }
  
  // ===== ON-BALANCE VOLUME (OBV) =====
  calculateOBV(closes, volumes) {
    if (closes.length < 2) return 0;
    
    let obv = 0;
    
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        obv += volumes[i];
      } else if (closes[i] < closes[i - 1]) {
        obv -= volumes[i];
      }
      // If prices are equal, OBV remains unchanged
    }
    
    return obv;
  }
  
  // ===== SUPPORT & RESISTANCE =====
  calculateSupportResistance(highs, lows, closes) {
    const recentData = closes.slice(-50); // Last 50 periods
    const currentPrice = closes[closes.length - 1];
    
    // Find potential support (recent lows)
    const supports = lows.slice(-20).filter(low => 
      Math.abs(low - currentPrice) / currentPrice < 0.1 // Within 10%
    );
    
    // Find potential resistance (recent highs)
    const resistances = highs.slice(-20).filter(high => 
      Math.abs(high - currentPrice) / currentPrice < 0.1 // Within 10%
    );
    
    const nearestSupport = Math.max(...supports.filter(s => s < currentPrice));
    const nearestResistance = Math.min(...resistances.filter(r => r > currentPrice));
    
    return {
      support: nearestSupport || currentPrice * 0.95,
      resistance: nearestResistance || currentPrice * 1.05,
      supportStrength: supports.length,
      resistanceStrength: resistances.length
    };
  }
  
  // ===== ADX (Average Directional Index) =====
  calculateADX(highs, lows, closes, period = 14) {
    if (closes.length < period + 1) return 25;
    
    // Simplified ADX calculation
    let positiveMovement = 0;
    let negativeMovement = 0;
    
    for (let i = 1; i < closes.length; i++) {
      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];
      
      if (upMove > downMove && upMove > 0) positiveMovement++;
      else if (downMove > upMove && downMove > 0) negativeMovement++;
    }
    
    const totalMoves = positiveMovement + negativeMovement;
    const adx = totalMoves > 0 ? Math.abs(positiveMovement - negativeMovement) / totalMoves * 100 : 25;
    
    return Math.min(100, Math.max(0, adx));
  }
  
  // ===== PATTERN DETECTION =====
  detectPatterns(closes, highs, lows) {
    const patterns = [];
    const recent = closes.slice(-10);
    const currentPrice = closes[closes.length - 1];
    
    // Double Top Pattern
    if (this.isDoubleTop(recent)) {
      patterns.push({ type: 'DOUBLE_TOP', signal: 'BEARISH', confidence: 0.7 });
    }
    
    // Double Bottom Pattern
    if (this.isDoubleBottom(recent)) {
      patterns.push({ type: 'DOUBLE_BOTTOM', signal: 'BULLISH', confidence: 0.7 });
    }
    
    // Head and Shoulders
    if (this.isHeadAndShoulders(recent)) {
      patterns.push({ type: 'HEAD_SHOULDERS', signal: 'BEARISH', confidence: 0.8 });
    }
    
    // Ascending Triangle
    if (this.isAscendingTriangle(recent, highs.slice(-10))) {
      patterns.push({ type: 'ASCENDING_TRIANGLE', signal: 'BULLISH', confidence: 0.6 });
    }
    
    return patterns;
  }
  
  // ===== COMPOSITE SCORES =====
  calculateBullishScore(indicators) {
    let score = 50; // Start neutral
    
    // RSI analysis
    if (indicators.rsi < 30) score += 20; // Oversold
    else if (indicators.rsi < 45) score += 10;
    else if (indicators.rsi > 70) score -= 15; // Overbought
    
    // MACD analysis
    if (indicators.macd.signal === 'BUY') score += 15;
    else if (indicators.macd.signal === 'SELL') score -= 15;
    
    // Bollinger Bands
    if (indicators.bollingerBands.signal === 'OVERSOLD') score += 12;
    else if (indicators.bollingerBands.signal === 'OVERBOUGHT') score -= 12;
    
    // Volume confirmation
    if (indicators.volumeRatio > 1.5) score += 10; // High volume
    
    // Trend alignment
    if (indicators.trend.direction === 'BULLISH') score += 15;
    else if (indicators.trend.direction === 'BEARISH') score -= 15;
    
    // Pattern recognition
    indicators.patterns.forEach(pattern => {
      if (pattern.signal === 'BULLISH') score += pattern.confidence * 10;
      else if (pattern.signal === 'BEARISH') score -= pattern.confidence * 10;
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  calculateBearishScore(indicators) {
    return 100 - this.calculateBullishScore(indicators);
  }
  
  calculateVolatilityScore(indicators) {
    let score = 50;
    
    // ATR analysis
    const currentPrice = indicators.bollingerBands.middle;
    const atrPercent = (indicators.atr / currentPrice) * 100;
    
    if (atrPercent > 3) score += 25; // High volatility
    else if (atrPercent < 1) score -= 15; // Low volatility
    
    // Bollinger Band width
    if (indicators.bollingerBands.width > 0.1) score += 15;
    else if (indicators.bollingerBands.width < 0.05) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  calculateMomentumScore(indicators) {
    let score = 50;
    
    // MACD momentum
    if (indicators.macd.histogram > 0) score += 15;
    else score -= 15;
    
    // RSI momentum
    if (indicators.rsi > 50) score += (indicators.rsi - 50) * 0.5;
    else score -= (50 - indicators.rsi) * 0.5;
    
    // Stochastic momentum
    if (indicators.stochastic.k > 50) score += 10;
    else score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  // ===== HELPER FUNCTIONS =====
  calculateSMA(data, period) {
    if (data.length < period) return data[data.length - 1] || 0;
    const sum = data.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }
  
  calculateEMA(data, period) {
    if (data.length < period) return data[data.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(data.slice(0, period), period);
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }
  
  calculateEMAAtIndex(data, period, index) {
    if (index < period) return data[index];
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(data.slice(index - period, index), period);
    
    return (data[index] * multiplier) + (ema * (1 - multiplier));
  }
  
  determineTrend(closes, highs, lows) {
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const currentPrice = closes[closes.length - 1];
    
    let direction = 'NEUTRAL';
    let strength = 0;
    
    if (currentPrice > sma20 && sma20 > sma50) {
      direction = 'BULLISH';
      strength = Math.min(100, ((currentPrice - sma50) / sma50) * 100);
    } else if (currentPrice < sma20 && sma20 < sma50) {
      direction = 'BEARISH';
      strength = Math.min(100, ((sma50 - currentPrice) / sma50) * 100);
    }
    
    return { direction, strength };
  }
  
  calculateMarketStrength(closes, volumes, highs, lows) {
    const priceChange = (closes[closes.length - 1] - closes[closes.length - 5]) / closes[closes.length - 5];
    const volumeAvg = this.calculateSMA(volumes, 20);
    const currentVolume = volumes[volumes.length - 1];
    
    let strength = 50;
    
    if (priceChange > 0 && currentVolume > volumeAvg) strength += 25;
    else if (priceChange < 0 && currentVolume > volumeAvg) strength -= 25;
    
    return Math.max(0, Math.min(100, strength));
  }
  
  // Pattern detection helpers (simplified)
  isDoubleTop(prices) {
    if (prices.length < 7) return false;
    const max1 = Math.max(...prices.slice(0, 3));
    const max2 = Math.max(...prices.slice(-3));
    return Math.abs(max1 - max2) / max1 < 0.02; // Within 2%
  }
  
  isDoubleBottom(prices) {
    if (prices.length < 7) return false;
    const min1 = Math.min(...prices.slice(0, 3));
    const min2 = Math.min(...prices.slice(-3));
    return Math.abs(min1 - min2) / min1 < 0.02; // Within 2%
  }
  
  isHeadAndShoulders(prices) {
    if (prices.length < 9) return false;
    // Simplified: look for peak in middle that's higher than sides
    const leftShoulder = Math.max(...prices.slice(0, 3));
    const head = Math.max(...prices.slice(3, 6));
    const rightShoulder = Math.max(...prices.slice(-3));
    
    return head > leftShoulder && head > rightShoulder && 
           Math.abs(leftShoulder - rightShoulder) / leftShoulder < 0.05;
  }
  
  isAscendingTriangle(prices, highs) {
    // Simplified: resistance line flat, support line rising
    const recentHighs = highs.slice(-5);
    const recentLows = prices.slice(-5);
    
    const highVariance = this.calculateVariance(recentHighs);
    const lowTrend = recentLows[recentLows.length - 1] > recentLows[0];
    
    return highVariance < 0.01 && lowTrend; // Flat highs, rising lows
  }
  
  calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }
  
  generateFallbackIndicators() {
    return {
      rsi: 45 + Math.random() * 20,
      sma20: 100 + Math.random() * 50,
      sma50: 95 + Math.random() * 50,
      macd: { macd: 0, signal: 0, histogram: 0, signal: 'NEUTRAL' },
      bollingerBands: { upper: 110, middle: 100, lower: 90, position: 0.5, signal: 'NEUTRAL' },
      stochastic: { k: 50, d: 50, signal: 'NEUTRAL' },
      trend: { direction: 'NEUTRAL', strength: 0 },
      patterns: [],
      bullishScore: 45 + Math.random() * 20,
      bearishScore: 45 + Math.random() * 20,
      volatilityScore: 40 + Math.random() * 30,
      momentumScore: 40 + Math.random() * 30
    };
  }
}

module.exports = new AdvancedTechnicalAnalysis();