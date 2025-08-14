console.log("Creating Enhanced Database Backtest Engine with Auto-Timestamping...");

const BacktestEngine = require("./BacktestEngine");
const BacktestDatabase = require("./BacktestDatabase");

class TimestampedBacktestEngine extends BacktestEngine {
  constructor(options = {}) {
    super(options);
    this.db = new BacktestDatabase(options.dbPath || "backtests.db");
    this.backtestId = null;
    
    // Auto-generate timestamped name
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19); // 2025-08-13T22-30-45
    const strategyPrefix = options.strategyPrefix || "Strategy";
    
    this.testName = options.testName || `${strategyPrefix}_${timestamp}`;
    
    console.log(`Ìµê Auto-generated backtest name: ${this.testName}`);
  }
  
  async initialize() {
    await this.db.initialize();
  }
  
  async backtest(strategy, symbols, startDate, endDate, timeframe = "1d") {
    console.log(`Ì∫Ä Starting timestamped backtest: ${this.testName}`);
    console.log(`Ì≥ä Symbols: ${symbols.join(", ")}`);
    console.log(`Ì≥Ö Period: ${startDate} to ${endDate}`);
    
    // Run normal backtest
    const results = await super.backtest(strategy, symbols, startDate, endDate, timeframe);
    
    // Save to database with timestamp
    await this.saveResultsToDatabase(strategy, symbols, startDate, endDate, results);
    
    return results;
  }
  
  async saveResultsToDatabase(strategy, symbols, startDate, endDate, results) {
    try {
      console.log("Ì≤æ Saving timestamped results to database...");
      
      const strategyInfo = strategy.getStrategyInfo ? strategy.getStrategyInfo() : {};
      
      // Enhanced metadata with timestamp info
      const timestamp = new Date().toISOString();
      
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
          strategyParams: strategyInfo.parameters || {},
          timestamp: timestamp,
          executionTime: new Date().toLocaleString("nl-NL", {timeZone: "Europe/Amsterdam"})
        },
        notes: `Automated backtest executed at ${timestamp}`
      });
      
      console.log(`‚úÖ Backtest saved with ID: ${this.backtestId} and name: ${this.testName}`);
      
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
            responseTime: 100
          });
        }
      }
      
      console.log(`ÔøΩÔøΩ All data saved for ${this.testName}!`);
      
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = TimestampedBacktestEngine;
}

console.log("‚úÖ Timestamped Backtest Engine created!");
