const stockService = require('./stockService');

async function test() {
  try {
    console.log('Testing stockService...');
    const data = await stockService.getStockInfo('AAPL');
    console.log('Stock info works:', data.symbol, data.name);
    
    const historical = await stockService.getHistoricalData('AAPL', '1mo');
    console.log('Historical data works:', historical.length, 'data points');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();