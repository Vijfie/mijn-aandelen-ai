console.log("=== LEVERAGED AI STRATEGY ===");

const FixedAIStrategy = require("./FixedAIStrategy");

class LeveragedAIStrategy extends FixedAIStrategy {
  constructor(options = {}) {
    super(options);
    this.name = "Leveraged AI Strategy";
    this.leverage = options.leverage || 3; // 3x leverage
    this.minConfidence = options.minConfidence || 60;
    this.maxPositionSize = options.maxPositionSize || 0.9; // 90% van capital
    this.profitTarget = options.profitTarget || 0.015; // 1.5% target (becomes 4.5% with 3x)
    this.stopLoss = options.stopLoss || -0.01; // 1% stop (becomes -3% with 3x)
    this.dailyProfitTarget = options.dailyProfitTarget || 0.01; // 1% per day target
  }
  
  async generateSignals(currentData, context) {
    const signals = [];
    const { portfolioValue, cash, positions, date } = context;
    
    // Check if we hit daily profit target
    const dailyReturn = (portfolioValue - 100000) / 100000; // Assuming 100k start
    if (dailyReturn >= this.dailyProfitTarget) {
      console.log(`í¾¯ Daily target hit: ${(dailyReturn * 100).toFixed(2)}% - No more trades today`);
      return signals; // Stop trading for today
    }
    
    for (const [symbol, priceData] of Object.entries(currentData)) {
      try {
        const aiAnalysis = await this.callRealAI(symbol);
        
        this.aiAnalyses.push({
          date: date,
          symbol: symbol,
          price: priceData.close,
          analysis: aiAnalysis
        });
        
        const currentPosition = positions.get(symbol) || 0;
        
        // HIGH CONFIDENCE ONLY for leverage
        const isStrongBuy = aiAnalysis.recommendation === "BUY" || 
                           aiAnalysis.recommendation === "STRONG_BUY" ||
                           (aiAnalysis.recommendation === "WEAK BUY" && aiAnalysis.confidence >= 70);
        
        if (isStrongBuy && aiAnalysis.confidence >= this.minConfidence && currentPosition === 0) {
          
          // LEVERAGED POSITION SIZING
          const leveragedCapital = portfolioValue * this.leverage;
          const maxInvestment = leveragedCapital * this.maxPositionSize;
          const affordableShares = Math.floor(maxInvestment / priceData.close);
          
          // Only execute if we have enough cash (margin simulation)
          const requiredCash = affordableShares * priceData.close;
          if (requiredCash <= cash && affordableShares > 0) {
            signals.push({
              symbol: symbol,
              action: "BUY",
              quantity: affordableShares,
              price: priceData.close,
              reason: `âš¡ LEVERAGED ${this.leverage}x: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%) - ${aiAnalysis.reasoning[0] || "High confidence signal"}`
            });
            
            this.entryPrices.set(symbol, priceData.close);
          }
        }
        
        // QUICK EXIT with leverage
        else if (currentPosition > 0) {
          const entryPrice = this.entryPrices.get(symbol);
          
          if (entryPrice) {
            const gainLoss = (priceData.close - entryPrice) / entryPrice;
            const leveragedGainLoss = gainLoss * this.leverage; // Amplify gains/losses
            
            // Sell signals
            const isSellSignal = aiAnalysis.recommendation === "SELL" || 
                                aiAnalysis.recommendation === "WEAK_SELL" ||
                                aiAnalysis.confidence < 50;
            
            if (isSellSignal || leveragedGainLoss >= this.profitTarget || leveragedGainLoss <= this.stopLoss) {
              let reason = "";
              if (leveragedGainLoss >= this.profitTarget) {
                reason = `í²° Leveraged profit: +${(leveragedGainLoss * 100).toFixed(1)}% (${this.leverage}x)`;
              } else if (leveragedGainLoss <= this.stopLoss) {
                reason = `íº¨ Leveraged stop: ${(leveragedGainLoss * 100).toFixed(1)}% (${this.leverage}x)`;
              } else {
                reason = `í³‰ AI sell signal: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%)`;
              }
              
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: reason
              });
              
              this.entryPrices.delete(symbol);
            }
          }
        }
        
        await this.delay(75);
        
      } catch (error) {
        console.warn(`Leveraged strategy error for ${symbol}:`, error.message);
      }
    }
    
    return signals;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LeveragedAIStrategy;
}

console.log("âœ… Leveraged AI Strategy created!");
