console.log("=== MASS BACKTESTING SYSTEM ===");

const DatabaseBacktestEngine = require("./DatabaseBacktestEngine");
const FixedAIStrategy = require("./FixedAIStrategy");

class MassBacktester {
  constructor() {
    this.results = [];
    this.db = null;
  }
  
  async runMassBacktests() {
    console.log("í´¬ Starting MASS backtesting campaign...");
    
    // Test scenarios
    const scenarios = [
      // Verschillende periodes
      {
        name: "Recent_Bull_Market",
        symbols: ["TSLA", "AAPL"],
        startDate: "2025-07-01",
        endDate: "2025-08-13",
        capital: 50000,
        strategy: { minConfidence: 60, maxPositionSize: 0.25, profitTarget: 0.08, stopLoss: -0.04 }
      },
      {
        name: "Extended_Period",
        symbols: ["TSLA", "AAPL", "MSFT"],
        startDate: "2025-06-01", 
        endDate: "2025-08-13",
        capital: 75000,
        strategy: { minConfidence: 65, maxPositionSize: 0.2, profitTarget: 0.10, stopLoss: -0.05 }
      },
      {
        name: "Conservative_Approach",
        symbols: ["AAPL", "MSFT", "GOOGL"],
        startDate: "2025-07-15",
        endDate: "2025-08-13",
        capital: 100000,
        strategy: { minConfidence: 70, maxPositionSize: 0.15, profitTarget: 0.06, stopLoss: -0.03 }
      },
      {
        name: "Aggressive_Tech",
        symbols: ["TSLA", "NVDA"],
        startDate: "2025-07-01",
        endDate: "2025-08-13", 
        capital: 25000,
        strategy: { minConfidence: 55, maxPositionSize: 0.4, profitTarget: 0.15, stopLoss: -0.08 }
      },
      {
        name: "Diversified_Portfolio",
        symbols: ["TSLA", "AAPL", "MSFT", "GOOGL", "NVDA"],
        startDate: "2025-06-15",
        endDate: "2025-08-13",
        capital: 100000,
        strategy: { minConfidence: 62, maxPositionSize: 0.2, profitTarget: 0.12, stopLoss: -0.06 }
      }
    ];
    
    console.log("Running " + scenarios.length + " different backtest scenarios...");
    console.log("This will take several minutes due to AI API calls...");
    console.log("");
    
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log("\\n[" + (i+1) + "/" + scenarios.length + "] Testing: " + scenario.name);
      console.log("   Symbols: " + scenario.symbols.join(", "));
      console.log("   Period: " + scenario.startDate + " to " + scenario.endDate);
      console.log("   Capital: $" + scenario.capital.toLocaleString());
      
      try {
        const engine = new DatabaseBacktestEngine({
          startingCapital: scenario.capital,
          commission: 0.001,
          slippage: 0.0005,
          testName: scenario.name
        });
        
        await engine.initialize();
        
        const strategy = new FixedAIStrategy({
          apiUrl: "http://localhost:3001",
          minConfidence: scenario.strategy.minConfidence,
          maxPositionSize: scenario.strategy.maxPositionSize,
          profitTarget: scenario.strategy.profitTarget,
          stopLoss: scenario.strategy.stopLoss
        });
        
        const startTime = Date.now();
        const results = await engine.backtest(
          strategy,
          scenario.symbols,
          scenario.startDate,
          scenario.endDate
        );
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        this.results.push({
          scenario: scenario.name,
          ...results.metrics,
          duration: duration,
          aiCalls: strategy.getStrategyInfo().realAICalls
        });
        
        console.log("   Completed in " + duration + "s");
        console.log("   Return: " + results.metrics.totalReturn.toFixed(2) + "%");
        console.log("   Trades: " + results.metrics.totalTrades);
        
        await engine.close();
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log("   Failed: " + error.message);
      }
    }
    
    await this.generateMassReport();
  }
  
  async generateMassReport() {
    console.log("\\n\\nMASS BACKTESTING REPORT");
    
    // Sort by return
    const sorted = [...this.results].sort((a, b) => b.totalReturn - a.totalReturn);
    
    console.log("\\nPERFORMANCE RANKING:");
    sorted.forEach((result, index) => {
      const position = index + 1;
      console.log(position + ". " + result.scenario + ":");
      console.log("   Return: " + result.totalReturn.toFixed(2) + "%");
      console.log("   Final Value: $" + result.finalValue.toLocaleString());
      console.log("   Sharpe: " + (result.sharpeRatio || 0).toFixed(2));
      console.log("   Trades: " + result.totalTrades);
      console.log("   AI Calls: " + result.aiCalls);
      console.log("");
    });
    
    // Aggregate statistics
    const avgReturn = this.results.reduce((sum, r) => sum + r.totalReturn, 0) / this.results.length;
    const bestReturn = Math.max(...this.results.map(r => r.totalReturn));
    const worstReturn = Math.min(...this.results.map(r => r.totalReturn));
    const totalTrades = this.results.reduce((sum, r) => sum + r.totalTrades, 0);
    const totalAICalls = this.results.reduce((sum, r) => sum + r.aiCalls, 0);
    
    console.log("AGGREGATE STATISTICS:");
    console.log("   Average Return: " + avgReturn.toFixed(2) + "%");
    console.log("   Best Return: " + bestReturn.toFixed(2) + "%");
    console.log("   Worst Return: " + worstReturn.toFixed(2) + "%");
    console.log("   Total Trades: " + totalTrades);
    console.log("   Total AI Calls: " + totalAICalls);
    console.log("   Total Duration: " + this.results.reduce((sum, r) => sum + parseFloat(r.duration), 0).toFixed(1) + "s");
    
    // Best strategy analysis
    const best = sorted[0];
    console.log("\\nBEST STRATEGY ANALYSIS:");
    console.log("   Winner: " + best.scenario);
    console.log("   Return: " + best.totalReturn.toFixed(2) + "%");
    console.log("   Risk-Adjusted: " + (best.sharpeRatio || 0).toFixed(2) + " Sharpe");
    console.log("   Efficiency: " + (best.totalReturn / best.totalTrades).toFixed(2) + "% per trade");
    
    console.log("\\nMass backtesting completed!");
    console.log("All results saved to database for analysis");
    
    return this.results;
  }
}

// Run mass backtesting
async function runMassBacktests() {
  const massBacktester = new MassBacktester();
  await massBacktester.runMassBacktests();
}

runMassBacktests().catch(console.error);
