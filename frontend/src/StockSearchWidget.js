// frontend/src/StockSearchWidget.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StockSearchWidget({ onStockSelect, showPopular = true }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Populaire stocks voor snelle toegang
  const quickStocks = [
    { symbol: 'AAPL', name: 'Apple', emoji: '🍎' },
    { symbol: 'TSLA', name: 'Tesla', emoji: '🚗' },
    { symbol: 'MSFT', name: 'Microsoft', emoji: '💻' },
    { symbol: 'GOOGL', name: 'Google', emoji: '🔍' },
    { symbol: 'NVDA', name: 'Nvidia', emoji: '🎮' },
    { symbol: 'META', name: 'Meta', emoji: '📱' },
    { symbol: 'AMZN', name: 'Amazon', emoji: '📦' },
    { symbol: 'NFLX', name: 'Netflix', emoji: '🎬' },
    { symbol: 'KO', name: 'Coca-Cola', emoji: '🥤' },
    { symbol: 'NKE', name: 'Nike', emoji: '👟' },
    { symbol: 'SBUX', name: 'Starbucks', emoji: '☕' },
    { symbol: 'MCD', name: 'McDonalds', emoji: '🍟' },
    { symbol: 'DIS', name: 'Disney', emoji: '🏰' },
    { symbol: 'PFE', name: 'Pfizer', emoji: '💊' },
    { symbol: 'JPM', name: 'JP Morgan', emoji: '🏦' },
    { symbol: 'BTC-USD', name: 'Bitcoin', emoji: '₿' },
    { symbol: 'ETH-USD', name: 'Ethereum', emoji: '⚡' },
    { symbol: 'SPY', name: 'S&P 500 ETF', emoji: '📊' },
    { symbol: 'QQQ', name: 'Nasdaq ETF', emoji: '📈' },
    { symbol: 'VTI', name: 'Total Stock Market', emoji: '🌍' }
  ];

  // Search voor stocks
  const searchStocks = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/stocks/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Stock search error:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleStockSelect = (stock) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onStockSelect(stock);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="stock-search-widget">
      <style>
        {`
          .stock-search-widget {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .search-container {
            position: relative;
            margin-bottom: 30px;
          }

          .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .stock-search-input {
            width: 100%;
            padding: 16px 20px;
            font-size: 18px;
            border: 3px solid #e2e8f0;
            border-radius: 16px;
            background: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .stock-search-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 30px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
          }

          .search-loading {
            position: absolute;
            right: 16px;
            font-size: 16px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 2px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 16px 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            max-height: 300px;
            overflow-y: auto;
            z-index: 100;
          }

          .suggestion-item {
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: background 0.2s ease;
            border-bottom: 1px solid #f1f5f9;
          }

          .suggestion-item:hover {
            background: #f8fafc;
          }

          .suggestion-item:last-child {
            border-bottom: none;
          }

          .suggestion-name {
            font-weight: 500;
            color: #1e293b;
            flex: 1;
          }

          .suggestion-symbol {
            background: #667eea;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          }

          .popular-stocks {
            margin-bottom: 30px;
          }

          .popular-stocks h3 {
            margin: 0 0 20px 0;
            color: #1e293b;
            font-size: 20px;
            text-align: center;
          }

          .stock-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
          }

          .stock-quick-btn {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          .stock-quick-btn:hover {
            border-color: #667eea;
            background: #f8fafc;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
          }

          .stock-emoji {
            font-size: 24px;
            margin-bottom: 4px;
          }

          .stock-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 12px;
            text-align: center;
            line-height: 1.2;
          }

          .stock-symbol {
            background: #f1f5f9;
            color: #64748b;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
          }

          .search-tips {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #e2e8f0;
          }

          .search-tips h4 {
            margin: 0 0 16px 0;
            color: #1e293b;
            text-align: center;
          }

          .tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }

          .tip-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            color: #475569;
            border: 1px solid #e2e8f0;
          }

          .tip-item strong {
            color: #1e293b;
          }

          @media (max-width: 768px) {
            .stock-search-widget {
              padding: 16px;
            }
            
            .stock-grid {
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 8px;
            }
            
            .stock-quick-btn {
              padding: 12px 6px;
            }
            
            .tips-grid {
              grid-template-columns: 1fr;
              gap: 8px;
            }
            
            .stock-search-input {
              font-size: 16px;
              padding: 14px 16px;
            }
          }
        `}
      </style>

      {/* Search Input */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="stock-search-input"
            placeholder="🔍 Zoek aandelen... (bijv. Apple, Tesla, Bitcoin)"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {isLoading && <div className="search-loading">⏳</div>}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((stock, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleStockSelect(stock)}
              >
                <span className="suggestion-name">{stock.name}</span>
                <span className="suggestion-symbol">{stock.symbol}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Stocks Quick Select */}
      {showPopular && (
        <div className="popular-stocks">
          <h3>🔥 Populaire Aandelen</h3>
          <div className="stock-grid">
            {quickStocks.map((stock, index) => (
              <button
                key={index}
                className="stock-quick-btn"
                onClick={() => handleStockSelect(stock)}
                title={`Analyseer ${stock.name} (${stock.symbol})`}
              >
                <span className="stock-emoji">{stock.emoji}</span>
                <span className="stock-name">{stock.name}</span>
                <span className="stock-symbol">{stock.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="search-tips">
        <h4>💡 Zoek Tips</h4>
        <div className="tips-grid">
          <div className="tip-item">
            <strong>📱 Tech:</strong> Apple, Microsoft, Tesla, Nvidia, Google
          </div>
          <div className="tip-item">
            <strong>🥤 Consumer:</strong> Coca-Cola, Nike, Starbucks, Disney
          </div>
          <div className="tip-item">
            <strong>🏦 Finance:</strong> JP Morgan, Visa, Bank of America
          </div>
          <div className="tip-item">
            <strong>💊 Pharma:</strong> Pfizer, Johnson & Johnson, Moderna
          </div>
          <div className="tip-item">
            <strong>₿ Crypto:</strong> Bitcoin, Ethereum, Coinbase
          </div>
          <div className="tip-item">
            <strong>📊 ETFs:</strong> SPY, QQQ, VTI (indices)
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockSearchWidget;