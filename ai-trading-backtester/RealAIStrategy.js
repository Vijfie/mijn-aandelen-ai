console.log("Creating Real AI API Connector...");

const axios = require("axios");
const Helpers = require("./helpers");

class RealAIStrategy {
  constructor(options = {}) {
    this.name = "Real AI Analysis Strategy";
    this.apiBaseUrl = options.apiUrl || "http://localhost:3001"; // Je backend URL
    this.minConfidence = options.minConfidence || 70;
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
      
      // Call je echte backend API
      const response = await axios.post(`${this.apiBaseUrl}/api/analyze`, {
        question: `Analyseer ${symbol}`
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          "Content-Type": "application/json"
        }
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
      
      // Fallback to mock if API fails
      return this.getMockAnalysis(symbol);
    }
  }
  
  getMockAnalysis(symbol) {
    console.log(`í´„ Using fallback analysis for ${symbol}`);
    
    const recommendations = ["BUY", "HOLD", "SELL"];
    const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
    const confidence = 60 + Math.random() * 30; // 60-90%
    
    return {
      recommendation,
      confidence: Math.round(confidence),
      reasoning: [`Fallback analysis for ${symbol}`, "API unavailable"],
      fundamentalScore: 50 + (Math.random() - 0.5) * 40,
      technicalScore: 50 + (Math.random() - 0.5) * 40,
      overallScore: 50 + (Math.random() - 0.5) * 40,
      source: "Fallback Mock"
    };
  }
  
  async generateSignals(currentData, context) {
    const signals = [];
    const { portfolioValue, cash, positions, date } = context;
    
    // Rate limiting - max 1 AI call per symbol per day
    const dailyCallLimit = Object.keys(currentData).length;
    let callsToday = 0;
    
    for (const [symbol, priceData] of Object.entries(currentData)) {
      if (callsToday >= dailyCallLimit) break;
      
      try {
        // Get AI analysis
        const aiAnalysis = await this.callRealAI(symbol);
        callsToday++;
        
        // Store for reporting
        this.aiAnalyses.push({
          date: date,
          symbol: symbol,
          price: priceData.close,
          analysis: aiAnalysis
        });
        
        const currentPosition = positions.get(symbol) || 0;
        
        // BUY LOGIC - AI recommends BUY with sufficient confidence
        if (aiAnalysis.recommendation === "BUY" && 
            aiAnalysis.confidence >= this.minConfidence && 
            currentPosition === 0) {
          
          const maxInvestment = portfolioValue * this.maxPositionSize;
          const affordableShares = Math.floor(maxInvestment / priceData.close);
          
          if (affordableShares > 0 && cash >= (affordableShares * priceData.close)) {
            signals.push({
              symbol: symbol,
              action: "BUY",
              quantity: affordableShares,
              price: priceData.close,
              reason: `í´– REAL AI: ${aiAnalysis.recommendation} (${aiAnalysis.confidence}%) - ${aiAnalysis.reasoning[0] || "Strong AI signal"}`
            });
            
            this.entryPrices.set(symbol, priceData.close);
          }
        }
        
        // SELL LOGIC
        else if (currentPosition > 0) {
          const entryPrice = this.entryPrices.get(symbol);
          
          if (entryPrice) {
            const gainLoss = (priceData.close - entryPrice) / entryPrice;
            
            // AI recommends SELL
            if (aiAnalysis.recommendation === "SELL" && 
                aiAnalysis.confidence >= this.minConfidence) {
              
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í´– REAL AI SELL: ${aiAnalysis.confidence}% confidence - ${aiAnalysis.reasoning[0] || "AI sell signal"}`
              });
              
              this.entryPrices.delete(symbol);
            }
            
            // Profit target or stop loss
            else if (gainLoss >= this.profitTarget) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í²° Profit target: +${(gainLoss * 100).toFixed(1)}% (AI was ${aiAnalysis.confidence}% confident)`
              });
              
              this.entryPrices.delete(symbol);
            }
            else if (gainLoss <= this.stopLoss) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `í»¡ï¸ Stop loss: ${(gainLoss * 100).toFixed(1)}% (AI confidence: ${aiAnalysis.confidence}%)`
              });
              
              this.entryPrices.delete(symbol);
            }
          }
        }
        
        // Small delay to be nice to your API
        await Helpers.delay(100);
        
      } catch (error) {
        console.warn(`Strategy error for ${symbol}:`, error.message);
      }
    }
    
    return signals;
  }
  
  getStrategyInfo() {
    const realAICalls = this.aiAnalyses.filter(a => a.analysis.source === "Real AI Backend").length;
    const mockCalls = this.aiAnalyses.filter(a => a.analysis.source === "Fallback Mock").length;
    
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

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = RealAIStrategy;
}

console.log("âœ… Real AI Strategy created! Ready to connect to your backend!");
