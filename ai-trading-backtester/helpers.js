console.log("Creating helpers utility...");

class Helpers {
  
  // Date utilities
  static formatDate(date, format = "YYYY-MM-DD") {
    return date.toISOString().split("T")[0];
  }
  
  // Financial calculations
  static calculateReturns(prices) {
    if (!prices || prices.length < 2) return [];
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const ret = (prices[i] - prices[i-1]) / prices[i-1];
      returns.push(ret);
    }
    return returns;
  }
  
  static calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    if (!returns || returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / (returns.length - 1);
    const volatility = Math.sqrt(variance);
    
    if (volatility === 0) return 0;
    
    const annualizedReturn = avgReturn * 252; // 252 trading days
    const annualizedVol = volatility * Math.sqrt(252);
    
    return (annualizedReturn - riskFreeRate) / annualizedVol;
  }
  
  static calculateMaxDrawdown(equityCurve) {
    if (!equityCurve || equityCurve.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = equityCurve[0];
    
    for (let i = 1; i < equityCurve.length; i++) {
      if (equityCurve[i] > peak) {
        peak = equityCurve[i];
      }
      
      const drawdown = (peak - equityCurve[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }
  
  // Utility functions
  static roundTo(number, decimals = 2) {
    return Number(Math.round(number + "e" + decimals) + "e-" + decimals);
  }
  
  static formatCurrency(number) {
    return "$" + number.toFixed(2);
  }
  
  static validateSymbol(symbol) {
    if (!symbol || typeof symbol !== "string") return false;
    symbol = symbol.trim().toUpperCase();
    if (symbol.length < 1 || symbol.length > 10) return false;
    const validChars = /^[A-Z0-9\\/\\-]+$/;
    return validChars.test(symbol);
  }
  
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test de helpers
console.log("Testing helpers...");
console.log("✅ Date format:", Helpers.formatDate(new Date()));
console.log("✅ Currency format:", Helpers.formatCurrency(1234.567));
console.log("✅ Symbol validation:", Helpers.validateSymbol("AAPL"));
console.log("✅ Symbol validation (invalid):", Helpers.validateSymbol("invalid@symbol"));

// Export (Node.js style)
if (typeof module !== "undefined" && module.exports) {
  module.exports = Helpers;
}

console.log("✅ Helpers utility created successfully!");
