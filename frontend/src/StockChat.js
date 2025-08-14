// frontend/src/StockChat.js — default imports + fixed sendMessage
import React, { useState } from 'react';
import axios from 'axios';
import ProfessionalStockChart from './StockChart';
import MLDashboard from './MLDashboard';
import './StockChat.css';
import EnhancedPositionTracker from './EnhancedPositionTracker';
// import StockSearchWidget from './StockSearchWidget';

const getSentimentClass = (score) => {
  if (typeof score !== 'number') return 'neutral';
  if (score > 70) return 'very-positive';
  if (score > 55) return 'positive';
  if (score < 30) return 'very-negative';
  if (score < 45) return 'negative';
  return 'neutral';
};

function StockChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMLDashboard, setShowMLDashboard] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showPositionTracker, setShowPositionTracker] = useState(false);

  // accepteert nu ook een geforceerde vraag (string)
  const sendMessage = async (forcedQuestion) => {
    const questionToAsk =
      typeof forcedQuestion === 'string' && forcedQuestion.trim()
        ? forcedQuestion.trim()
        : input.trim();

    if (!questionToAsk) return;

    const userMessage = { text: questionToAsk, isUser: true, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/analyze', {
        question: questionToAsk,
      });

      const data = response.data;

      // Chart data ophalen
      let chartData = null;
      if (data.symbol && !data.error) {
        try {
          const chartResponse = await axios.get(
            `http://localhost:3001/api/chart/${data.symbol}`
          );
          chartData = chartResponse.data;
        } catch (chartError) {
          console.log('Chart data niet beschikbaar:', chartError.message);
        }
      }

      const analysisData = {
        symbol: data.symbol ?? '',
        name: data.name ?? '',
        assetType: data.assetType ?? 'STOCKS',
        currentPrice: data.currentPrice,
        priceChange: data.priceChange,
        priceChangePercent: data.priceChangePercent,
        currency: data.currency ?? 'USD',
        recommendation: data.recommendation ?? 'HOLD',
        confidence: data.confidence ?? 0,
        reasoning: Array.isArray(data.reasoning) ? data.reasoning : [],
        scores: data.analysis ?? null,
        technicalData: data.technicalData ?? null,
        fundamentalData: data.fundamentalData ?? null,
        newsData: data.newsData ?? { summary: { overallSentiment: 50 }, articles: [] },
      };

      const aiResponse = {
        text: data.answer || 'Analyse voltooid.',
        isUser: false,
        timestamp: new Date(),
        analysis: analysisData,
        chartData: chartData,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setCurrentAnalysis(analysisData);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          text:
            'Sorry, er ging iets mis met de analyse. Probeer een bekend aandeel zoals AAPL, MSFT, TSLA, of andere assets zoals BTC, EURUSD, GOLD.',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    if (price === undefined || price === null || Number.isNaN(price)) return 'N/A';
    if (currency === 'USD' && price < 1) return `$${Number(price).toFixed(6)}`;
    if (currency === 'USD') {
      return `$${Number(price).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    const digits = Math.abs(price) < 1 ? 6 : 5;
    return `${Number(price).toFixed(digits)} ${currency}`;
  };

  const formatPercent = (percent) => {
    if (percent === undefined || percent === null || Number.isNaN(percent)) return 'N/A';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${Number(percent).toFixed(2)}%`;
  };

  const formatTime = (timestamp) => {
    const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getAssetTypeBadge = (assetType) => {
    if (!assetType) return null;
    const assetConfig = {
      STOCKS: { icon: '📈', color: '#3b82f6' },
      CRYPTO: { icon: '₿', color: '#f59e0b' },
      FOREX: { icon: '💱', color: '#10b981' },
      COMMODITIES: { icon: '🥇', color: '#fbbf24' },
      ETF: { icon: '📊', color: '#8b5cf6' },
    };
    const config = assetConfig[assetType] || assetConfig['STOCKS'];
    return (
      <div className="asset-type-badge" style={{ backgroundColor: config.color }}>
        {config.icon} {assetType}
      </div>
    );
  };

  // Early returns
  if (showMLDashboard) {
    return (
      <div className="App">
        <header className="professional-header">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-logo">🤖</div>
              <div className="brand-info">
                <h1>AI Trading Advisor</h1>
                <p>Machine Learning Dashboard</p>
              </div>
            </div>
            <div className="header-controls">
              <button className="pro-button active" onClick={() => setShowMLDashboard(false)}>
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

  if (showPositionTracker) {
    return (
      <div className="App">
        <header className="professional-header">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-logo">🤖</div>
              <div className="brand-info">
                <h1>AI Trading Advisor</h1>
                <p>Enhanced Position Tracker</p>
              </div>
            </div>
            <div className="header-controls">
              <button
                className="pro-button active"
                onClick={() => setShowPositionTracker(false)}
              >
                💬 Back to Chat
              </button>
            </div>
          </div>
        </header>
        <div className="main-content">
          <EnhancedPositionTracker />
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <header className="professional-header">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-logo">🤖</div>
              <div className="brand-info">
                <h1>AI Trading Advisor</h1>
                <p>Professional Multi-Asset Analysis Platform</p>
              </div>
            </div>

            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-value">87.3%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">1,247</div>
                <div className="stat-label">Analyses</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">Live</div>
                <div className="stat-label">Market Data</div>
              </div>
            </div>

            <button className="pro-button" onClick={() => setShowPositionTracker(true)}>
              📊 Position Tracker
            </button>

            <div className="header-controls">
              <button className="pro-button" onClick={() => setShowMLDashboard(true)}>
                🧠 AI Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Stock Search Widget */}
{/* Tijdelijk uitgeschakeld - StockSearchWidget
<div className="stock-search-section">
  <StockSearchWidget 
    onStockSelect={(stock) => {
      const message = `Analyseer ${stock.name} (${stock.symbol})`;
      setMessages(prev => [...prev, {
        text: message,
        isUser: true,
        timestamp: new Date()
      }]);
      sendMessage(message);
    }}
    showPopular={true}
  />
</div>
*/}

        {/* Main Content */}
        <div className="main-content">
          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-header">
              <div className="chat-title">💬 AI Analysis Chat</div>
              <div className="chat-subtitle">
                Ask for analysis across stocks, crypto, forex, commodities, and ETFs
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-content">
                    <h3>🚀 Welcome to AI Trading Advisor</h3>
                    <p>
                      Get professional analysis with real-time data, technical indicators, and
                      AI-powered recommendations across all major asset classes.
                    </p>
                    <div className="example-queries">
                      <div className="example-query">"Analyze Apple stock"</div>
                      <div className="example-query">"Bitcoin price analysis"</div>
                      <div className="example-query">"EUR/USD forecast"</div>
                      <div className="example-query">"Gold outlook"</div>
                      <div className="example-query">"SPY ETF performance"</div>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={index} className="message-container">
                  <div className="message-header">
                    <div className="message-sender">{message.isUser ? '👤 You' : '🤖 AI Advisor'}</div>
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>

                  <div className="message-text">{message.text}</div>

                  {message.analysis && (
                    <div className="analysis-layout">
                      {/* Stock Header */}
                      {message.analysis.name && (
                        <div className="analysis-card stock-header-card">
                          <div className="stock-header-content">
                            <div className="stock-info">
                              {getAssetTypeBadge(message.analysis.assetType)}
                              <h3>
                                {message.analysis.name} ({message.analysis.symbol})
                              </h3>
                              <div className="stock-price-display">
                                <span className="current-price">
                                  {formatPrice(
                                    message.analysis.currentPrice,
                                    message.analysis.currency
                                  )}
                                </span>
                                <span
                                  className={`price-change ${
                                    (message.analysis.priceChange ?? 0) >= 0 ? 'positive' : 'negative'
                                  }`}
                                >
                                  {formatPrice(
                                    message.analysis.priceChange ?? 0,
                                    message.analysis.currency
                                  )}{' '}
                                  ({formatPercent(message.analysis.priceChangePercent)})
                                </span>
                              </div>
                            </div>

                            <div className="recommendation-display">
                              <div
                                className={`recommendation-badge ${String(
                                  message.analysis.recommendation || 'HOLD'
                                )
                                  .toLowerCase()
                                  .replace(' ', '-')}`}
                              >
                                {message.analysis.recommendation || 'HOLD'}
                              </div>
                              <div className="confidence-display">
                                {message.analysis.confidence ?? 0}% Confidence
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Chart Section */}
                      {message.chartData &&
                        Array.isArray(message.chartData.data) && (
                          <div className="analysis-card chart-card">
                            <div className="card-header">
                              <div>
                                <div className="card-title">📊 Technical Analysis Chart</div>
                                <div className="card-subtitle">
                                  Interactive price chart with technical indicators
                                </div>
                              </div>
                            </div>
                            <ProfessionalStockChart
  stockData={message.chartData.data}
  technicalData={{
    ...message.analysis.technicalData,
    trend: message.analysis.technicalData?.trend?.direction || 
           message.analysis.technicalData?.trend || 
           "NEUTRAL"
  }}
  symbol={message.analysis.symbol}
/>
                          </div>
                        )}

                      {/* News + Analysis Details */}
                      <div className="analysis-row two-column">
                        {/* News Section */}
                        {message.analysis.newsData &&
                          Array.isArray(message.analysis.newsData.articles) &&
                          message.analysis.newsData.articles.length > 0 && (
                            <div className="analysis-card news-card">
                              <div className="card-header">
                                <div>
                                  <div className="card-title">📰 News & Sentiment</div>
                                  <div className="card-subtitle">
                                    Latest market news affecting {message.analysis.name}
                                  </div>
                                </div>
                                <div
                                  className={`sentiment-badge ${getSentimentClass(
                                    message.analysis.newsData.summary?.overallSentiment ?? 50
                                  )}`}
                                >
                                  {message.analysis.newsData.summary?.overallSentiment ?? 50}% Sentiment
                                </div>
                              </div>
                              <div className="news-articles">
                                {message.analysis.newsData.articles.slice(0, 3).map((article, idx) => (
                                  <div key={idx} className="news-article">
                                    <div className="article-title">{article.title || 'News Article'}</div>
                                    <div className="article-meta">
                                      <span className="article-source">{article.source || 'News Source'}</span>
                                      <span className="article-date">
                                        {article.date ? new Date(article.date).toLocaleDateString() : 'Recent'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Analysis Details */}
                        <div className="analysis-card analysis-details-card">
                          <div className="card-header">
                            <div className="card-title">🎯 Analysis Scores</div>
                          </div>
                          {message.analysis.scores && (
                            <div className="analysis-scores">
                              <div className="score-item">
                                <div className="score-label">Technical</div>
                                <div className="score-bar">
                                  <div
                                    className="score-fill"
                                    style={{ width: `${message.analysis.scores.technical_score || 0}%` }}
                                  />
                                </div>
                                <div className="score-value">
                                  {message.analysis.scores.technical_score || 0}/100
                                </div>
                              </div>
                              <div className="score-item">
                                <div className="score-label">Fundamental</div>
                                <div className="score-bar">
                                  <div
                                    className="score-fill"
                                    style={{ width: `${message.analysis.scores.fundamental_score || 0}%` }}
                                  />
                                </div>
                                <div className="score-value">
                                  {message.analysis.scores.fundamental_score || 0}/100
                                </div>
                              </div>
                              <div className="score-item">
                                <div className="score-label">News Sentiment</div>
                                <div className="score-bar">
                                  <div
                                    className="score-fill"
                                    style={{ width: `${message.analysis.scores.news_score || 0}%` }}
                                  />
                                </div>
                                <div className="score-value">
                                  {message.analysis.scores.news_score || 0}/100
                                </div>
                              </div>
                              <div className="score-item overall">
                                <div className="score-label">Overall Score</div>
                                <div className="score-bar">
                                  <div
                                    className="score-fill overall"
                                    style={{ width: `${message.analysis.scores.overall_score || 0}%` }}
                                  />
                                </div>
                                <div className="score-value">
                                  {message.analysis.scores.overall_score || 0}/100
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Analysis Reasoning */}
                      {Array.isArray(message.analysis.reasoning) &&
                        message.analysis.reasoning.length > 0 && (
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
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="message-container">
                  <div className="message-header">
                    <div className="message-sender">🤖 AI Advisor</div>
                    <div className="message-time">{formatTime(new Date())}</div>
                  </div>
                  <div className="loading-content">
                    <div className="loading-animation">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                    <div className="loading-text">
                      Gathering market data and running AI analysis...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="chat-input">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                  placeholder="Ask about any asset... (e.g., 'Analyze Apple', 'Bitcoin forecast', 'EUR/USD analysis')"
                  disabled={isLoading}
                  className="chat-input-field"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="send-button"
                >
                  {isLoading ? <div className="button-spinner"></div> : <span>📤 Analyze</span>}
                </button>
              </div>
              <div className="input-hint">
                💡 Try: "AAPL vs MSFT", "Bitcoin analysis", "EURUSD forecast", "Gold vs Silver",
                "SPY performance"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug */}
      {/* <pre style={{ color: '#999' }}>{JSON.stringify({ currentAnalysis }, null, 2)}</pre> */}
    </div>
  );
}

export default StockChat;
