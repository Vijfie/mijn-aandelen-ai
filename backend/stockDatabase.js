// backend/stockDatabase.js - Uitgebreide database met ALLE populaire stocks
const STOCK_DATABASE = {
  // 🏢 MEGA CAPS (>500B)
  'APPLE': 'AAPL',
  'AAPL': 'AAPL',
  'MICROSOFT': 'MSFT', 
  'MSFT': 'MSFT',
  'AMAZON': 'AMZN',
  'AMZN': 'AMZN',
  'ALPHABET': 'GOOGL',
  'GOOGLE': 'GOOGL',
  'GOOGL': 'GOOGL',
  'GOOG': 'GOOG',
  'TESLA': 'TSLA',
  'TSLA': 'TSLA',
  'META': 'META',
  'FACEBOOK': 'META',
  'NVIDIA': 'NVDA',
  'NVDA': 'NVDA',
  'BERKSHIRE': 'BRK-B',
  'BRK-B': 'BRK-B',
  'TAIWAN SEMICONDUCTOR': 'TSM',
  'TSM': 'TSM',

  // 🥤 CONSUMER BRANDS
  'COCA COLA': 'KO',
  'COCA-COLA': 'KO', 
  'COKE': 'KO',
  'KO': 'KO',
  'PEPSI': 'PEP',
  'PEP': 'PEP',
  'MCDONALDS': 'MCD',
  'MCD': 'MCD',
  'STARBUCKS': 'SBUX',
  'SBUX': 'SBUX',
  'NIKE': 'NKE',
  'NKE': 'NKE',
  'ADIDAS': 'ADDYY',
  'ADDYY': 'ADDYY',
  'WALMART': 'WMT',
  'WMT': 'WMT',
  'PROCTER & GAMBLE': 'PG',
  'P&G': 'PG',
  'PG': 'PG',
  'UNILEVER': 'UL',
  'UL': 'UL',
  'DISNEY': 'DIS',
  'DIS': 'DIS',
  'NETFLIX': 'NFLX',
  'NFLX': 'NFLX',

  // 🏦 FINANCIALS
  'JPMORGAN': 'JPM',
  'JP MORGAN': 'JPM',
  'JPM': 'JPM',
  'BANK OF AMERICA': 'BAC',
  'BAC': 'BAC',
  'WELLS FARGO': 'WFC',
  'WFC': 'WFC',
  'GOLDMAN SACHS': 'GS',
  'GS': 'GS',
  'MORGAN STANLEY': 'MS',
  'MS': 'MS',
  'VISA': 'V',
  'V': 'V',
  'MASTERCARD': 'MA',
  'MA': 'MA',
  'AMERICAN EXPRESS': 'AXP',
  'AMEX': 'AXP',
  'AXP': 'AXP',
  'PAYPAL': 'PYPL',
  'PYPL': 'PYPL',

  // 🏥 HEALTHCARE & PHARMA
  'JOHNSON & JOHNSON': 'JNJ',
  'J&J': 'JNJ',
  'JNJ': 'JNJ',
  'PFIZER': 'PFE',
  'PFE': 'PFE',
  'MODERNA': 'MRNA',
  'MRNA': 'MRNA',
  'ABBOTT': 'ABT',
  'ABT': 'ABT',
  'MERCK': 'MRK',
  'MRK': 'MRK',
  'BRISTOL MYERS': 'BMY',
  'BMY': 'BMY',
  'ASTRAZENECA': 'AZN',
  'AZN': 'AZN',
  'NOVARTIS': 'NVS',
  'NVS': 'NVS',
  'ROCHE': 'RHHBY',
  'RHHBY': 'RHHBY',
  'GILEAD': 'GILD',
  'GILD': 'GILD',

  // ⚡ ENERGY
  'EXXON': 'XOM',
  'EXXON MOBIL': 'XOM',
  'XOM': 'XOM',
  'CHEVRON': 'CVX',
  'CVX': 'CVX',
  'SHELL': 'SHEL',
  'SHEL': 'SHEL',
  'BP': 'BP',
  'TOTAL': 'TTE',
  'TTE': 'TTE',
  'CONOCOPHILLIPS': 'COP',
  'COP': 'COP',
  'SCHLUMBERGER': 'SLB',
  'SLB': 'SLB',

  // 🏭 INDUSTRIALS
  'BOEING': 'BA',
  'BA': 'BA',
  'CATERPILLAR': 'CAT',
  'CAT': 'CAT',
  'GENERAL ELECTRIC': 'GE',
  'GE': 'GE',
  'HONEYWELL': 'HON',
  'HON': 'HON',
  'SIEMENS': 'SIEGY',
  'SIEGY': 'SIEGY',
  '3M': 'MMM',
  'MMM': 'MMM',
  'LOCKHEED MARTIN': 'LMT',
  'LMT': 'LMT',
  'RAYTHEON': 'RTX',
  'RTX': 'RTX',

  // 🏠 REAL ESTATE & MATERIALS
  'HOME DEPOT': 'HD',
  'HD': 'HD',
  'LOWES': 'LOW',
  'LOW': 'LOW',
  'NVIDIA': 'NVDA',
  'DUPONT': 'DD',
  'DD': 'DD',
  'DOW': 'DOW',

  // 📱 TECH GIANTS
  'IBM': 'IBM',
  'ORACLE': 'ORCL',
  'ORCL': 'ORCL',
  'SALESFORCE': 'CRM',
  'CRM': 'CRM',
  'ADOBE': 'ADBE',
  'ADBE': 'ADBE',
  'INTC': 'INTC',
  'INTEL': 'INTC',
  'AMD': 'AMD',
  'CISCO': 'CSCO',
  'CSCO': 'CSCO',
  'ZOOM': 'ZM',
  'ZM': 'ZM',
  'SLACK': 'WORK',
  'WORK': 'WORK',
  'SPOTIFY': 'SPOT',
  'SPOT': 'SPOT',
  'UBER': 'UBER',
  'LYFT': 'LYFT',
  'AIRBNB': 'ABNB',
  'ABNB': 'ABNB',

  // 🚗 AUTOMOTIVE
  'FORD': 'F',
  'F': 'F',
  'GENERAL MOTORS': 'GM',
  'GM': 'GM',
  'TOYOTA': 'TM',
  'TM': 'TM',
  'VOLKSWAGEN': 'VWAGY',
  'VWAGY': 'VWAGY',
  'BMW': 'BMWYY',
  'BMWYY': 'BMWYY',
  'FERRARI': 'RACE',
  'RACE': 'RACE',
  'LUCID': 'LCID',
  'LCID': 'LCID',
  'RIVIAN': 'RIVN',
  'RIVN': 'RIVN',
  'NIO': 'NIO',
  'XPENG': 'XPEV',
  'XPEV': 'XPEV',

  // 🛒 RETAIL & E-COMMERCE
  'COSTCO': 'COST',
  'COST': 'COST',
  'TARGET': 'TGT',
  'TGT': 'TGT',
  'BEST BUY': 'BBY',
  'BBY': 'BBY',
  'EBAY': 'EBAY',
  'SHOPIFY': 'SHOP',
  'SHOP': 'SHOP',
  'ETSY': 'ETSY',

  // 🏨 TRAVEL & LEISURE
  'BOOKING': 'BKNG',
  'BKNG': 'BKNG',
  'EXPEDIA': 'EXPE',
  'EXPE': 'EXPE',
  'MARRIOTT': 'MAR',
  'MAR': 'MAR',
  'HILTON': 'HLT',
  'HLT': 'HLT',
  'AMERICAN AIRLINES': 'AAL',
  'AAL': 'AAL',
  'DELTA': 'DAL',
  'DAL': 'DAL',
  'UNITED': 'UAL',
  'UAL': 'UAL',
  'SOUTHWEST': 'LUV',
  'LUV': 'LUV',

  // 📡 TELECOM
  'VERIZON': 'VZ',
  'VZ': 'VZ',
  'AT&T': 'T',
  'T': 'T',
  'T-MOBILE': 'TMUS',
  'TMUS': 'TMUS',
  'COMCAST': 'CMCSA',
  'CMCSA': 'CMCSA',

  // 🏛️ UTILITIES
  'NEXTERA': 'NEE',
  'NEE': 'NEE',
  'DUKE ENERGY': 'DUK',
  'DUK': 'DUK',
  'SOUTHERN COMPANY': 'SO',
  'SO': 'SO',

  // 🎮 GAMING & ENTERTAINMENT
  'ACTIVISION': 'ATVI',
  'ATVI': 'ATVI',
  'ELECTRONIC ARTS': 'EA',
  'EA': 'EA',
  'ROBLOX': 'RBLX',
  'RBLX': 'RBLX',
  'TAKE-TWO': 'TTWO',
  'TTWO': 'TTWO',
  'UNITY': 'U',

  // 🏪 EMERGING STOCKS
  'PALANTIR': 'PLTR',
  'PLTR': 'PLTR',
  'SNOWFLAKE': 'SNOW',
  'SNOW': 'SNOW',
  'DATADOG': 'DDOG',
  'DDOG': 'DDOG',
  'CLOUDFLARE': 'NET',
  'NET': 'NET',
  'TWILIO': 'TWLO',
  'TWLO': 'TWLO',
  'SQUARE': 'SQ',
  'SQ': 'SQ',
  'BLOCK': 'SQ',
  'ROBINHOOD': 'HOOD',
  'HOOD': 'HOOD',

  // 🥇 COMMODITIES & MATERIALS
  'GOLD': 'GLD',
  'GLD': 'GLD',
  'SILVER': 'SLV',
  'SLV': 'SLV',
  'OIL': 'USO',
  'USO': 'USO',
  'COPPER': 'CPER',
  'CPER': 'CPER',

  // 🌍 INTERNATIONAL STOCKS
  'ASML': 'ASML',
  'NESTLE': 'NSRGY',
  'NSRGY': 'NSRGY',
  'LVMH': 'LVMUY',
  'LVMUY': 'LVMUY',
  'SAMSUNG': 'SSNLF',
  'SSNLF': 'SSNLF',
  'ALIBABA': 'BABA',
  'BABA': 'BABA',
  'TENCENT': 'TCEHY',
  'TCEHY': 'TCEHY',
  'SONY': 'SONY',
  'NINTENDO': 'NTDOY',
  'NTDOY': 'NTDOY',

  // 📊 ETFS & INDICES
  'SPY': 'SPY',
  'S&P 500': 'SPY',
  'SP500': 'SPY',
  'QQQ': 'QQQ',
  'NASDAQ': 'QQQ',
  'IWM': 'IWM',
  'RUSSELL 2000': 'IWM',
  'VTI': 'VTI',
  'TOTAL STOCK': 'VTI',
  'DIA': 'DIA',
  'DOW JONES': 'DIA',
  'EEM': 'EEM',
  'EMERGING MARKETS': 'EEM',
  'VEA': 'VEA',
  'DEVELOPED MARKETS': 'VEA',

  // 🏦 FINANCIAL ETFS
  'XLF': 'XLF',
  'FINANCIAL SECTOR': 'XLF',
  'XLE': 'XLE',
  'ENERGY SECTOR': 'XLE',
  'XLK': 'XLK',
  'TECH SECTOR': 'XLK',
  'XLV': 'XLV',
  'HEALTHCARE SECTOR': 'XLV',
  'XLP': 'XLP',
  'CONSUMER STAPLES': 'XLP',
  'XLY': 'XLY',
  'CONSUMER DISCRETIONARY': 'XLY',
  'XLI': 'XLI',
  'INDUSTRIAL SECTOR': 'XLI',
  'XLB': 'XLB',
  'MATERIALS SECTOR': 'XLB',
  'XLRE': 'XLRE',
  'REAL ESTATE': 'XLRE',
  'XLU': 'XLU',
  'UTILITIES SECTOR': 'XLU',

  // 💰 CRYPTO RELATED
  'BITCOIN': 'BTC-USD',
  'BTC': 'BTC-USD',
  'BTC-USD': 'BTC-USD',
  'ETHEREUM': 'ETH-USD',
  'ETH': 'ETH-USD',
  'ETH-USD': 'ETH-USD',
  'COINBASE': 'COIN',
  'COIN': 'COIN',
  'MICROSTRATEGY': 'MSTR',
  'MSTR': 'MSTR',
  'MARATHON': 'MARA',
  'MARA': 'MARA',
  'RIOT': 'RIOT',
  'GRAYSCALE BITCOIN': 'GBTC',
  'GBTC': 'GBTC',

  // 🏦 REITS
  'REALTY INCOME': 'O',
  'O': 'O',
  'AMERICAN TOWER': 'AMT',
  'AMT': 'AMT',
  'CROWN CASTLE': 'CCI',
  'CCI': 'CCI',
  'PROLOGIS': 'PLD',
  'PLD': 'PLD',
  'PUBLIC STORAGE': 'PSA',
  'PSA': 'PSA',

  // 💊 BIOTECH
  'BIOGEN': 'BIIB',
  'BIIB': 'BIIB',
  'REGENERON': 'REGN',
  'REGN': 'REGN',
  'VERTEX': 'VRTX',
  'VRTX': 'VRTX',
  'ILLUMINA': 'ILMN',
  'ILMN': 'ILMN',

  // 🥘 FOOD & BEVERAGE
  'GENERAL MILLS': 'GIS',
  'GIS': 'GIS',
  'KELLOGG': 'K',
  'K': 'K',
  'KRAFT HEINZ': 'KHC',
  'KHC': 'KHC',
  'MONDELEZ': 'MDLZ',
  'MDLZ': 'MDLZ',
  'TYSON FOODS': 'TSN',
  'TSN': 'TSN',

  // 🎯 POPULAR MEME STOCKS
  'GAMESTOP': 'GME',
  'GME': 'GME',
  'AMC': 'AMC',
  'BLACKBERRY': 'BB',
  'BB': 'BB',
  'NOK': 'NOK',
  'NOKIA': 'NOK',
  'DOGECOIN': 'DOGE-USD',
  'DOGE': 'DOGE-USD',
  'DOGE-USD': 'DOGE-USD'
};

// 🔍 FUZZY SEARCH FUNCTION
function findStockSymbol(query) {
  if (!query || typeof query !== 'string') return null;
  
  const cleanQuery = query.trim().toUpperCase();
  
  // Direct match
  if (STOCK_DATABASE[cleanQuery]) {
    return STOCK_DATABASE[cleanQuery];
  }
  
  // Fuzzy matching for partial names
  const keys = Object.keys(STOCK_DATABASE);
  
  // Look for exact word matches
  for (const key of keys) {
    if (key.includes(cleanQuery) || cleanQuery.includes(key)) {
      return STOCK_DATABASE[key];
    }
  }
  
  // Look for partial matches (minimum 3 characters)
  if (cleanQuery.length >= 3) {
    for (const key of keys) {
      if (key.indexOf(cleanQuery) !== -1) {
        return STOCK_DATABASE[key];
      }
    }
  }
  
  return null;
}

// 📝 GET ALL AVAILABLE STOCKS
function getAllAvailableStocks() {
  const uniqueSymbols = [...new Set(Object.values(STOCK_DATABASE))];
  return uniqueSymbols.sort();
}

// 🏷️ GET COMPANY NAME FROM SYMBOL
function getCompanyName(symbol) {
  const entry = Object.entries(STOCK_DATABASE).find(([key, value]) => 
    value === symbol && key.length > 4 && !key.includes('-')
  );
  return entry ? entry[0] : symbol;
}

// 📊 GET STOCK SUGGESTIONS
function getStockSuggestions(query, limit = 10) {
  if (!query || query.length < 2) return [];
  
  const cleanQuery = query.trim().toUpperCase();
  const suggestions = [];
  
  // Find matches
  Object.entries(STOCK_DATABASE).forEach(([name, symbol]) => {
    if (name.includes(cleanQuery) && suggestions.length < limit) {
      suggestions.push({
        name: name,
        symbol: symbol,
        displayName: `${name} (${symbol})`
      });
    }
  });
  
  return suggestions;
}

module.exports = {
  STOCK_DATABASE,
  findStockSymbol,
  getAllAvailableStocks,
  getCompanyName,
  getStockSuggestions
};