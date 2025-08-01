const yahooFinance = require('yahoo-finance2').default;

class StockService {
  
  // Haal basis stock info op
  async getStockInfo(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol);
      const info = await yahooFinance.quoteSummary(symbol, {
        modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics']
      });

      return {
        symbol: symbol,
        name: quote.displayName || quote.shortName,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        pe: info?.summaryDetail?.trailingPE || null,
        eps: info?.defaultKeyStatistics?.trailingEps || null,
        high52: quote.fiftyTwoWeekHigh,
        low52: quote.fiftyTwoWeekLow,
        beta: info?.summaryDetail?.beta || null
      };
    } catch (error) {
      console.error('Error fetching stock info:', error);
      throw new Error('Kon aandelendata niet ophalen');
    }
  }

  // Haal historische data op voor technische analyse
  async getHistoricalData(symbol, period = '3mo') {
    try {
      const data = await yahooFinance.historical(symbol, {
        period1: this.getPeriodDate(period),
        period2: new Date(),
        interval: '1d'
      });

      return data.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('Kon historische data niet ophalen');
    }
  }

  // Helper functie voor datum berekening
  getPeriodDate(period) {
    const now = new Date();
    const periodMap = {
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365
    };
    
    const days = periodMap[period] || 90;
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  }

  // Technische analyse
  calculateTechnicalIndicators(historicalData) {
    if (!historicalData || historicalData.length < 20) {
      return null;
    }

    const closes = historicalData.map(d => d.close);
    const volumes = historicalData.map(d => d.volume);

    return {
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      rsi: this.calculateRSI(closes, 14),
      volumeAvg: volumes.slice(-20).reduce((a, b) => a + b, 0) / 20,
      currentVolume: volumes[volumes.length - 1],
      trend: this.analyzeTrend(closes)
    };
  }

  // Simple Moving Average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  // RSI (Relative Strength Index)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    // Eerste periode
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // RSI berekening
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

  // Trend analyse
  analyzeTrend(prices) {
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
}

module.exports = new StockService();