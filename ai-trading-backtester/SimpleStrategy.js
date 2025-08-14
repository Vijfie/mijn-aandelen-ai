console.log("Creating SimpleStrategy...");

const Helpers = require("./helpers");

class SimpleStrategy {
  constructor(options = {}) {
    this.name = "Buy The Dip Strategy";
    this.dipThreshold = options.dipThreshold || -0.03; // -3% dip
    this.profitTarget = options.profitTarget || 0.02;   // +2% profit target
    this.stopLoss = options.stopLoss || -0.05;          // -5% stop loss
    this.maxPositionSize = options.maxPositionSize || 0.2; // Max 20% per position
    
    // Strategy state
    this.lastPrices = new Map(); // Track price history
    this.entryPrices = new Map(); // Track entry prices for profit/loss calc
  }
  
  async generateSignals(currentData, context) {
    const signals = [];
    const { portfolioValue, cash, positions } = context;
    
    for (const [symbol, priceData] of Object.entries(currentData)) {
      try {
        // Update price history
        if (!this.lastPrices.has(symbol)) {
          this.lastPrices.set(symbol, []);
        }
        
        const priceHistory = this.lastPrices.get(symbol);
        priceHistory.push(priceData.close);
        
        // Keep only last 5 days for dip calculation
        if (priceHistory.length > 5) {
          priceHistory.shift();
        }
        
        this.lastPrices.set(symbol, priceHistory);
        
        // Need at least 3 days of history for dip detection
        if (priceHistory.length < 3) continue;
        
        const currentPrice = priceData.close;
        const threeDaysAgo = priceHistory[priceHistory.length - 3];
        const currentPosition = positions.get(symbol) || 0;
        
        // Calculate price change over 3 days
        const priceChange = (currentPrice - threeDaysAgo) / threeDaysAgo;
        
        // BUY SIGNAL: Price dipped and we have no position
        if (priceChange <= this.dipThreshold && currentPosition === 0) {
          const maxInvestment = portfolioValue * this.maxPositionSize;
          const affordableShares = Math.floor(maxInvestment / currentPrice);
          
          if (affordableShares > 0 && cash >= (affordableShares * currentPrice)) {
            signals.push({
              symbol: symbol,
              action: "BUY",
              quantity: affordableShares,
              price: currentPrice,
              reason: `Dip detected: ${(priceChange * 100).toFixed(1)}% drop`
            });
            
            // Track entry price
            this.entryPrices.set(symbol, currentPrice);
          }
        }
        
        // SELL SIGNALS: We have a position
        else if (currentPosition > 0) {
          const entryPrice = this.entryPrices.get(symbol);
          
          if (entryPrice) {
            const gainLoss = (currentPrice - entryPrice) / entryPrice;
            
            // PROFIT TARGET
            if (gainLoss >= this.profitTarget) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: currentPrice,
                reason: `Profit target hit: +${(gainLoss * 100).toFixed(1)}%`
              });
              
              this.entryPrices.delete(symbol);
            }
            
            // STOP LOSS
            else if (gainLoss <= this.stopLoss) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: currentPrice,
                reason: `Stop loss hit: ${(gainLoss * 100).toFixed(1)}%`
              });
              
              this.entryPrices.delete(symbol);
            }
          }
        }
        
      } catch (error) {
        console.warn(`Strategy error for ${symbol}:`, error.message);
      }
    }
    
    return signals;
  }
  
  getStrategyInfo() {
    return {
      name: this.name,
      parameters: {
        dipThreshold: `${(this.dipThreshold * 100).toFixed(1)}%`,
        profitTarget: `${(this.profitTarget * 100).toFixed(1)}%`,
        stopLoss: `${(this.stopLoss * 100).toFixed(1)}%`,
        maxPositionSize: `${(this.maxPositionSize * 100).toFixed(1)}%`
      }
    };
  }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = SimpleStrategy;
}

console.log("✅ SimpleStrategy created successfully!");
