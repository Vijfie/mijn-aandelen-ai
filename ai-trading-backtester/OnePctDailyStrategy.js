console.log("=== ULTRA OPTIMIZED 1% DAILY STRATEGY ===");

const IntradayAIStrategy = require("./IntradayAIStrategy");

class OnePctDailyStrategy extends IntradayAIStrategy {
  constructor(options = {}) {
    super(options);
    this.name = "1% Daily Target Strategy";
    this.minConfidence = options.minConfidence || 42; // Lower threshold
    this.maxPositionSize = options.maxPositionSize || 0.98; // Almost all-in
    this.profitTarget = options.profitTarget || 0.012; // 1.2% per trade
    this.stopLoss = options.stopLoss || -0.006; // Tighter stop
    this.dailyTargetHit = false;
    this.dailyStartValue = 0;
  }
  
  async generateSignals(currentData, context) {
    const { portfolioValue, date } = context;
    
    // Track daily progress
    if (!this.dailyStartValue) {
      this.dailyStartValue = portfolioValue;
    }
    
    const currentDailyReturn = (portfolioValue - this.dailyStartValue) / this.dailyStartValue;
    
    // STOP if we hit 1% for the day
    if (currentDailyReturn >= 0.01) {
      if (!this.dailyTargetHit) {
        console.log(`í¾¯ DAILY TARGET HIT: ${(currentDailyReturn * 100).toFixed(2)}% - STOPPING TRADES`);
        this.dailyTargetHit = true;
      }
      return []; // No more trades today
    }
    
    // Call parent strategy but with enhanced logic
    const baseSignals = await super.generateSignals(currentData, context);
    
    // ENHANCE signals for maximum aggression
    const enhancedSignals = [];
    
    for (const [symbol, priceData] of Object.entries(currentData)) {
      try {
        const aiAnalysis = await this.callRealAI(symbol);
        const currentPosition = context.positions.get(symbol) || 0;
        
        // ULTRA AGGRESSIVE BUY CONDITIONS
        const isAnyBuySignal = 
          aiAnalysis.recommendation === "BUY" || 
          aiAnalysis.recommendation === "STRONG_BUY" ||
          aiAnalysis.recommendation === "WEAK BUY" ||
          (aiAnalysis.recommendation === "HOLD" && aiAnalysis.confidence >= 50) ||
          (aiAnalysis.confidence >= 60); // ANY high confidence
        
        if (isAnyBuySignal && currentPosition === 0) {
          const maxInvestment = context.portfolioValue * this.maxPositionSize;
          const affordableShares = Math.floor(maxInvestment / priceData.close);
          
          if (affordableShares > 0 && context.cash >= (affordableShares * priceData.close)) {
            enhancedSignals.push({
              symbol: symbol,
              action: "BUY",
              quantity: affordableShares,
              price: priceData.close,
              reason: `íº€ ULTRA AGGRESSIVE: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%) - TARGETING 1% DAILY`
            });
            
            this.entryPrices.set(symbol, priceData.close);
          }
        }
        
        // QUICK PROFIT TAKING for 1% daily target
        else if (currentPosition > 0) {
          const entryPrice = this.entryPrices.get(symbol);
          
          if (entryPrice) {
            const gainLoss = (priceData.close - entryPrice) / entryPrice;
            
            // Take profits FASTER to compound to 1% daily
            if (gainLoss >= 0.008 || // 0.8% profit
                gainLoss <= this.stopLoss ||
                aiAnalysis.confidence < 45) {
              
              enhancedSignals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í²° ULTRA QUICK PROFIT: +${(gainLoss * 100).toFixed(1)}% - COMPOUNDING TO 1% DAILY`
              });
              
              this.entryPrices.delete(symbol);
            }
          }
        }
        
        await this.delay(25); // Even faster calls
        
      } catch (error) {
        console.warn(`Ultra strategy error for ${symbol}:`, error.message);
      }
    }
    
    return enhancedSignals.length > 0 ? enhancedSignals : baseSignals;
  }
  
  // Reset daily tracking
  resetDailyTracking(portfolioValue) {
    this.dailyStartValue = portfolioValue;
    this.dailyTargetHit = false;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = OnePctDailyStrategy;
}

console.log("âœ… 1% Daily Target Strategy created!");
