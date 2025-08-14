console.log("Creating AI-Powered Strategy...");

const Helpers = require("./helpers");

// Simuleer je analysisEngine (we maken een lokale versie)
class MockAnalysisEngine {
  
  async analyzeStock(stockInfo, historicalData, technicalIndicators) {
    const fundamental = this.analyzeFundamentals(stockInfo);
    const technical = this.analyzeTechnical(technicalIndicators, stockInfo);
    const overall = this.combineAnalysis(fundamental, technical);
    
    return {
      symbol: stockInfo.symbol,
      recommendation: overall.recommendation,
      confidence: overall.confidence,
      reasoning: overall.reasoning,
      fundamentalScore: fundamental.score,
      technicalScore: technical.score,
      overallScore: overall.score
    };
  }

  analyzeFundamentals(stockInfo) {
    let score = 50;
    const reasons = [];

    // P/E ratio analysis (simuleer met random maar realistic values)
    const pe = 15 + Math.random() * 20; // PE tussen 15-35
    if (pe < 18) {
      score += 15;
      reasons.push(`Lage P/E ratio (${pe.toFixed(1)}) suggereert ondergewaardeerd`);
    } else if (pe > 28) {
      score -= 10;
      reasons.push(`Hoge P/E ratio (${pe.toFixed(1)}) mogelijk overgewaardeerd`);
    }

    // Price momentum
    const changePercent = (Math.random() - 0.5) * 8; // -4% tot +4%
    if (changePercent > 2) {
      score += 10;
      reasons.push(`Sterke momentum: +${changePercent.toFixed(1)}%`);
    } else if (changePercent < -2) {
      score -= 10;
      reasons.push(`Negatieve momentum: ${changePercent.toFixed(1)}%`);
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }

  analyzeTechnical(indicators, stockInfo) {
    let score = 50;
    const reasons = [];

    // RSI analysis  
    const rsi = 30 + Math.random() * 40; // RSI tussen 30-70
    if (rsi < 35) {
      score += 20;
      reasons.push(`RSI oversold (${rsi.toFixed(1)}) - sterke koop signaal`);
    } else if (rsi > 65) {
      score -= 15;
      reasons.push(`RSI overbought (${rsi.toFixed(1)}) - voorzichtigheid geboden`);
    } else if (rsi < 45) {
      score += 10;
      reasons.push(`RSI gunstig voor koop (${rsi.toFixed(1)})`);
    }

    // Trend analysis
    const trends = ["STRONG_UP", "UP", "NEUTRAL", "DOWN", "STRONG_DOWN"];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    switch (trend) {
      case "STRONG_UP":
        score += 15;
        reasons.push("Sterke opwaartse trend gedetecteerd");
        break;
      case "UP":
        score += 8;
        reasons.push("Positieve prijstrend");
        break;
      case "STRONG_DOWN":
        score -= 15;
        reasons.push("Sterke neerwaartse trend");
        break;
      case "DOWN":
        score -= 8;
        reasons.push("Negatieve trend");
        break;
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }

  combineAnalysis(fundamental, technical) {
    const combinedScore = (technical.score * 0.6) + (fundamental.score * 0.4);
    
    let recommendation, confidence;
    
    if (combinedScore >= 75) {
      recommendation = "STRONG_BUY";
      confidence = Math.min(95, combinedScore + 15);
    } else if (combinedScore >= 65) {
      recommendation = "BUY";
      confidence = Math.min(90, combinedScore + 10);
    } else if (combinedScore >= 55) {
      recommendation = "HOLD";
      confidence = Math.max(60, combinedScore);
    } else if (combinedScore >= 45) {
      recommendation = "WEAK_SELL";
      confidence = Math.min(80, 100 - combinedScore + 5);
    } else {
      recommendation = "SELL";
      confidence = Math.min(95, 100 - combinedScore + 10);
    }

    const allReasons = [
      ...fundamental.reasons.slice(0, 2),
      ...technical.reasons.slice(0, 3)
    ];

    return {
      score: combinedScore,
      recommendation,
      confidence: Math.round(confidence),
      reasoning: allReasons
    };
  }
}

class AIStrategy {
  constructor(options = {}) {
    this.name = "AI-Powered Analysis Strategy";
    this.analysisEngine = new MockAnalysisEngine();
    this.minConfidence = options.minConfidence || 70; // Minimum 70% confidence
    this.maxPositionSize = options.maxPositionSize || 0.3; // Max 30% per position
    this.stopLoss = options.stopLoss || -0.08; // -8% stop loss
    this.profitTarget = options.profitTarget || 0.12; // +12% profit target
    
    // Track AI recommendations
    this.recommendations = new Map();
    this.entryPrices = new Map();
    this.analysisHistory = [];
  }
  
  async generateSignals(currentData, context) {
    const signals = [];
    const { portfolioValue, cash, positions } = context;
    
    for (const [symbol, priceData] of Object.entries(currentData)) {
      try {
        // Create stock info object
        const stockInfo = {
          symbol: symbol,
          price: priceData.close,
          change: priceData.close - priceData.open,
          changePercent: ((priceData.close - priceData.open) / priceData.open) * 100
        };
        
        // Run AI analysis
        const analysis = await this.analysisEngine.analyzeStock(
          stockInfo, 
          null, // historicalData not needed for this mock
          null  // technicalIndicators calculated internally
        );
        
        // Store analysis
        this.analysisHistory.push({
          date: context.date,
          symbol: symbol,
          price: priceData.close,
          analysis: analysis
        });
        
        const currentPosition = positions.get(symbol) || 0;
        
        // BUY SIGNALS - AI recommends buy with high confidence
        if ((analysis.recommendation === "BUY" || analysis.recommendation === "STRONG_BUY") && 
            analysis.confidence >= this.minConfidence && 
            currentPosition === 0) {
          
          const maxInvestment = portfolioValue * this.maxPositionSize;
          const affordableShares = Math.floor(maxInvestment / priceData.close);
          
          if (affordableShares > 0 && cash >= (affordableShares * priceData.close)) {
            signals.push({
              symbol: symbol,
              action: "BUY",
              quantity: affordableShares,
              price: priceData.close,
              reason: `AI ${analysis.recommendation}: ${analysis.confidence}% confidence. ${analysis.reasoning[0] || "Strong analysis"}`
            });
            
            // Track entry and AI recommendation
            this.entryPrices.set(symbol, priceData.close);
            this.recommendations.set(symbol, analysis);
          }
        }
        
        // SELL SIGNALS
        else if (currentPosition > 0) {
          const entryPrice = this.entryPrices.get(symbol);
          const entryAnalysis = this.recommendations.get(symbol);
          
          if (entryPrice) {
            const gainLoss = (priceData.close - entryPrice) / entryPrice;
            
            // AI recommends sell
            if ((analysis.recommendation === "SELL" || analysis.recommendation === "WEAK_SELL") && 
                analysis.confidence >= this.minConfidence) {
              
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `AI ${analysis.recommendation}: ${analysis.confidence}% confidence. ${analysis.reasoning[0] || "Strong sell signal"}`
              });
              
              this.entryPrices.delete(symbol);
              this.recommendations.delete(symbol);
            }
            
            // Profit target hit
            else if (gainLoss >= this.profitTarget) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `Profit target hit: +${(gainLoss * 100).toFixed(1)}% (Original AI: ${entryAnalysis?.recommendation || "N/A"})`
              });
              
              this.entryPrices.delete(symbol);
              this.recommendations.delete(symbol);
            }
            
            // Stop loss hit  
            else if (gainLoss <= this.stopLoss) {
              signals.push({
                symbol: symbol,
                action: "SELL",
                quantity: currentPosition,
                price: priceData.close,
                reason: `Stop loss triggered: ${(gainLoss * 100).toFixed(1)}% (AI confidence was ${entryAnalysis?.confidence || "N/A"}%)`
              });
              
              this.entryPrices.delete(symbol);
              this.recommendations.delete(symbol);
            }
          }
        }
        
      } catch (error) {
        console.warn(`AI analysis error for ${symbol}:`, error.message);
      }
    }
    
    return signals;
  }
  
  getStrategyInfo() {
    return {
      name: this.name,
      parameters: {
        minConfidence: `${this.minConfidence}%`,
        maxPositionSize: `${(this.maxPositionSize * 100).toFixed(1)}%`,
        profitTarget: `${(this.profitTarget * 100).toFixed(1)}%`,
        stopLoss: `${(this.stopLoss * 100).toFixed(1)}%`
      },
      totalAnalyses: this.analysisHistory.length,
      aiInsights: this.getAIInsights()
    };
  }
  
  getAIInsights() {
    if (this.analysisHistory.length === 0) return null;
    
    const recentAnalyses = this.analysisHistory.slice(-20);
    const avgConfidence = recentAnalyses.reduce((sum, a) => sum + a.analysis.confidence, 0) / recentAnalyses.length;
    
    const recommendations = recentAnalyses.reduce((acc, a) => {
      acc[a.analysis.recommendation] = (acc[a.analysis.recommendation] || 0) + 1;
      return acc;
    }, {});
    
    return {
      averageConfidence: avgConfidence.toFixed(1),
      recommendationBreakdown: recommendations,
      totalSignals: recentAnalyses.length,
      strongSignals: recentAnalyses.filter(a => a.analysis.confidence >= 80).length
    };
  }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = AIStrategy;
}

console.log("✅ AI-Powered Strategy created successfully!");
