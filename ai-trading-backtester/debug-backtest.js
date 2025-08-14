console.log("=== RSI DEBUG BACKTESTER ===");

const yahooFinance = require("yahoo-finance2").default;

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

async function debugBacktest() {
  try {
    console.log("Loading data...");
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const history = await yahooFinance.historical("AAPL", {
      period1: startDate,
      period2: new Date(),
      interval: "1d"
    });
    
    console.log("Got " + history.length + " days of data\\n");
    
    let minRSI = 100;
    let maxRSI = 0;
    
    for (let i = 15; i < history.length; i++) {
      const prices = history.slice(0, i + 1).map(d => d.close);
      const rsi = calculateRSI(prices);
      const date = history[i].date.toISOString().split("T")[0];
      const price = history[i].close;
      
      if (rsi < minRSI) minRSI = rsi;
      if (rsi > maxRSI) maxRSI = rsi;
      
      let signal = "";
      if (rsi < 30) signal = " <- STRONG BUY!";
      else if (rsi < 40) signal = " <- BUY!";  
      else if (rsi > 70) signal = " <- STRONG SELL!";
      else if (rsi > 60) signal = " <- SELL!";
      
      console.log(date + " | $" + price.toFixed(2) + " | RSI: " + rsi.toFixed(1) + signal);
    }
    
    console.log("\\n=== RSI SUMMARY ===");
    console.log("Lowest RSI: " + minRSI.toFixed(1));
    console.log("Highest RSI: " + maxRSI.toFixed(1));
    console.log("\\nStrategy thresholds:");
    console.log("BUY when RSI < 40");
    console.log("SELL when RSI > 60");
    
  } catch (error) {
    console.log("Debug failed:", error.message);
  }
}

debugBacktest();
