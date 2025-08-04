const newsService = require('./newsService');

async function testNews() {
  try {
    console.log('Testing news service...');
    const news = await newsService.getStockNews('GOOGL', 'Alphabet Inc.');
    console.log('News articles:', news.articles.length);
    console.log('First article:', news.articles[0]);
    console.log('Summary:', news.summary);
  } catch (error) {
    console.error('News test failed:', error);
  }
}

testNews();