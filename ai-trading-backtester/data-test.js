console.log("Testing data loading...");

const yahooFinance = require("yahoo-finance2").default;

async function testData() {
  try {
    console.log("Loading AAPL data...");
    
    const quote = await yahooFinance.quote("AAPL");
    
    console.log("Data loaded successfully!");
    console.log("AAPL Price: $" + quote.regularMarketPrice);
    console.log("Change: $" + quote.regularMarketChange);
    console.log("Date:", new Date().toISOString().split("T")[0]);
    
    return true;
    
  } catch (error) {
    console.log("Data loading failed:", error.message);
    return false;
  }
}

testData();
