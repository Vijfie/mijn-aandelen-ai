console.log("Creating FIXED AI Strategy...");

const axios = require("axios");
const Helpers = require("./helpers");

class FixedAIStrategy {
  constructor(options = {}) {
    this.name = "Fixed Real AI Strategy";
    this.apiBaseUrl = options.apiUrl || "http://localhost:3001";
    this.minConfidence = options.minConfidence || 60;
    this.maxPositionSize = options.maxPositionSize || 0.3;
    this.stopLoss = options.stopLoss || -0.08;
    this.profitTarget = options.profitTarget || 0.12;
    
    this.entryPrices = new Map();
    this.aiAnalyses = [];
    this.apiCallCount = 0;
  }
  
  async callRealAI(symbol) {
    try {
      this.apiCallCount++;
      console.log(`í´– [${this.apiCallCount}] Calling your AI for ${symbol}...`);
      
      const response = await axios.post(`${this.apiBaseUrl}/api/analyze`, {
        question: `Analyseer ${symbol}`
      }, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" }
      });
      
      const aiResult = response.data;
      console.log(`âœ… AI Response for ${symbol}: ${aiResult.recommendation} (${aiResult.confidence}%)`);
      
      return {
        recommendation: aiResult.recommendation,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning || [],
        fundamentalScore: aiResult.analysis?.fundamental_score || 50,
        technicalScore: aiResult.analysis?.technical_score || 50,
        overallScore: aiResult.analysis?.overall_score || 50,
        source: "Real AI Backend"
      };
      
    } catch (error) {
      console.warn(`âš ï¸ AI API failed for ${symbol}:`, error.message);
      return this.getMockAnalysis(symbol);
    }
  }
  
  getMockAnalysis(symbol) {
    return {
      recommendation: "HOLD",
      confidence: 50,
      reasoning: [`Fallback for ${symbol}`],
      fundamentalScore: 50,
      technicalScore: 50,
      overallScore: 50,
      source: "Fallback"
    };
  }
  
  async generateSignals(currentData, context) {
    const signals = [];
    const { portfolioValue, cash, positions, date } = context;
    
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
        
        // í´¥ FIXED: Support for WEAK BUY signals!
        const isBuySignal = aiAnalysis.recommendation === "BUY" || 
                           aiAnalysis.recommendation === "STRONG_BUY" ||
                           aiAnalysis.recommendation === "WEAK BUY";  // í¶• ADDED!
        
        // BUY LOGIC
        if (isBuySignal && aiAnalysis.confidence >= this.minConfidence && currentPosition === 0) {
          
          const maxInvestment = portfolioValue * this.maxPositionSize;
          const affordableShares = Math.floor(maxInvestment / priceData.close);
          
          if (affordableShares > 0 && cash >= (affordableShares * priceData.close)) {
            signals.push({
              symbol: symbol,
              action: "BUY",
              quantity: affordableShares,
              price: priceData.close,
              reason: `í´– REAL AI: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%) - ${aiAnalysis.reasoning[0] || "AI buy signal"}`
            });
            
            this.entryPrices.set(symbol, priceData.close);
          }
        }
        
        // SELL LOGIC
        else if (currentPosition > 0) {
          const entryPrice = this.entryPrices.get(symbol);
          
          if (entryPrice) {
            const gainLoss = (priceData.close - entryPrice) / entryPrice;
            
            // í´¥ FIXED: Support for WEAK SELL signals!
            const isSellSignal = aiAnalysis.recommendation === "SELL" || 
                                aiAnalysis.recommendation === "STRONG_SELL" ||
                                aiAnalysis.recommendation === "WEAK SELL";  // í¶• ADDED!
            
            if (isSellSignal && aiAnalysis.confidence >= this.minConfidence) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í´– REAL AI SELL: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%) - ${aiAnalysis.reasoning[0]}`
              });
              
              this.entryPrices.delete(symbol);
            }
            
            // Profit/Loss targets
            else if (gainLoss >= this.profitTarget) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í²° Profit target: +${(gainLoss * 100).toFixed(1)}%`
              });
              
              this.entryPrices.delete(symbol);
            }
            else if (gainLoss <= this.stopLoss) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í»¡ï¸ Stop loss: ${(gainLoss * 100).toFixed(1)}%`
              });
              
              this.entryPrices.delete(symbol);
            }
          }
        }
        
        await Helpers.delay(100);
        
      } catch (error) {
        console.warn(`Strategy error for ${symbol}:`, error.message);
      }
    }
    
    return signals;
  }
  
  getStrategyInfo() {
    const realAICalls = this.aiAnalyses.filter(a => a.analysis.source === "Real AI Backend").length;
    const mockCalls = this.aiAnalyses.filter(a => a.analysis.source === "Fallback").length;
    
    return {
      name: this.name,
      totalAnalyses: this.aiAnalyses.length,
      realAICalls: realAICalls,
      mockCalls: mockCalls,
      apiSuccessRate: `${((realAICalls / this.apiCallCount) * 100).toFixed(1)}%`,
      averageConfidence: this.aiAnalyses.length > 0 ? 
        (this.aiAnalyses.reduce((sum, a) => sum + a.analysis.confidence, 0) / this.aiAnalyses.length).toFixed(1) :
        "N/A"
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = FixedAIStrategy;
}

console.log("âœ… Fixed AI Strategy created! Now supports WEAK BUY/SELL!");
