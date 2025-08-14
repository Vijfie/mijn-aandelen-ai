// backend/multiAssetService.js - NIEUW BESTAND MAKEN
const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;

class MultiAssetService {
  constructor() {
    this.supportedAssets = {
      'STOCKS': this.getStockData.bind(this),
      'CRYPTO': this.getCryptoData.bind(this),
      'FOREX': this.getForexData.bind(this),
      'COMMODITIES': this.getCommodityData.bind(this),
      'ETF': this.getETFData.bind(this)
    };

    // Asset categorization mapping
    this.assetMapping = {
      // Stocks (bestaande functionaliteit)
      'AAPL': { type: 'STOCKS', name: 'Apple Inc.' },
      'MSFT': { type: 'STOCKS', name: 'Microsoft Corporation' },
      'TSLA': { type: 'STOCKS', name: 'Tesla Inc.' },
      'GOOGL': { type: 'STOCKS', name: 'Alphabet Inc.' },
      'AMZN': { type: 'STOCKS', name: 'Amazon.com Inc.' },
      'META': { type: 'STOCKS', name: 'Meta Platforms Inc.' },
      'NVDA': { type: 'STOCKS', name: 'NVIDIA Corporation' },
      'NFLX': { type: 'STOCKS', name: 'Netflix Inc.' },
      'DIS': { type: 'STOCKS', name: 'The Walt Disney Company' },
      'KO': { type: 'STOCKS', name: 'The Coca-Cola Company' },
      
      // Cryptocurrencies
      'BTC': { type: 'CRYPTO', name: 'Bitcoin', symbol: 'BTC-USD' },
      'ETH': { type: 'CRYPTO', name: 'Ethereum', symbol: 'ETH-USD' },
      'BNB': { type: 'CRYPTO', name: 'Binance Coin', symbol: 'BNB-USD' },
      'ADA': { type: 'CRYPTO', name: 'Cardano', symbol: 'ADA-USD' },
      'SOL': { type: 'CRYPTO', name: 'Solana', symbol: 'SOL-USD' },
      'DOGE': { type: 'CRYPTO', name: 'Dogecoin', symbol: 'DOGE-USD' },
      'BTC-USD': { type: 'CRYPTO', name: 'Bitcoin', symbol: 'BTC-USD' },
      'ETH-USD': { type: 'CRYPTO', name: 'Ethereum', symbol: 'ETH-USD' },
      'BITCOIN': { type: 'CRYPTO', name: 'Bitcoin', symbol: 'BTC-USD' },
      'ETHEREUM': { type: 'CRYPTO', name: 'Ethereum', symbol: 'ETH-USD' },
      
      // Forex
      'EURUSD': { type: 'FOREX', name: 'EUR/USD', symbol: 'EURUSD=X' },
      'GBPUSD': { type: 'FOREX', name: 'GBP/USD', symbol: 'GBPUSD=X' },
      'USDJPY': { type: 'FOREX', name: 'USD/JPY', symbol: 'USDJPY=X' },
      'USDCHF': { type: 'FOREX', name: 'USD/CHF', symbol: 'USDCHF=X' },
      'AUDUSD': { type: 'FOREX', name: 'AUD/USD', symbol: 'AUDUSD=X' },
      'EURUSD=X': { type: 'FOREX', name: 'EUR/USD', symbol: 'EURUSD=X' },
      'GBPUSD=X': { type: 'FOREX', name: 'GBP/USD', symbol: 'GBPUSD=X' },
      
      // Commodities
      'GOLD': { type: 'COMMODITIES', name: 'Gold', symbol: 'GC=F' },
      'SILVER': { type: 'COMMODITIES', name: 'Silver', symbol: 'SI=F' },
      'OIL': { type: 'COMMODITIES', name: 'Crude Oil', symbol: 'CL=F' },
      'COPPER': { type: 'COMMODITIES', name: 'Copper', symbol: 'HG=F' },
      'GC=F': { type: 'COMMODITIES', name: 'Gold', symbol: 'GC=F' },
      'SI=F': { type: 'COMMODITIES', name: 'Silver', symbol: 'SI=F' },
      'CL=F': { type: 'COMMODITIES', name: 'Crude Oil', symbol: 'CL=F' },
      
      // ETFs
      'SPY': { type: 'ETF', name: 'SPDR S&P 500 ETF' },
      'QQQ': { type: 'ETF', name: 'Invesco QQQ Trust' },
      'VTI': { type: 'ETF', name: 'Vanguard Total Stock Market ETF' },
      'GLD': { type: 'ETF', name: 'SPDR Gold Shares' },
      'TLT': { type: 'ETF', name: 'iShares 20+ Year Treasury Bond ETF' }
    };
  }

  // Main entry point - detect asset type and route to appropriate handler
  async getAssetData(symbol) {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    let assetInfo = this.assetMapping[normalizedSymbol];
    
    // If not found, try original symbol
    if (!assetInfo) {
      assetInfo = this.assetMapping[symbol];
    }
    
    if (!assetInfo) {
      throw new Error(`Asset ${symbol} not supported. Try stocks (AAPL), crypto (BTC), forex (EURUSD), commodities (GOLD), or ETFs (SPY)`);
    }

    const handler = this.supportedAssets[assetInfo.type];
    if (!handler) {
      throw new Error(`Handler for ${assetInfo.type} not implemented`);
    }

    return await handler(assetInfo.symbol || symbol, assetInfo);
  }

  // Stock data (existing functionality)
  async getStockData(symbol, assetInfo) {
    try {
      const quote = await yahooFinance.quote(symbol);
      
      return {
        type: 'STOCKS',
        symbol: symbol,
        name: assetInfo.name || quote.displayName || quote.shortName,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        currency: quote.currency || 'USD',
        additionalMetrics: {
          pe: quote.trailingPE || null,
          eps: quote.epsTrailingTwelveMonths || null,
          beta: quote.beta || null,
          high52: quote.fiftyTwoWeekHigh || 0,
          low52: quote.fiftyTwoWeekLow || 0,
          dividendYield: quote.dividendYield || null
        }
      };
    } catch (error) {
      console.error(`Stock data error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
  }

  // Cryptocurrency data
  async getCryptoData(symbol, assetInfo) {
    try {
      const yahooSymbol = assetInfo.symbol || symbol;
      console.log(`🔍 Fetching crypto data for: ${yahooSymbol}`);
      const quote = await yahooFinance.quote(yahooSymbol);
      
      return {
        type: 'CRYPTO',
        symbol: symbol,
        yahooSymbol: yahooSymbol,
        name: assetInfo.name,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        currency: 'USD',
        additionalMetrics: {
          high24h: quote.regularMarketDayHigh || 0,
          low24h: quote.regularMarketDayLow || 0,
          high52: quote.fiftyTwoWeekHigh || 0,
          low52: quote.fiftyTwoWeekLow || 0,
          circulatingSupply: null,
          totalSupply: null
        }
      };
    } catch (error) {
      console.error(`Crypto data error for ${symbol}:`, error.message);
      // Fallback to fake data for demo
      return this.getCryptoDataFallback(symbol, assetInfo);
    }
  }

  // Forex data
  async getForexData(symbol, assetInfo) {
    try {
      const yahooSymbol = assetInfo.symbol || symbol;
      console.log(`🔍 Fetching forex data for: ${yahooSymbol}`);
      const quote = await yahooFinance.quote(yahooSymbol);
      
      return {
        type: 'FOREX',
        symbol: symbol,
        yahooSymbol: yahooSymbol,
        name: assetInfo.name,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        currency: 'RATE',
        additionalMetrics: {
          bid: quote.bid || null,
          ask: quote.ask || null,
          spread: quote.ask && quote.bid ? (quote.ask - quote.bid) : null,
          high24h: quote.regularMarketDayHigh || 0,
          low24h: quote.regularMarketDayLow || 0
        }
      };
    } catch (error) {
      console.error(`Forex data error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch forex data: ${error.message}`);
    }
  }

  // Commodities data
  async getCommodityData(symbol, assetInfo) {
    try {
      const yahooSymbol = assetInfo.symbol || symbol;
      console.log(`🔍 Fetching commodity data for: ${yahooSymbol}`);
      const quote = await yahooFinance.quote(yahooSymbol);
      
      return {
        type: 'COMMODITIES',
        symbol: symbol,
        yahooSymbol: yahooSymbol,
        name: assetInfo.name,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        currency: quote.currency || 'USD',
        additionalMetrics: {
          high52: quote.fiftyTwoWeekHigh || 0,
          low52: quote.fiftyTwoWeekLow || 0,
          openInterest: null,
          contractMonth: null
        }
      };
    } catch (error) {
      console.error(`Commodity data error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch commodity data: ${error.message}`);
    }
  }

  // ETF data
  async getETFData(symbol, assetInfo) {
    try {
      const quote = await yahooFinance.quote(symbol);
      
      return {
        type: 'ETF',
        symbol: symbol,
        name: assetInfo.name || quote.displayName || quote.shortName,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        currency: quote.currency || 'USD',
        additionalMetrics: {
          expenseRatio: null,
          dividendYield: quote.dividendYield || null,
          aum: null,
          high52: quote.fiftyTwoWeekHigh || 0,
          low52: quote.fiftyTwoWeekLow || 0
        }
      };
    } catch (error) {
      console.error(`ETF data error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch ETF data: ${error.message}`);
    }
  }

  // Fallback crypto data using fake data
  getCryptoDataFallback(symbol, assetInfo) {
    console.log(`📊 Using fallback data for crypto: ${symbol}`);
    return {
      type: 'CRYPTO',
      symbol: symbol,
      name: assetInfo.name,
      price: Math.random() * 50000 + 1000,
      change: (Math.random() - 0.5) * 1000,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.random() * 1000000000,
      marketCap: Math.random() * 1000000000000,
      currency: 'USD',
      additionalMetrics: {
        high24h: 0,
        low24h: 0,
        high52: 0,
        low52: 0,
        circulatingSupply: null,
        totalSupply: null
      },
      source: 'Fallback Data'
    };
  }

  // Get historical data for any asset type
  async getHistoricalData(symbol, period = '3mo') {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    let assetInfo = this.assetMapping[normalizedSymbol] || this.assetMapping[symbol];
    
    if (!assetInfo) {
      throw new Error(`Asset ${symbol} not supported for historical data`);
    }

    const yahooSymbol = assetInfo.symbol || symbol;
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - this.getPeriodInMonths(period));
      
      console.log(`📈 Fetching historical data for: ${yahooSymbol} (${assetInfo.type})`);
      const data = await yahooFinance.historical(yahooSymbol, {
        period1: startDate,
        period2: endDate,
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
      console.error(`Historical data error for ${yahooSymbol}:`, error.message);
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }
  }

  // Enhanced symbol extraction for multi-asset support
  extractAssetSymbol(text) {
    const upperText = text.toUpperCase();
    
    // Enhanced keyword matching
    const keywords = {
      'BITCOIN': 'BTC',
      'ETHEREUM': 'ETH',
      'EURO DOLLAR': 'EURUSD',
      'EUR USD': 'EURUSD',
      'POUND DOLLAR': 'GBPUSD',
      'GBP USD': 'GBPUSD',
      'YEN': 'USDJPY',
      'CRUDE': 'OIL',
      'S&P': 'SPY',
      'NASDAQ': 'QQQ',
      'APPLE': 'AAPL',
      'MICROSOFT': 'MSFT',
      'TESLA': 'TSLA',
      'GOOGLE': 'GOOGL',
      'ALPHABET': 'GOOGL',
      'AMAZON': 'AMZN',
      'META': 'META',
      'FACEBOOK': 'META',
      'NVIDIA': 'NVDA'
    };
    
    // Check keywords first
    for (let [keyword, symbol] of Object.entries(keywords)) {
      if (upperText.includes(keyword)) {
        console.log(`🎯 Keyword matched: "${keyword}" -> ${symbol}`);
        return symbol;
      }
    }
    
    // Check all supported assets
    for (let [symbol, info] of Object.entries(this.assetMapping)) {
      if (upperText.includes(symbol) || upperText.includes(info.name.toUpperCase())) {
        console.log(`🎯 Asset matched: "${symbol}" -> ${info.name}`);
        return symbol;
      }
    }
    
    // Fallback to regex for standard symbols
    const symbolMatch = upperText.match(/\b[A-Z]{2,5}\b/);
    if (symbolMatch) {
      console.log(`🎯 Regex matched: ${symbolMatch[0]}`);
      return symbolMatch[0];
    }
    
    return null;
  }

  // Utility functions
  normalizeSymbol(symbol) {
    return symbol.toUpperCase().replace(/[-_]/g, '');
  }

  getPeriodInMonths(period) {
    const periodMap = {
      '1mo': 1,
      '3mo': 3,
      '6mo': 6,
      '1y': 12,
      '2y': 24
    };
    return periodMap[period] || 3;
  }

  // Get supported assets list
  getSupportedAssets() {
    const grouped = {};
    for (let [symbol, info] of Object.entries(this.assetMapping)) {
      if (!grouped[info.type]) {
        grouped[info.type] = [];
      }
      grouped[info.type].push({
        symbol: symbol,
        name: info.name,
        yahooSymbol: info.symbol || symbol
      });
    }
    return grouped;
  }

  // Asset-specific analysis methods
  getAnalysisFactors(assetType) {
    const factors = {
      'STOCKS': {
        fundamental: ['P/E Ratio', 'EPS Growth', 'Revenue Growth', 'Debt-to-Equity', 'ROE'],
        technical: ['RSI', 'MACD', 'Moving Averages', 'Volume', 'Support/Resistance'],
        sentiment: ['News Sentiment', 'Analyst Ratings', 'Social Media']
      },
      'CRYPTO': {
        fundamental: ['Market Cap', 'Trading Volume', 'Developer Activity', 'Adoption Rate'],
        technical: ['RSI', 'MACD', 'Moving Averages', 'Volume', 'Volatility'],
        sentiment: ['Social Media', 'Fear & Greed Index', 'News Sentiment']
      },
      'FOREX': {
        fundamental: ['Interest Rates', 'Economic Indicators', 'Political Stability', 'Trade Balance'],
        technical: ['RSI', 'MACD', 'Moving Averages', 'Support/Resistance'],
        sentiment: ['Central Bank Policy', 'Economic News', 'Risk Sentiment']
      },
      'COMMODITIES': {
        fundamental: ['Supply/Demand', 'Economic Growth', 'Geopolitical Events', 'Currency Strength'],
        technical: ['RSI', 'MACD', 'Moving Averages', 'Seasonal Patterns'],
        sentiment: ['Market Sentiment', 'Economic Outlook', 'Weather/Supply Disruptions']
      },
      'ETF': {
        fundamental: ['Underlying Assets', 'Expense Ratio', 'Tracking Error', 'AUM'],
        technical: ['RSI', 'MACD', 'Moving Averages', 'Volume', 'Sector Rotation'],
        sentiment: ['Market Sentiment', 'Sector Outlook', 'Economic Trends']
      }
    };
    
    return factors[assetType] || factors['STOCKS'];
  }
}

module.exports = MultiAssetService;