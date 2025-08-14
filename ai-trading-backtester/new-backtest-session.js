console.log("=== NEW TIMESTAMPED BACKTESTING SESSION ===");

const TimestampedBacktestEngine = require("./TimestampedBacktestEngine");
const FixedAIStrategy = require("./FixedAIStrategy");
const OnePctDailyStrategy = require("./OnePctDailyStrategy");

class NewBacktestSession {
  constructor() {
    this.results = [];
    this.sessionStart = new Date();
  }
  
  async runNewBacktests() {
    console.log("Ìµê Starting NEW timestamped backtesting session...");
    console.log(`Ì≥Ö Session started: ${this.sessionStart.toLocaleString("nl-NL", {timeZone: "Europe/Amsterdam"})}`);
    console.log("");
    
    // New test scenarios with current market conditions
    const scenarios = [
      {
        strategyPrefix: "Current_Market_Analysis",
        strategy: FixedAIStrategy,
        symbols: ["TSLA", "AAPL"],
        capital: 50000,
        params: {
          minConfidence: 60,
          maxPositionSize: 0.3,
          profitTarget: 0.08,
          stopLoss: -0.04
        }
      },
      {
        strategyPrefix: "High_Confidence_Only",
        strategy: FixedAIStrategy,
        symbols: ["TSLA", "NVDA", "MSFT"],
        capital: 75000,
        params: {
          minConfidence: 70, // Higher confidence
          maxPositionSize: 0.25,
          profitTarget: 0.10,
          stopLoss: -0.05
        }
      },
      {
        strategyPrefix: "One_Percent_Daily_Target",
        strategy: OnePctDailyStrategy,
        symbols: ["TSLA"],
        capital: 25000,
        params: {
          minConfidence: 55,
          maxPositionSize: 0.8,
          profitTarget: 0.012,
          stopLoss: -0.006
        }
      },
      {
        strategyPrefix: "Conservative_Balanced",
        strategy: FixedAIStrategy,
        symbols: ["AAPL", "MSFT", "GOOGL"],
        capital: 100000,
        params: {
          minConfidence: 65,
          maxPositionSize: 0.2,
          profitTarget: 0.06,
          stopLoss: -0.03
        }
      },
      {
        strategyPrefix: "Ultra_Aggressive_Tech",
        strategy: OnePctDailyStrategy,
        symbols: ["TSLA", "NVDA"],
        capital: 30000,
        params: {
          minConfidence: 50,
          maxPositionSize: 0.9,
          profitTarget: 0.015,
          stopLoss: -0.008
        }
      }
    ];
    
    console.log(`ÌæØ Running ${scenarios.length} NEW timestamped scenarios...`);
    console.log("‚è∞ Each backtest will have unique timestamp identifier");
    console.log("");
    
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      const testNumber = String(i + 1).padStart(2, "0");
      
      console.log(`\\n[${testNumber}/${scenarios.length}] Ì¥¨ Testing: ${scenario.strategyPrefix}`);
      console.log(`   Ì≥ä Symbols: ${scenario.symbols.join(", ")}`);
      console.log(`   Ì≤∞ Capital: $${scenario.capital.toLocaleString()}`);
      console.log(`   ÌæØ Confidence: ${scenario.params.minConfidence}%`);
      
      try {
        const engine = new TimestampedBacktestEngine({
          startingCapital: scenario.capital,
          commission: 0.001,
          slippage: 0.0005,
          strategyPrefix: scenario.strategyPrefix
        });
        
        await engine.initialize();
        
        const strategy = new scenario.strategy({
          apiUrl: "http://localhost:3001",
          ...scenario.params
        });
        
        const startTime = Date.now();
        const results = await engine.backtest(
          strategy,
          scenario.symbols,
          "2025-08-01", // Recent period
          "2025-08-13"
        );
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        this.results.push({
          testName: engine.testName,
          scenario: scenario.strategyPrefix,
          ...results.metrics,
          duration: duration,
          aiCalls: strategy.getStrategyInfo().realAICalls || 0,
          timestamp: new Date().toISOString()
        });
        
        console.log(`   ‚úÖ Completed: ${engine.testName}`);
        console.log(`   ‚è±Ô∏è Duration: ${duration}s`);
        console.log(`   Ì≥à Return: ${results.metrics.totalReturn.toFixed(2)}%`);
        console.log(`   Ì¥Ñ Trades: ${results.metrics.totalTrades}`);
        
        await engine.close();
        
        // Delay between tests
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.log(`   ‚ùå Failed: ${error.message}`);
      }
    }
    
    await this.generateSessionReport();
  }
  
  async generateSessionReport() {
    const sessionEnd = new Date();
    const duration = ((sessionEnd - this.sessionStart) / 1000 / 60).toFixed(1);
    
    console.log("\\n\\nÌµê === NEW BACKTESTING SESSION COMPLETE ===");
    console.log(`Ì≥Ö Started: ${this.sessionStart.toLocaleString("nl-NL")}`);
    console.log(`Ì≥Ö Ended: ${sessionEnd.toLocaleString("nl-NL")}`);
    console.log(`‚è±Ô∏è Total Duration: ${duration} minutes`);
    console.log("");
    
    // Sort results by performance
    const sorted = [...this.results].sort((a, b) => b.totalReturn - a.totalReturn);
    
    console.log("ÌøÜ SESSION PERFORMANCE RANKING:");
    sorted.forEach((result, index) => {
      const medal = index === 0 ? "Ìµá" : index === 1 ? "Ìµà" : index === 2 ? "Ìµâ" : `${index + 1}.`;
      console.log(`${medal} ${result.testName}:`);
      console.log(`   Ì≥à Return: ${result.totalReturn.toFixed(2)}%`);
      console.log(`   Ì≤∞ Final Value: $${result.finalValue.toLocaleString()}`);
      console.log(`   ‚ö° Sharpe: ${(result.sharpeRatio || 0).toFixed(2)}`);
      console.log(`   Ì¥Ñ Trades: ${result.totalTrades}`);
      console.log(`   Ì¥ñ AI Calls: ${result.aiCalls}`);
      console.log(`   Ìµê Timestamp: ${new Date(result.timestamp).toLocaleString("nl-NL")}`);
      console.log("");
    });
    
    // Session statistics
    const avgReturn = this.results.reduce((sum, r) => sum + r.totalReturn, 0) / this.results.length;
    const bestReturn = Math.max(...this.results.map(r => r.totalReturn));
    const worstReturn = Math.min(...this.results.map(r => r.totalReturn));
    const totalTrades = this.results.reduce((sum, r) => sum + r.totalTrades, 0);
    const totalAICalls = this.results.reduce((sum, r) => sum + r.aiCalls, 0);
    
    console.log("Ì≥ä SESSION STATISTICS:");
    console.log(`   Ì≥à Average Return: ${avgReturn.toFixed(2)}%`);
    console.log(`   ÌøÜ Best Return: ${bestReturn.toFixed(2)}%`);
    console.log(`   Ì≥â Worst Return: ${worstReturn.toFixed(2)}%`);
    console.log(`   Ì¥Ñ Total Trades: ${totalTrades}`);
    console.log(`   Ì¥ñ Total AI Calls: ${totalAICalls}`);
    console.log(`   Ì≥ä Tests Completed: ${this.results.length}`);
    console.log(`   ‚è∞ Session Duration: ${duration} minutes`);
    
    // Best strategy
    const best = sorted[0];
    console.log("\\nÌæØ SESSION WINNER:");
    console.log(`   ÌøÜ Best Strategy: ${best.testName}`);
    console.log(`   Ì≥à Return: ${best.totalReturn.toFixed(2)}%`);
    console.log(`   Ì≤∞ Profit: $${(best.finalValue - best.startingCapital).toFixed(2)}`);
    console.log(`   ‚ö° Risk-Adjusted: ${(best.sharpeRatio || 0).toFixed(2)} Sharpe`);
    
    console.log("\\n‚ú® New backtesting session completed!");
    console.log("Ì≤æ All results saved to database with timestamps");
    console.log("Ìºê Check dashboard for updated results!");
    
    return this.results;
  }
}

// Run the new backtesting session
async function runNewBacktestSession() {
  const session = new NewBacktestSession();
  await session.runNewBacktests();
}

runNewBacktestSession().catch(console.error);
