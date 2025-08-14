console.log("=== SMART BACKTESTER v2 ===");

const yahooFinance = require("yahoo-finance2").default;

// Simpele RSI berekening
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

async function smartBacktest() {
  try {
    console.log("Loading historical data for AAPL...");
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60); // 60 dagen voor meer data
    
    const history = await yahooFinance.historical("AAPL", {
      period1: startDate,
      period2: new Date(),
      interval: "1d"
    });
    
    console.log("Got " + history.length + " days of data");
    
    // Portfolio tracking
    let cash = 10000; // Start met $10,000
    let shares = 0;
    let trades = [];
    
    for (let i = 20; i < history.length - 1; i++) {
      const prices = history.slice(0, i + 1).map(d => d.close);
      const rsi = calculateRSI(prices);
      const currentPrice = history[i].close;
      const nextPrice = history[i + 1].close;
      
      // Strategy: Koop als RSI < 40 (oversold), verkoop als RSI > 60 (overbought)
      if (rsi < 40 && cash > currentPrice && shares === 0) {
        // BUY
        shares = Math.floor(cash / currentPrice);
        cash = cash - (shares * currentPrice);
        trades.push({
          type: "BUY",
          date: history[i].date.toISOString().split("T")[0],
          price: currentPrice,
          shares: shares,
          rsi: rsi
        });
        console.log("BUY: " + shares + " shares at $" + currentPrice.toFixed(2) + " (RSI: " + rsi.toFixed(1) + ")");
      }
      else if (rsi > 60 && shares > 0) {
        // SELL
        cash = cash + (shares * currentPrice);
        const lastBuy = trades[trades.length - 1];
        const profit = (currentPrice - lastBuy.price) * shares;
        const profitPct = ((currentPrice - lastBuy.price) / lastBuy.price) * 100;
        
        trades.push({
          type: "SELL",
          date: history[i].date.toISOString().split("T")[0],
          price: currentPrice,
          shares: shares,
          rsi: rsi,
          profit: profit,
          profitPct: profitPct
        });
        console.log("SELL: " + shares + " shares at $" + currentPrice.toFixed(2) + " (RSI: " + rsi.toFixed(1) + ") Profit: " + profitPct.toFixed(2) + "%");
        shares = 0;
      }
    }
    
    // Final portfolio value
    const finalPrice = history[history.length - 1].close;
    const finalValue = cash + (shares * finalPrice);
    const totalReturn = ((finalValue - 10000) / 10000) * 100;
    
    console.log("\\n=== FINAL RESULTS ===");
    console.log("Starting capital: $10,000");
    console.log("Final portfolio value: $" + finalValue.toFixed(2));
    console.log("Cash: $" + cash.toFixed(2));
    console.log("Shares held: " + shares);
    console.log("Total return: " + totalReturn.toFixed(2) + "%");
    console.log("Total trades: " + trades.length);
    
    const sellTrades = trades.filter(t => t.type === "SELL");
    const winningTrades = sellTrades.filter(t => t.profit > 0);
    console.log("Completed trades: " + sellTrades.length);
    console.log("Winning trades: " + winningTrades.length);
    console.log("Win rate: " + (sellTrades.length > 0 ? (winningTrades.length/sellTrades.length*100).toFixed(1) : 0) + "%");
    
  } catch (error) {
    console.log("Smart backtest failed:", error.message);
  }
}

smartBacktest();
