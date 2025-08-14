console.log("=== BACKTEST REPORTER ===");

const BacktestEngine = require("./BacktestEngine");
const SimpleStrategy = require("./SimpleStrategy");
const fs = require("fs");

class BacktestReporter {
  constructor() {
    this.results = [];
  }
  
  async runFullReport() {
    console.log("� Generating comprehensive backtest report...");
    
    // Test verschillende scenarios
    const scenarios = [
      {
        name: "Single_Stock_Conservative",
        symbols: ["AAPL"],
        capital: 10000,
        dipThreshold: -0.02,
        profitTarget: 0.015
      },
      {
        name: "Single_Stock_Aggressive", 
        symbols: ["AAPL"],
        capital: 10000,
        dipThreshold: -0.04,
        profitTarget: 0.03
      },
      {
        name: "Multi_Stock_Balanced",
        symbols: ["AAPL", "MSFT"],
        capital: 20000,
        dipThreshold: -0.025,
        profitTarget: 0.02
      },
      {
        name: "Tech_Portfolio",
        symbols: ["AAPL", "MSFT", "GOOGL"],
        capital: 30000,
        dipThreshold: -0.03,
        profitTarget: 0.025
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\\n�� Testing: ${scenario.name}`);
      
      try {
        const engine = new BacktestEngine({
          startingCapital: scenario.capital,
          commission: 0.001,
          slippage: 0.0005
        });
        
        const strategy = new SimpleStrategy({
          dipThreshold: scenario.dipThreshold,
          profitTarget: scenario.profitTarget,
          stopLoss: -0.05,
          maxPositionSize: 0.3
        });
        
        const result = await engine.backtest(
          strategy, 
          scenario.symbols, 
          "2025-06-01", 
          "2025-08-13"
        );
        
        this.results.push({
          scenario: scenario.name,
          symbols: scenario.symbols.join("+"),
          startingCapital: scenario.capital,
          finalValue: result.metrics.finalValue,
          totalReturn: result.metrics.totalReturn,
          sharpeRatio: result.metrics.sharpeRatio || 0,
          maxDrawdown: result.metrics.maxDrawdown,
          totalTrades: result.metrics.totalTrades,
          tradingDays: result.metrics.tradingDays,
          profitLoss: result.metrics.finalValue - scenario.capital,
          winRate: this.calculateWinRate(result.trades),
          parameters: `Dip:${scenario.dipThreshold*100}%,Target:${scenario.profitTarget*100}%`
        });
        
        console.log(`   ✅ ${scenario.name}: ${result.metrics.totalReturn.toFixed(2)}% return`);
        
      } catch (error) {
        console.log(`   ❌ ${scenario.name}: ${error.message}`);
      }
    }
    
    // Generate reports
    this.generateCSVReport();
    this.generateSummaryReport();
    this.generateBestStrategy();
  }
  
  calculateWinRate(trades) {
    const buyTrades = trades.filter(t => t.action === "BUY");
    const sellTrades = trades.filter(t => t.action === "SELL");
    
    if (sellTrades.length === 0) return 0;
    
    let winners = 0;
    sellTrades.forEach(sellTrade => {
      const matchingBuy = buyTrades.find(buy => 
        buy.symbol === sellTrade.symbol && buy.date <= sellTrade.date
      );
      if (matchingBuy && sellTrade.price > matchingBuy.price) {
        winners++;
      }
    });
    
    return (winners / sellTrades.length) * 100;
  }
  
  generateCSVReport() {
    console.log("\\n� Generating CSV report...");
    
    const headers = [
      "Scenario", "Symbols", "Starting_Capital", "Final_Value", 
      "Total_Return_Pct", "Profit_Loss", "Sharpe_Ratio", "Max_Drawdown_Pct",
      "Total_Trades", "Trading_Days", "Win_Rate_Pct", "Parameters"
    ];
    
    let csvContent = headers.join(",") + "\\n";
    
    this.results.forEach(result => {
      csvContent += [
        result.scenario,
        result.symbols,
        result.startingCapital,
        result.finalValue.toFixed(2),
        result.totalReturn.toFixed(2),
        result.profitLoss.toFixed(2),
        result.sharpeRatio.toFixed(2),
        result.maxDrawdown.toFixed(2),
        result.totalTrades,
        result.tradingDays,
        result.winRate.toFixed(1),
        result.parameters
      ].join(",") + "\\n";
    });
    
    fs.writeFileSync("backtest_results.csv", csvContent);
    console.log("✅ CSV saved: backtest_results.csv");
  }
  
  generateSummaryReport() {
    console.log("\\n� === COMPREHENSIVE SUMMARY REPORT ===");
    
    // Sort by total return
    const sorted = [...this.results].sort((a, b) => b.totalReturn - a.totalReturn);
    
    console.log("\\n� TOP PERFORMING STRATEGIES:");
    sorted.slice(0, 3).forEach((result, index) => {
      const medal = ["�", "�", "�"][index];
      console.log(`${medal} ${result.scenario}:`);
      console.log(`   � Return: ${result.totalReturn.toFixed(2)}%`);
      console.log(`   � Profit: $${result.profitLoss.toFixed(2)}`);
      console.log(`   ⚡ Sharpe: ${result.sharpeRatio.toFixed(2)}`);
      console.log(`   � Trades: ${result.totalTrades}`);
      console.log("");
    });
    
    // Calculate portfolio stats
    const totalProfit = this.results.reduce((sum, r) => sum + r.profitLoss, 0);
    const avgReturn = this.results.reduce((sum, r) => sum + r.totalReturn, 0) / this.results.length;
    const avgSharpe = this.results.reduce((sum, r) => sum + r.sharpeRatio, 0) / this.results.length;
    
    console.log("� PORTFOLIO STATISTICS:");
    console.log(`� Combined Profit: $${totalProfit.toFixed(2)}`);
    console.log(`�� Average Return: ${avgReturn.toFixed(2)}%`);
    console.log(`⚡ Average Sharpe: ${avgSharpe.toFixed(2)}`);
    console.log(`� Total Scenarios: ${this.results.length}`);
  }
  
  generateBestStrategy() {
    const best = this.results.reduce((prev, current) => 
      current.totalReturn > prev.totalReturn ? current : prev
    );
    
    console.log("\\n� === OPTIMAL STRATEGY RECOMMENDATION ===");
    console.log(`� Best Strategy: ${best.scenario}`);
    console.log(`� Symbols: ${best.symbols}`);
    console.log(`� Capital Required: $${best.startingCapital.toLocaleString()}`);
    console.log(`� Expected Return: ${best.totalReturn.toFixed(2)}%`);
    console.log(`� Expected Profit: $${best.profitLoss.toFixed(2)}`);
    console.log(`⚡ Risk-Adjusted Return: ${best.sharpeRatio.toFixed(2)}`);
    console.log(`� Max Drawdown: ${best.maxDrawdown.toFixed(2)}%`);
    console.log(`� Parameters: ${best.parameters}`);
    
    console.log("\\n� IMPLEMENTATION GUIDE:");
    console.log("1. � Set starting capital to $" + best.startingCapital.toLocaleString());
    console.log("2. � Focus on: " + best.symbols);
    console.log("3. �️ Use parameters: " + best.parameters);
    console.log("4. � Expected outcome: $" + best.profitLoss.toFixed(2) + " profit");
  }
}

// Run the comprehensive report
const reporter = new BacktestReporter();
reporter.runFullReport().then(() => {
  console.log("\\n✨ Complete backtest analysis finished!");
  console.log("� Check backtest_results.csv for detailed data");
});
