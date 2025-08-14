console.log("Creating BacktestEngine...");

const DataLoader = require("./DataLoader");
const Helpers = require("./helpers");

class BacktestEngine {
  constructor(options = {}) {
    this.dataLoader = new DataLoader();
    this.startingCapital = options.startingCapital || 10000;
    this.commission = options.commission || 0.001; // 0.1% commissie
    this.slippage = options.slippage || 0.0005; // 0.05% slippage
    
    // Portfolio state
    this.cash = this.startingCapital;
    this.positions = new Map(); // symbol -> quantity
    this.trades = [];
    this.equityCurve = [];
    this.dailyReturns = [];
    
    // Performance metrics
    this.metrics = null;
  }
  
  async backtest(strategy, symbols, startDate, endDate, timeframe = "1d") {
    console.log("Ì∫Ä Starting backtest...");
    console.log("Ì≥ä Symbols:", symbols.join(", "));
    console.log("Ì≥Ö Period:", startDate, "to", endDate);
    
    try {
      // Load data for all symbols
      const dataMap = await this.dataLoader.loadMultipleSymbols(symbols, startDate, endDate, timeframe);
      
      if (dataMap.size === 0) {
        throw new Error("No data loaded for any symbols");
      }
      
      // Get all trading dates (intersection of all symbols)
      const tradingDates = this.getTradingDates(dataMap);
      console.log("Ì≥à Trading days:", tradingDates.length);
      
      // Reset portfolio
      this.resetPortfolio();
      
      // Run strategy for each trading day
      for (let i = 0; i < tradingDates.length; i++) {
        const currentDate = tradingDates[i];
        
        // Get current data for all symbols
        const currentData = this.getCurrentData(dataMap, currentDate);
        
        // Calculate portfolio value
        const portfolioValue = this.calculatePortfolioValue(currentData);
        this.equityCurve.push({
          date: currentDate,
          value: portfolioValue,
          cash: this.cash,
          positions: new Map(this.positions)
        });
        
        // Run strategy
        const signals = await strategy.generateSignals(currentData, {
          date: currentDate,
          dayIndex: i,
          portfolioValue: portfolioValue,
          cash: this.cash,
          positions: this.positions,
          trades: this.trades
        });
        
        // Execute signals
        for (const signal of signals) {
          await this.executeSignal(signal, currentData[signal.symbol], currentDate);
        }
        
        // Update daily returns
        if (i > 0) {
          const prevValue = this.equityCurve[i-1].value;
          const currentValue = portfolioValue;
          const dailyReturn = (currentValue - prevValue) / prevValue;
          this.dailyReturns.push(dailyReturn);
        }
        
        // Progress indicator
        if (i % 50 === 0 || i === tradingDates.length - 1) {
          const progress = ((i + 1) / tradingDates.length * 100).toFixed(1);
          console.log(`‚è≥ Progress: ${progress}% (${i + 1}/${tradingDates.length} days)`);
        }
      }
      
      // Calculate final metrics
      this.metrics = this.calculateMetrics();
      
      console.log("‚úÖ Backtest completed!");
      return this.getResults();
      
    } catch (error) {
      console.error("‚ùå Backtest failed:", error.message);
      throw error;
    }
  }
  
  async executeSignal(signal, priceData, date) {
    const { symbol, action, quantity, price } = signal;
    
    if (!priceData) {
      console.warn(`‚ö†Ô∏è No price data for ${symbol} on ${date}`);
      return;
    }
    
    const currentPrice = price || priceData.close;
    const executionPrice = this.applySlippage(currentPrice, action);
    const commission = Math.abs(quantity) * executionPrice * this.commission;
    
    if (action === "BUY") {
      const totalCost = (quantity * executionPrice) + commission;
      
      if (totalCost <= this.cash) {
        this.cash -= totalCost;
        this.positions.set(symbol, (this.positions.get(symbol) || 0) + quantity);
        
        this.trades.push({
          date: date,
          symbol: symbol,
          action: action,
          quantity: quantity,
          price: executionPrice,
          commission: commission,
          value: quantity * executionPrice
        });
        
        console.log(`Ìø¢ BUY: ${quantity} ${symbol} @ $${executionPrice.toFixed(2)} (Commission: $${commission.toFixed(2)})`);
      } else {
        console.warn(`‚ö†Ô∏è Insufficient cash for ${symbol} purchase`);
      }
    }
    
    else if (action === "SELL") {
      const currentPosition = this.positions.get(symbol) || 0;
      const sellQuantity = Math.min(Math.abs(quantity), currentPosition);
      
      if (sellQuantity > 0) {
        const proceeds = (sellQuantity * executionPrice) - commission;
        this.cash += proceeds;
        this.positions.set(symbol, currentPosition - sellQuantity);
        
        this.trades.push({
          date: date,
          symbol: symbol,
          action: action,
          quantity: sellQuantity,
          price: executionPrice,
          commission: commission,
          value: sellQuantity * executionPrice
        });
        
        console.log(`Ì¥¥ SELL: ${sellQuantity} ${symbol} @ $${executionPrice.toFixed(2)} (Commission: $${commission.toFixed(2)})`);
      } else {
        console.warn(`‚ö†Ô∏è No position to sell for ${symbol}`);
      }
    }
  }
  
  applySlippage(price, action) {
    const slippageAmount = price * this.slippage;
    return action === "BUY" ? price + slippageAmount : price - slippageAmount;
  }
  
  calculatePortfolioValue(currentData) {
    let totalValue = this.cash;
    
    for (const [symbol, quantity] of this.positions) {
      if (quantity > 0 && currentData[symbol]) {
        totalValue += quantity * currentData[symbol].close;
      }
    }
    
    return totalValue;
  }
  
  getTradingDates(dataMap) {
    const allDates = new Set();
    
    for (const [symbol, data] of dataMap) {
      for (const bar of data) {
        allDates.add(bar.date);
      }
    }
    
    return Array.from(allDates).sort();
  }
  
  getCurrentData(dataMap, date) {
    const currentData = {};
    
    for (const [symbol, data] of dataMap) {
      const dayData = data.find(bar => bar.date === date);
      if (dayData) {
        currentData[symbol] = dayData;
      }
    }
    
    return currentData;
  }
  
  calculateMetrics() {
    if (this.equityCurve.length === 0) return null;
    
    const finalValue = this.equityCurve[this.equityCurve.length - 1].value;
    const totalReturn = (finalValue - this.startingCapital) / this.startingCapital;
    const totalReturnPct = totalReturn * 100;
    
    const sharpeRatio = Helpers.calculateSharpeRatio(this.dailyReturns);
    const maxDrawdown = Helpers.calculateMaxDrawdown(this.equityCurve.map(e => e.value));
    
    const winningTrades = this.trades.filter(trade => {
      // Simpele winning trade calculation - kan uitgebreid worden
      return trade.action === "SELL";
    });
    
    return {
      startingCapital: this.startingCapital,
      finalValue: finalValue,
      totalReturn: totalReturnPct,
      sharpeRatio: sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      totalTrades: this.trades.length,
      tradingDays: this.equityCurve.length
    };
  }
  
  resetPortfolio() {
    this.cash = this.startingCapital;
    this.positions.clear();
    this.trades = [];
    this.equityCurve = [];
    this.dailyReturns = [];
    this.metrics = null;
  }
  
  getResults() {
    return {
      metrics: this.metrics,
      trades: this.trades,
      equityCurve: this.equityCurve,
      finalPortfolio: {
        cash: this.cash,
        positions: Object.fromEntries(this.positions)
      }
    };
  }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = BacktestEngine;
}

console.log("‚úÖ BacktestEngine created successfully!");
