// frontend/src/MultiAssetChat.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfessionalStockChart from './StockChart';
import MLDashboard from './MLDashboard';
import './MultiAssetChat.css';

const getSentimentClass = (score) => {
  if (score > 70) return 'very-positive';
  if (score > 55) return 'positive';
  if (score < 30) return 'very-negative';
  if (score < 45) return 'negative';
  return 'neutral';
};

const getAssetIcon = (assetType) => {
  const icons = {
    'STOCKS': '📈',
    'CRYPTO': '₿',
    'FOREX': '💱',
    'COMMODITIES': '🥇',
    'ETF': '📊'
  };
  return icons[assetType] || '📈';
};

const getAssetColor = (assetType) => {
  const colors = {
    'STOCKS': '#3b82f6',
    'CRYPTO': '#f59e0b',
    'FOREX': '#10b981',
    'COMMODITIES': '#fbbf24',
    'ETF': '#8b5cf6'
  };
  return colors[assetType] || '#3b82f6';
};

function MultiAssetChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMLDashboard, setShowMLDashboard] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [supportedAssets, setSupportedAssets] = useState({});
  const [selectedAssetType, setSelectedAssetType] = useState('ALL');
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Load supported assets on component mount
  useEffect(() => {
    loadSupportedAssets();
  }, []);

  const loadSupportedAssets = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/assets');
      setSupportedAssets(response.data.assets || {});
      setAssetsLoaded(true);
      console.log('Loaded supported assets:', response.data.assets);
    } catch (error) {
      console.error('Error loading supported assets:', error);
      // Set empty object as fallback
      setSupportedAssets({});
      setAssetsLoaded(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/analyze', {
        question: userInput
      });

      const data = response.data;
      console.log('📰 Frontend received multi-asset data:', data);
      
      let chartData = null;
      if (data.symbol && !data.error) {
        try {
          const chartResponse = await axios.get(`http://localhost:3001/api/chart/${data.symbol}`);
          chartData = chartResponse.data;
        } catch (chartError) {
          console.log('Chart data niet beschikbaar:', chartError.message);
        }
      }
      
      const analysisData = {
        symbol: data.symbol,
        name: data.name,
        assetType: data.assetType,
        currentPrice: data.currentPrice,
        priceChange: data.priceChange,
        priceChangePercent: data.priceChangePercent,
        currency: data.currency,
        recommendation: data.recommendation,
        confidence: data.confidence,
        reasoning: data.reasoning,
        scores: data.analysis,
        technicalData: data.technicalData,
        fundamentalData: data.fundamentalData,
        newsData: data.newsData,
        assetSpecificData: data.assetSpecificData,
        dataSource: data.dataSource
      };

      const aiResponse = {
        text: data.answer,
        isUser: false,
        timestamp: new Date(),
        analysis: analysisData,
        chartData: chartData
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setCurrentAnalysis(analysisData);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Enhanced error message with supported assets
      let errorMessage = "Sorry, er ging iets mis met de analyse. ";
      if (error.response?.data?.supportedAssets) {
        const assets = error.response.data.supportedAssets;
        const examples = [];
        if (assets.STOCKS && Array.isArray(assets.STOCKS) && assets.STOCKS.length > 0) {
          examples.push(`aandelen (${assets.STOCKS.slice(0,2).map(a => a.symbol).join(', ')})`);
        }
        if (assets.CRYPTO && Array.isArray(assets.CRYPTO) && assets.CRYPTO.length > 0) {
          examples.push(`crypto (${assets.CRYPTO.slice(0,2).map(a => a.symbol).join(', ')})`);
        }
        if (assets.FOREX && Array.isArray(assets.FOREX) && assets.FOREX.length > 0) {
          examples.push(`forex (${assets.FOREX.slice(0,2).map(a => a.symbol).join(', ')})`);
        }
        
        if (examples.length > 0) {
          errorMessage += `Probeer: ${examples.join(', ')}.`;
        } else {
          errorMessage += "Probeer: AAPL, BTC, EURUSD, GOLD, SPY.";
        }
      } else {
        errorMessage += "Probeer: AAPL, BTC, EURUSD, GOLD, SPY.";
      }
      
      setMessages(prev => [...prev, { 
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAssetExample = (symbol) => {
    setInput(`Analyseer ${symbol}`);
  };

  const formatPrice = (price, currency = 'USD') => {
    if (!price && price !== 0) return 'N/A';
    
    // Format based on currency and price range
    if (currency === 'USD' && price < 1) {
      return `$${price.toFixed(6)}`; // For small crypto prices
    } else if (currency === 'USD') {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `${price.toFixed(5)} ${currency}`;
    }
  };

  const formatPercent = (percent) => {
    if (!percent && percent !== 0) return 'N/A';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderAssetSpecificMetrics = (analysis) => {
    const { assetType, assetSpecificData } = analysis;
    
    if (!assetSpecificData) return null;

    switch (assetType) {
      case 'STOCKS':
        return (
          <div className="asset-specific-metrics">
            <h4>📊 Stock Metrics</h4>
            <div className="metrics-grid">
              {assetSpecificData.pe && (
                <div className="metric-item">
                  <span className="metric-label">P/E Ratio</span>
                  <span className="metric-value">{assetSpecificData.pe.toFixed(1)}</span>
                </div>
              )}
              {assetSpecificData.beta && (
                <div className="metric-item">
                  <span className="metric-label">Beta</span>
                  <span className="metric-value">{assetSpecificData.beta.toFixed(2)}</span>
                </div>
              )}
              {assetSpecificData.dividendYield && (
                <div className="metric-item">
                  <span className="metric-label">Dividend Yield</span>
                  <span className="metric-value">{assetSpecificData.dividendYield.toFixed(2)}%</span>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'CRYPTO':
        return (
          <div className="asset-specific-metrics">
            <h4>₿ Crypto Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">24h High</span>
                <span className="metric-value">{formatPrice(assetSpecificData.high24h)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">24h Low</span>
                <span className="metric-value">{formatPrice(assetSpecificData.low24h)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">52w Range</span>
                <span className="metric-value">
                  {formatPrice(assetSpecificData.low52)} - {formatPrice(assetSpecificData.high52)}
                </span>
              </div>
            </div>
          </div>
        );
        
      case 'FOREX':
        return (
          <div className="asset-specific-metrics">
            <h4>💱 Forex Metrics</h4>
            <div className="metrics-grid">
              {assetSpecificData.bid && (
                <div className="metric-item">
                  <span className="metric-label">Bid</span>
                  <span className="metric-value">{assetSpecificData.bid.toFixed(5)}</span>
                </div>
              )}
              {assetSpecificData.ask && (
                <div className="metric-item">
                  <span className="metric-label">Ask</span>
                  <span className="metric-value">{assetSpecificData.ask.toFixed(5)}</span>
                </div>
              )}
              {assetSpecificData.spread && (
                <div className="metric-item">
                  <span className="metric-label">Spread</span>
                  <span className="metric-value">{(assetSpecificData.spread * 10000).toFixed(1)} pips</span>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'COMMODITIES':
        return (
          <div className="asset-specific-metrics">
            <h4>🥇 Commodity Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">52w High</span>
                <span className="metric-value">{formatPrice(assetSpecificData.high52)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">52w Low</span>
                <span className="metric-value">{formatPrice(assetSpecificData.low52)}</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderAssetExamples = () => {
    // Don't render anything if assets aren't loaded yet
    if (!assetsLoaded) {
      return (
        <div className="asset-examples">
          <div className="loading-assets">Loading supported assets...</div>
        </div>
      );
    }

    // Safe check for supportedAssets
    if (!supportedAssets || typeof supportedAssets !== 'object' || Object.keys(supportedAssets).length === 0) {
      return (
        <div className="asset-examples">
          <div className="no-assets">No assets available. Server may be starting up...</div>
        </div>
      );
    }

    const filteredAssets = selectedAssetType === 'ALL' 
      ? supportedAssets 
      : { [selectedAssetType]: supportedAssets[selectedAssetType] || [] };

    return (
      <div className="asset-examples">
        <div className="asset-type-filters">
          <button 
            className={`filter-btn ${selectedAssetType === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedAssetType('ALL')}
          >
            All Assets
          </button>
          {Object.keys(supportedAssets).map(type => (
            <button 
              key={type}
              className={`filter-btn ${selectedAssetType === type ? 'active' : ''}`}
              onClick={() => setSelectedAssetType(type)}
              style={{ borderColor: getAssetColor(type) }}
            >
              {getAssetIcon(type)} {type}
            </button>
          ))}
        </div>
        
        <div className="asset-examples-grid">
          {Object.entries(filteredAssets).map(([type, assets]) => {
            // Safe check for assets array
            if (!Array.isArray(assets)) return null;
            
            return (
              <div key={type} className="asset-type-section">
                <h4 style={{ color: getAssetColor(type) }}>
                  {getAssetIcon(type)} {type}
                </h4>
                <div className="asset-buttons">
                  {assets.slice(0, 6).map(asset => (
                    <button
                      key={asset.symbol}
                      className="asset-example-btn"
                      onClick={() => selectAssetExample(asset.symbol)}
                      style={{ borderColor: getAssetColor(type) }}
                    >
                      <span className="asset-symbol">{asset.symbol}</span>
                      <span className="asset-name">{asset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (showMLDashboard) {
    return (
      <div className="App">
        <header className="professional-header">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-logo">🤖</div>
              <div className="brand-info">
                <h1>Multi-Asset AI Advisor</h1>
                <p>Machine Learning Dashboard</p>
              </div>
            </div>
            <div className="header-controls">
              <button 
                className="pro-button active"
                onClick={() => setShowMLDashboard(false)}
              >
                💬 Back to Chat
              </button>
            </div>
          </div>
        </header>
        <div className="main-content">
          <MLDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="app-container">
        {/* Enhanced Header with Multi-Asset Support */}
        <header className="professional-header multi-asset">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-logo">🌐</div>
              <div className="brand-info">
                <h1>Multi-Asset AI Advisor</h1>
                <p>Stocks • Crypto • Forex • Commodities • ETFs</p>
              </div>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-value">
                  {supportedAssets && typeof supportedAssets === 'object' 
                    ? Object.values(supportedAssets).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
                    : 0
                  }
                </div>
                <div className="stat-label">Assets</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {supportedAssets && typeof supportedAssets === 'object' 
                    ? Object.keys(supportedAssets).length 
                    : 0
                  }
                </div>
                <div className="stat-label">Asset Classes</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">Live</div>
                <div className="stat-label">Data Feed</div>
              </div>
            </div>
            
            <div className="header-controls">
              <button 
                className="pro-button"
                onClick={() => setShowMLDashboard(true)}
              >
                🧠 AI Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-content">
          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-header">
              <div className="chat-title">🌐 Multi-Asset Analysis Chat</div>
              <div className="chat-subtitle">
                Analyze stocks, crypto, forex, commodities, and ETFs with AI
              </div>
            </div>
            
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message multi-asset">
                  <div className="welcome-content">
                    <h3>🚀 Welcome to Multi-Asset AI Advisor</h3>
                    <p>Get professional analysis across all major asset classes with real-time data and AI-powered insights.</p>
                    
                    {/* Quick Examples */}
                    <div className="quick-examples">
                      <div className="example-category">
                        <h4>📈 Try these examples:</h4>
                        <div className="example-buttons">
                          <button onClick={() => selectAssetExample('AAPL')} className="example-btn stocks">
                            📈 "Analyze Apple stock"
                          </button>
                          <button onClick={() => selectAssetExample('BTC')} className="example-btn crypto">
                            ₿ "Bitcoin analysis"
                          </button>
                          <button onClick={() => selectAssetExample('EURUSD')} className="example-btn forex">
                            💱 "EUR/USD forecast"
                          </button>
                          <button onClick={() => selectAssetExample('GOLD')} className="example-btn commodities">
                            🥇 "Gold price outlook"
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Supported Assets */}
                    {renderAssetExamples()}
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className="message-container">
                  <div className="message-header">
                    <div className="message-sender">
                      {message.isUser ? '👤 You' : '🤖 Multi-Asset AI'}
                    </div>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  
                  <div className="message-text">
                    {message.text}
                  </div>
                  
                  {message.analysis && (
                    <div className="analysis-layout multi-asset">
                      {/* Asset Header with Type Badge */}
                      {message.analysis.name && (
                        <div className="analysis-card asset-header-card">
                          <div className="asset-header-content">
                            <div className="asset-info">
                              <div className="asset-title-row">
                                <div className="asset-type-badge" style={{ backgroundColor: getAssetColor(message.analysis.assetType) }}>
                                  {getAssetIcon(message.analysis.assetType)} {message.analysis.assetType}
                                </div>
                                <h3>{message.analysis.name} ({message.analysis.symbol})</h3>
                              </div>
                              <div className="asset-price-display">
                                <span className="current-price">
                                  {formatPrice(message.analysis.currentPrice, message.analysis.currency)}
                                </span>
                                <span className={`price-change ${message.analysis.priceChange >= 0 ? 'positive' : 'negative'}`}>
                                  {formatPrice(message.analysis.priceChange, message.analysis.currency)} ({formatPercent(message.analysis.priceChangePercent)})
                                </span>
                              </div>
                            </div>
                            
                            <div className="recommendation-display">
                              <div className={`recommendation-badge ${message.analysis.recommendation.toLowerCase().replace(' ', '-')}`}>
                                {message.analysis.recommendation}
                              </div>
                              <div className="confidence-display">
                                {message.analysis.confidence}% Confidence
                              </div>
                            </div>
                          </div>
                          
                          {/* Data Source Badge */}
                          {message.analysis.dataSource && (
                            <div className="data-source-badge">
                              📡 {message.analysis.dataSource}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Chart Section - Full Width */}
                      {message.chartData && message.chartData.data && (
                        <div className="analysis-card chart-card multi-asset">
                          <div className="card-header">
                            <div>
                              <div className="card-title">
                                📊 {message.analysis.assetType} Technical Analysis
                              </div>
                              <div className="card-subtitle">
                                Interactive {message.chartData.period} chart with technical indicators
                              </div>
                            </div>
                            <div className="chart-asset-badge" style={{ backgroundColor: getAssetColor(message.analysis.assetType) }}>
                              {getAssetIcon(message.analysis.assetType)}
                            </div>
                          </div>
                          <ProfessionalStockChart 
                            stockData={message.chartData.data}
                            technicalData={message.analysis.technicalData}
                            symbol={message.analysis.symbol}
                            assetType={message.analysis.assetType}
                          />
                        </div>
                      )}

                      {/* Two Column Row: Asset-Specific Metrics + Analysis Details */}
                      <div className="analysis-row two-column">
                        {/* Asset-Specific Metrics */}
                        <div className="analysis-card metrics-card">
                          <div className="card-header">
                            <div className="card-title">
                              {getAssetIcon(message.analysis.assetType)} Asset Metrics
                            </div>
                          </div>
                          {renderAssetSpecificMetrics(message.analysis)}
                        </div>

                        {/* Analysis Scores */}
                        <div className="analysis-card scores-card">
                          <div className="card-header">
                            <div className="card-title">🎯 Analysis Scores</div>
                          </div>
                          <div className="scores-grid">
                            <div className="score-item">
                              <div className="score-label">Technical</div>
                              <div className="score-bar">
                                <div 
                                  className="score-fill" 
                                  style={{ width: `${message.analysis.scores.technical_score}%` }}
                                ></div>
                              </div>
                              <div className="score-value">{message.analysis.scores.technical_score}/100</div>
                            </div>
                            <div className="score-item">
                              <div className="score-label">Fundamental</div>
                              <div className="score-bar">
                                <div 
                                  className="score-fill" 
                                  style={{ width: `${message.analysis.scores.fundamental_score}%` }}
                                ></div>
                              </div>
                              <div className="score-value">{message.analysis.scores.fundamental_score}/100</div>
                            </div>
                            <div className="score-item">
                              <div className="score-label">News Sentiment</div>
                              <div className="score-bar">
                                <div 
                                  className="score-fill" 
                                  style={{ width: `${message.analysis.scores.news_score}%` }}
                                ></div>
                              </div>
                              <div className="score-value">{message.analysis.scores.news_score}/100</div>
                            </div>
                            <div className="score-item overall">
                              <div className="score-label">Overall Score</div>
                              <div className="score-bar">
                                <div 
                                  className="score-fill overall" 
                                  style={{ width: `${message.analysis.scores.overall_score}%` }}
                                ></div>
                              </div>
                              <div className="score-value">{message.analysis.scores.overall_score}/100</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Reasoning */}
                      {message.analysis.reasoning && Array.isArray(message.analysis.reasoning) && (
                        <div className="analysis-card reasoning-card">
                          <div className="card-header">
                            <div className="card-title">🧠 AI Analysis Reasoning</div>
                          </div>
                          <div className="reasoning-list">
                            {message.analysis.reasoning.map((reason, idx) => (
                              <div key={idx} className="reasoning-item">
                                <span className="reasoning-bullet">•</span>
                                <span className="reasoning-text">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* News Section */}
                      {message.analysis.newsData && message.analysis.newsData.articles && Array.isArray(message.analysis.newsData.articles) && message.analysis.newsData.articles.length > 0 && (
                        <div className="analysis-card news-card">
                          <div className="card-header">
                            <div>
                              <div className="card-title">📰 Market News & Sentiment</div>
                              <div className="card-subtitle">
                                Latest news affecting {message.analysis.name}
                              </div>
                            </div>
                            <div className={`sentiment-badge ${getSentimentClass(message.analysis.newsData.summary?.overallSentiment || 50)}`}>
                              {message.analysis.newsData.summary?.overallSentiment || 50}% Sentiment
                            </div>
                          </div>
                          <div className="news-articles">
                            {message.analysis.newsData.articles.slice(0, 3).map((article, idx) => (
                              <div key={idx} className="news-article">
                                <div className="article-title">{article.title || 'News Article'}</div>
                                <div className="article-meta">
                                  <span className="article-source">{article.source || 'Unknown Source'}</span>
                                  <span className="article-date">
                                    {article.date ? new Date(article.date).toLocaleDateString() : 'Recent'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="message-container">
                  <div className="message-header">
                    <div className="message-sender">🤖 Multi-Asset AI</div>
                    <div className="message-time">{formatTime(new Date())}</div>
                  </div>
                  <div className="loading-content multi-asset">
                    <div className="loading-animation">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                    <div className="loading-text">
                      Gathering multi-asset data and running AI analysis...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Input Section */}
            <div className="chat-input multi-asset">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about any asset... (e.g., 'Bitcoin analysis', 'EURUSD forecast', 'Gold outlook')"
                  disabled={isLoading}
                  className="chat-input-field"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={isLoading || !input.trim()}
                  className="send-button multi-asset"
                >
                  {isLoading ? (
                    <div className="button-spinner"></div>
                  ) : (
                    <span>🌐 Analyze</span>
                  )}
                </button>
              </div>
              <div className="input-hint multi-asset">
                💡 Try: "BTC vs ETH", "AAPL technical analysis", "EURUSD daily outlook", "Gold commodity forecast"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiAssetChat;