const yahooFinance = require('yahoo-finance2').default;

async function testYahooFinance() {
  console.log('🧪 Testing Yahoo Finance...');
  
  try {
    console.log('📊 Fetching Nike (NKE) data...');
    const quote = await yahooFinance.quote('NKE');
    
    console.log('✅ SUCCESS - Real Nike data:');
    console.log(`Price: $${quote.regularMarketPrice}`);
    console.log(`Name: ${quote.displayName || quote.shortName}`);
    console.log(`Change: ${quote.regularMarketChange}`);
    console.log(`Volume: ${quote.regularMarketVolume}`);
    
  } catch (error) {
    console.log('❌ FAILED - Yahoo Finance error:');
    console.log('Error:', error.message);
    console.log('');
    console.log('🔧 Possible fixes:');
    console.log('1. Update yahoo-finance2 package');
    console.log('2. Check internet connection');
    console.log('3. Try different stock symbol');
    console.log('4. Check rate limiting');
  }
}

testYahooFinance();