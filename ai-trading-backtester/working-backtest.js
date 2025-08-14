console.log("=== WORKING BACKTESTER v3 ===");

const yahooFinance = require("yahoo-finance2").default;

// Simpelere maar werkende strategie: Moving Average Crossover
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

async function workingBacktest() {
  try {
    console.log("Loading data...");
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 50);
    
    const history = await yahooFinance.historical("AAPL", {
      period1: startDate,
      period2: new Date(),
      interval: "1d"
    });
    
    console.log("Got " + history.length + " days of data\\n");
    
    let cash = 10000;
    let shares = 0;
    let trades = [];
    let totalTrades = 0;
    
    for (let i = 10; i < history.length - 1; i++) {
      const prices = history.slice(0, i + 1).map(d => d.close);
      const currentPrice = history[i].close;
      const date = history[i].date.toISOString().split("T")[0];
      
      // Simpele strategie: koop als prijs 5% gedaald is in 3 dagen
      if (i >= 3) {
        const price3DaysAgo = history[i-3].close;
        const priceDrop = ((currentPrice - price3DaysAgo) / price3DaysAgo) * 100;
        
        // BUY: als prijs 3% of meer gedaald is EN we hebben geen aandelen
        if (priceDrop <= -3 && shares === 0 && cash >= currentPrice) {
          shares = Math.floor(cash / currentPrice);
          const cost = shares * currentPrice;
          cash -= cost;
          totalTrades++;
          
          trades.push({
            type: "BUY",
            date: date,
            price: currentPrice,
            shares: shares,
            drop: priceDrop
          });
          
          console.log("BUY #" + totalTrades + ": " + shares + " shares at $" + currentPrice.toFixed(2) + " (Drop: " + priceDrop.toFixed(1) + "%)");
        }
        
        // SELL: als we winst hebben van 2% of meer
        else if (shares > 0) {
          const lastBuy = trades[trades.length - 1];
          const gainPct = ((currentPrice - lastBuy.price) / lastBuy.price) * 100;
          
          if (gainPct >= 2 || gainPct <= -5) { // Sell op +2% winst of -5% verlies
            const proceeds = shares * currentPrice;
            cash += proceeds;
            const profit = proceeds - (shares * lastBuy.price);
            
            trades.push({
              type: "SELL",
              date: date,
              price: currentPrice,
              shares: shares,
              profit: profit,
              gainPct: gainPct
            });
            
            console.log("SELL #" + totalTrades + ": " + shares + " shares at $" + currentPrice.toFixed(2) + " (Gain: " + gainPct.toFixed(1) + "%, Profit: $" + profit.toFixed(2) + ")");
            shares = 0;
          }
        }
      }
    }
    
    // Final results
    const finalPrice = history[history.length - 1].close;
    const finalValue = cash + (shares * finalPrice);
    const totalReturn = ((finalValue - 10000) / 10000) * 100;
    
    console.log("\\n=== FINAL RESULTS ===");
    console.log("Starting capital: $10,000.00");
    console.log("Final value: $" + finalValue.toFixed(2));
    console.log("Total return: " + totalReturn.toFixed(2) + "%");
    console.log("Cash: $" + cash.toFixed(2));
    console.log("Shares held: " + shares);
    
    const sellTrades = trades.filter(t => t.type === "SELL");
    const winners = sellTrades.filter(t => t.profit > 0);
    
    console.log("\\nTrade Summary:");
    console.log("Total buy orders: " + Math.floor(trades.length / 2 + 0.5));
    console.log("Completed trades: " + sellTrades.length);
    console.log("Winning trades: " + winners.length);
    console.log("Win rate: " + (sellTrades.length > 0 ? (winners.length/sellTrades.length*100).toFixed(1) : 0) + "%");
    
    if (sellTrades.length > 0) {
      const avgProfit = sellTrades.reduce((sum, t) => sum + t.profit, 0) / sellTrades.length;
      console.log("Average profit per trade: $" + avgProfit.toFixed(2));
    }
    
  } catch (error) {
    console.log("Backtest failed:", error.message);
  }
}

workingBacktest();
