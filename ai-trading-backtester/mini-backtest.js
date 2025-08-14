console.log("=== MINI BACKTESTER ===");

const yahooFinance = require("yahoo-finance2").default;

async function simpleBacktest() {
  try {
    console.log("Loading historical data for AAPL...");
    
    // Haal 30 dagen historie op
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const endDate = new Date();
    
    const history = await yahooFinance.historical("AAPL", {
      period1: startDate,
      period2: endDate,
      interval: "1d"
    });
    
    console.log("Got " + history.length + " days of data");
    console.log("First day: " + history[0].date.toISOString().split("T")[0] + " - $" + history[0].close);
    console.log("Last day: " + history[history.length-1].date.toISOString().split("T")[0] + " - $" + history[history.length-1].close);
    
    // Simpele strategy: koop als prijs stijgt 2 dagen achter elkaar
    let trades = 0;
    let wins = 0;
    let totalReturn = 0;
    
    for (let i = 2; i < history.length - 1; i++) {
      const day1 = history[i-2].close;
      const day2 = history[i-1].close;
      const day3 = history[i].close;
      const day4 = history[i+1].close;
      
      // Als prijs 2 dagen stijgt, "koop" op dag 3
      if (day2 > day1 && day3 > day2) {
        trades++;
        const buyPrice = day3;
        const sellPrice = day4; // "verkoop" volgende dag
        const return_pct = ((sellPrice - buyPrice) / buyPrice) * 100;
        totalReturn += return_pct;
        
        if (return_pct > 0) wins++;
        
        console.log("Trade " + trades + ": Buy $" + buyPrice.toFixed(2) + " -> Sell $" + sellPrice.toFixed(2) + " = " + return_pct.toFixed(2) + "%");
      }
    }
    
    console.log("\\n=== RESULTS ===");
    console.log("Total trades: " + trades);
    console.log("Winning trades: " + wins);
    console.log("Win rate: " + (trades > 0 ? (wins/trades*100).toFixed(1) : 0) + "%");
    console.log("Total return: " + totalReturn.toFixed(2) + "%");
    console.log("Average return per trade: " + (trades > 0 ? (totalReturn/trades).toFixed(2) : 0) + "%");
    
  } catch (error) {
    console.log("Backtest failed:", error.message);
  }
}

simpleBacktest();
