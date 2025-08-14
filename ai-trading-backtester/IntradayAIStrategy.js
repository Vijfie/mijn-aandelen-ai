console.log("=== INTRADAY AI STRATEGY ===");

const FixedAIStrategy = require("./FixedAIStrategy");

class IntradayAIStrategy extends FixedAIStrategy {
  constructor(options = {}) {
    super(options);
    this.name = "Intraday AI Strategy";
    this.minConfidence = options.minConfidence || 50; // Lagere threshold
    this.maxPositionSize = options.maxPositionSize || 0.8; // Hoger risico
    this.profitTarget = options.profitTarget || 0.02; // 2% per trade
    this.stopLoss = options.stopLoss || -0.015; // Tighter stop loss
    this.scalingFactor = options.scalingFactor || 2; // Meer aggressive
  }
  
  async generateSignals(currentData, context) {
    const signals = [];
    const { portfolioValue, cash, positions, date } = context;
    
    for (const [symbol, priceData] of Object.entries(currentData)) {
      try {
        // Get AI analysis
        const aiAnalysis = await this.callRealAI(symbol);
        
        this.aiAnalyses.push({
          date: date,
          symbol: symbol,
          price: priceData.close,
          analysis: aiAnalysis
        });
        
        const currentPosition = positions.get(symbol) || 0;
        
        // AGGRESSIVE BUY LOGIC - meer triggers
        const isBuySignal = aiAnalysis.recommendation === "BUY" || 
                           aiAnalysis.recommendation === "STRONG_BUY" ||
                           aiAnalysis.recommendation === "WEAK BUY" ||
                           (aiAnalysis.recommendation === "HOLD" && aiAnalysis.confidence >= 55); // HOLD als zwakke buy
        
        if (isBuySignal && aiAnalysis.confidence >= this.minConfidence && currentPosition === 0) {
          
          // AGGRESSIVE POSITION SIZING
          const maxInvestment = portfolioValue * this.maxPositionSize;
          const affordableShares = Math.floor(maxInvestment / priceData.close);
          
          if (affordableShares > 0 && cash >= (affordableShares * priceData.close)) {
            signals.push({
              symbol: symbol,
              action: "BUY",
              quantity: affordableShares,
              price: priceData.close,
              reason: `íº€ AGGRESSIVE AI: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%) - ${aiAnalysis.reasoning[0] || "Aggressive signal"}`
            });
            
            this.entryPrices.set(symbol, priceData.close);
          }
        }
        
        // QUICK PROFIT TAKING
        else if (currentPosition > 0) {
          const entryPrice = this.entryPrices.get(symbol);
          
          if (entryPrice) {
            const gainLoss = (priceData.close - entryPrice) / entryPrice;
            
            // MULTIPLE SELL TRIGGERS
            const isSellSignal = aiAnalysis.recommendation === "SELL" || 
                                aiAnalysis.recommendation === "STRONG_SELL" ||
                                aiAnalysis.recommendation === "WEAK_SELL" ||
                                (aiAnalysis.recommendation === "HOLD" && aiAnalysis.confidence <= 45); // HOLD als zwakke sell
            
            if (isSellSignal && aiAnalysis.confidence >= 45) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í´¥ AGGRESSIVE AI SELL: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%) - ${aiAnalysis.reasoning[0]}`
              });
              
              this.entryPrices.delete(symbol);
            }
            
            // QUICK PROFIT TARGETS
            else if (gainLoss >= this.profitTarget) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í²° Quick profit: +${(gainLoss * 100).toFixed(1)}%`
              });
              
              this.entryPrices.delete(symbol);
            }
            // TIGHT STOP LOSS
            else if (gainLoss <= this.stopLoss) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `ï¿½ï¿½ï¸ Tight stop: ${(gainLoss * 100).toFixed(1)}%`
              });
              
              this.entryPrices.delete(symbol);
            }
          }
        }
        
        await this.delay(50); // Snellere API calls
        
      } catch (error) {
        console.warn(`Aggressive strategy error for ${symbol}:`, error.message);
      }
    }
    
    return signals;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = IntradayAIStrategy;
}

console.log("âœ… Aggressive Intraday AI Strategy created!");
