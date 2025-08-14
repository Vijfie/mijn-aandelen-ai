console.log("Creating Enhanced Database Backtest Engine...");

const BacktestEngine = require("./BacktestEngine");
const BacktestDatabase = require("./BacktestDatabase");
const FixedAIStrategy = require("./FixedAIStrategy");

class DatabaseBacktestEngine extends BacktestEngine {
  constructor(options = {}) {
    super(options);
    this.db = new BacktestDatabase(options.dbPath || "backtests.db");
    this.backtestId = null;
    this.testName = options.testName || `Backtest_${Date.now()}`;
  }
  
  async initialize() {
    await this.db.initialize();
  }
  
  async backtest(strategy, symbols, startDate, endDate, timeframe = "1d") {
    console.log("Ì∫Ä Starting DATABASE backtest...");
    
    // Run normal backtest
    const results = await super.backtest(strategy, symbols, startDate, endDate, timeframe);
    
    // Save to database
    await this.saveResultsToDatabase(strategy, symbols, startDate, endDate, results);
    
    return results;
  }
  
  async saveResultsToDatabase(strategy, symbols, startDate, endDate, results) {
    try {
      console.log("Ì≤æ Saving results to database...");
      
      // Get strategy info
      const strategyInfo = strategy.getStrategyInfo ? strategy.getStrategyInfo() : {};
      
      // Save main backtest record
      this.backtestId = await this.db.saveBacktest({
        testName: this.testName,
        strategyName: strategy.name || "Unknown Strategy",
        symbols: symbols,
        startDate: startDate,
        endDate: endDate,
        startingCapital: this.startingCapital,
        finalValue: results.metrics.finalValue,
        totalReturn: results.metrics.totalReturn,
        sharpeRatio: results.metrics.sharpeRatio || 0,
        maxDrawdown: results.metrics.maxDrawdown,
        totalTrades: results.metrics.totalTrades,
        tradingDays: results.metrics.tradingDays,
        aiCalls: strategyInfo.realAICalls || 0,
        aiSuccessRate: parseFloat(strategyInfo.apiSuccessRate?.replace("%", "") || 0),
        avgConfidence: parseFloat(strategyInfo.averageConfidence || 0),
        parameters: {
          commission: this.commission,
          slippage: this.slippage,
          strategyParams: strategyInfo.parameters || {}
        },
        notes: `Automated backtest run at ${new Date().toISOString()}`
      });
      
      console.log(`‚úÖ Backtest saved with ID: ${this.backtestId}`);
      
      // Save all trades
      for (const trade of results.trades) {
        await this.db.saveTrade(this.backtestId, {
          date: trade.date,
          symbol: trade.symbol,
          action: trade.action,
          quantity: trade.quantity,
          price: trade.price,
          commission: trade.commission || 0,
          totalValue: trade.value,
          reason: trade.reason,
          aiRecommendation: this.extractAIRecommendation(trade.reason),
          aiConfidence: this.extractAIConfidence(trade.reason)
        });
      }
      
      // Save portfolio history
      for (let i = 0; i < results.equityCurve.length; i++) {
        const snapshot = results.equityCurve[i];
        const dailyReturn = i > 0 ? 
          (snapshot.value - results.equityCurve[i-1].value) / results.equityCurve[i-1].value : 0;
        
        await this.db.savePortfolioSnapshot(
          this.backtestId,
          snapshot.date,
          snapshot.value,
          snapshot.cash,
          Object.fromEntries(snapshot.positions),
          dailyReturn
        );
      }
      
      // Save AI analyses if available
      if (strategy.aiAnalyses) {
        for (const analysis of strategy.aiAnalyses) {
          await this.db.saveAIAnalysis(this.backtestId, {
            date: analysis.date,
            symbol: analysis.symbol,
            price: analysis.price,
            recommendation: analysis.analysis.recommendation,
            confidence: analysis.analysis.confidence,
            fundamentalScore: analysis.analysis.fundamentalScore,
            technicalScore: analysis.analysis.technicalScore,
            overallScore: analysis.analysis.overallScore,
            reasoning: analysis.analysis.reasoning,
            responseTime: 100 // Could track this in the future
          });
        }
      }
      
      console.log("Ì≤æ All data saved to database!");
      
    } catch (error) {
      console.error("‚ùå Failed to save to database:", error.message);
    }
  }
  
  extractAIRecommendation(reason) {
    if (!reason) return null;
    const match = reason.match(/REAL AI: ([A-Z ]+)/);
    return match ? match[1] : null;
  }
  
  extractAIConfidence(reason) {
    if (!reason) return null;
    const match = reason.match(/\((\d+)%\)/);
    return match ? parseInt(match[1]) : null;
  }
  
  async close() {
    await this.db.close();
  }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = DatabaseBacktestEngine;
}

console.log("‚úÖ Enhanced Database Backtest Engine created!");
