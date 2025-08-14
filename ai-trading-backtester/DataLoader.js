console.log("Creating DataLoader...");

const yahooFinance = require("yahoo-finance2").default;
const Helpers = require("./helpers");

class DataLoader {
  constructor() {
    this.cache = new Map();
    this.rateLimit = 100; // ms between requests
    this.lastRequest = 0;
  }
  
  async loadHistoricalData(symbol, startDate, endDate, timeframe = "1d") {
    console.log("Ì≥• Loading data for " + symbol + "...");
    
    // Validate symbol
    if (!Helpers.validateSymbol(symbol)) {
      throw new Error("Invalid symbol: " + symbol);
    }
    
    // Check cache
    const cacheKey = symbol + "_" + startDate + "_" + endDate + "_" + timeframe;
    if (this.cache.has(cacheKey)) {
      console.log("Ì≥¶ Using cached data for " + symbol);
      return this.cache.get(cacheKey);
    }
    
    try {
      // Rate limiting
      await this.applyRateLimit();
      
      // Load data from Yahoo Finance
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const data = await yahooFinance.historical(symbol, {
        period1: start,
        period2: end,
        interval: timeframe
      });
      
      // Normalize data format
      const normalizedData = data.map(bar => ({
        timestamp: bar.date.getTime(),
        date: Helpers.formatDate(bar.date),
        open: Helpers.roundTo(bar.open, 4),
        high: Helpers.roundTo(bar.high, 4),
        low: Helpers.roundTo(bar.low, 4),
        close: Helpers.roundTo(bar.close, 4),
        volume: bar.volume || 0
      }));
      
      // Cache the data
      this.cache.set(cacheKey, normalizedData);
      
      console.log("‚úÖ Loaded " + normalizedData.length + " bars for " + symbol);
      return normalizedData;
      
    } catch (error) {
      console.error("‚ùå Failed to load data for " + symbol + ":", error.message);
      return [];
    }
  }
  
  async loadMultipleSymbols(symbols, startDate, endDate, timeframe = "1d") {
    console.log("Ì≥ä Loading data for " + symbols.length + " symbols...");
    
    const results = new Map();
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      console.log("[" + (i + 1) + "/" + symbols.length + "] Processing " + symbol + "...");
      
      try {
        const data = await this.loadHistoricalData(symbol, startDate, endDate, timeframe);
        if (data && data.length > 0) {
          results.set(symbol, data);
        }
      } catch (error) {
        console.error("‚ùå Failed to load " + symbol + ":", error.message);
      }
    }
    
    console.log("‚úÖ Successfully loaded " + results.size + "/" + symbols.length + " symbols");
    return results;
  }
  
  async applyRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.rateLimit) {
      await Helpers.delay(this.rateLimit - timeSinceLastRequest);
    }
    
    this.lastRequest = Date.now();
  }
  
  getCacheStats() {
    return {
      cachedSymbols: this.cache.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
  
  clearCache() {
    this.cache.clear();
    console.log("Ì∑π Cache cleared");
  }
}

// Test de DataLoader
async function testDataLoader() {
  console.log("\\n=== TESTING DATALOADER ===");
  
  const loader = new DataLoader();
  
  try {
    // Test 1: Single symbol
    console.log("\\n1. Testing single symbol load...");
    const appleData = await loader.loadHistoricalData("AAPL", "2025-08-01", "2025-08-13");
    
    if (appleData && appleData.length > 0) {
      console.log("‚úÖ AAPL data loaded:", appleData.length, "bars");
      console.log("Ì≥ä Sample data:", {
        date: appleData[0].date,
        close: appleData[0].close
      });
    }
    
    // Test 2: Cache test
    console.log("\\n2. Testing cache...");
    const cachedData = await loader.loadHistoricalData("AAPL", "2025-08-01", "2025-08-13");
    console.log("‚úÖ Cache test passed");
    
    // Test 3: Multiple symbols
    console.log("\\n3. Testing multiple symbols...");
    const multiData = await loader.loadMultipleSymbols(["AAPL", "MSFT"], "2025-08-01", "2025-08-13");
    console.log("‚úÖ Multi-symbol test passed:", multiData.size, "symbols loaded");
    
    // Cache stats
    console.log("\\nÌ≥ä Cache stats:", loader.getCacheStats());
    
  } catch (error) {
    console.error("‚ùå DataLoader test failed:", error.message);
  }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = DataLoader;
}

// Run test if this file is executed directly
testDataLoader();
