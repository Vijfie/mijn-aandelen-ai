console.log('��� Starting simple test...');

// Test 1: Basic Node.js
console.log('✅ Node.js works');
console.log('✅ Current directory:', process.cwd());

// Test 2: Test dependencies
try {
  const axios = require('axios');
  console.log('✅ Axios loaded');
} catch (error) {
  console.log('❌ Axios failed:', error.message);
}

try {
  const moment = require('moment');
  console.log('✅ Moment loaded');
  console.log('✅ Current date:', moment().format('YYYY-MM-DD'));
} catch (error) {
  console.log('❌ Moment failed:', error.message);
}

try {
  const yahooFinance = require('yahoo-finance2').default;
  console.log('✅ Yahoo Finance loaded');
} catch (error) {
  console.log('❌ Yahoo Finance failed:', error.message);
}

console.log('✅ Test completed!');
