import React, { useState } from 'react';
import axios from 'axios';
import ProfessionalStockChart from './StockChart';
import MLDashboard from './MLDashboard';
import './StockChat.css';

const getSentimentClass = (score) => {
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
      console.log('📰 Frontend received data:', data);
      
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
        currentPrice: data.currentPrice,
        priceChange: data.priceChange,
        priceChangePercent: data.priceChangePercent,
        recommendation: data.recommendation,
        confidence: data.confidence,
        reasoning: data.reasoning,
        scores: data.analysis,
        technicalData: data.technicalData,
        fundamentalData: data.fundamentalData,
        newsData: data.newsData
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
      setMessages(prev => [...prev, { 
        text: "Sorry, er ging iets mis met de analyse. Probeer een bekend aandeel zoals AAPL, MSFT, of TSLA.", 
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
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
        {/* Professional Header */}
        <header className="professional-header">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-logo">🤖</div>
              <div className="brand-info">
                <h1>AI Trading Advisor</h1>
                <p>Professional Stock Analysis Platform</p>
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
              <div className="chat-title">💬 AI Analysis Chat</div>
              <div className="chat-subtitle">
                Ask for stock analysis, charts, and market insights
              </div>
            </div>
            
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-content">
                    <h3>🚀 Welcome to AI Trading Advisor</h3>
                    <p>Get professional stock analysis with real-time data, technical indicators, and AI-powered recommendations.</p>
                    <div className="example-queries">
                      <div className="example-query">"Analyze Apple stock"</div>
                      <div className="example-query">"Show Tesla chart with indicators"</div>
                      <div className="example-query">"Should I buy Microsoft?"</div>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className="message-container">
                  <div className="message-header">
                    <div className="message-sender">
                      {message.isUser ? '👤 You' : '🤖 AI Advisor'}
                    </div>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  
                  <div className="message-text">
                    {message.text}
                  </div>
                  
                  {message.analysis && (
                    <div className="analysis-layout">
                      {/* Stock Header - Full Width */}
                      {message.analysis.name && (
                        <div className="analysis-card stock-header-card">
                          <div className="stock-header-content">
                            <div className="stock-info">
                              <h3>{message.analysis.name} ({message.analysis.symbol})</h3>
                              <div className="stock-price-display">
                                <span className="current-price">
                                  {formatPrice(message.analysis.currentPrice)}
                                </span>
                                <span className={`price-change ${message.analysis.priceChange >= 0 ? 'positive' : 'negative'}`}>
                                  {formatPrice(message.analysis.priceChange)} ({formatPercent(message.analysis.priceChangePercent)})
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
                        </div>
                      )}

                      {/* Chart Section - Full Width */}
                      {message.chartData && message.chartData.data && (
                        <div className="analysis-card chart-card">
                          <div className="card-header">
                            <div>
                              <div className="card-title">📊 Technical Analysis Chart</div>
                              <div className="card-subtitle">Interactive price chart with technical indicators</div>
                            </div>
                          </div>
                          <ProfessionalStockChart 
                            stockData={message.chartData.data}
                            technicalData={message.analysis.technicalData}
                            symbol={message.analysis.symbol}
                          />
                        </div>
                      )}

                      {/* Two Column Row: News + Analysis Details */}
                      <div className="analysis-row two-column">
                        {/* News Section */}
                        {message.analysis.newsData && message.analysis.newsData.summary && (
                          <div className="analysis-card news-card">
                            <div className="card-header">
                              <div>
                                <div className="card-title">📰 News Sentiment Analysis</div>
                                <div className="card-subtitle">AI-powered sentiment analysis of recent news</div>
                              </div>
                            </div>
                            
                            <div className="news-sentiment-header">
                              <div className="sentiment-score-display">
                                <div className={`sentiment-score ${getSentimentClass(message.analysis.newsData.summary.overallSentiment)}`}>
                                  {message.analysis.newsData.summary.overallSentiment}% 
                                  {message.analysis.newsData.summary.overallSentiment > 60 ? ' Positive' : 
                                   message.analysis.newsData.summary.overallSentiment < 40 ? ' Negative' : ' Neutral'}
                                </div>
                                <div className="sentiment-breakdown">
                                  <span>👍 {message.analysis.newsData.summary.positiveCount}</span>
                                  <span>➖ {message.analysis.newsData.summary.neutralCount}</span>
                                  <span>👎 {message.analysis.newsData.summary.negativeCount}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Headlines */}
                            {message.analysis.newsData.topHeadlines && message.analysis.newsData.topHeadlines.length > 0 && (
                              <div className="headlines-grid">
                                {message.analysis.newsData.topHeadlines.slice(0, 4).map((headline, i) => (
                                  <div key={i} className={`headline-card ${headline.sentiment}`}>
                                    <div className="headline-text">{headline.title}</div>
                                    <div className="headline-footer">
                                      <span className="headline-source">{headline.source}</span>
                                      <span className={`sentiment-indicator ${headline.sentiment}`}>
                                        {headline.sentiment === 'positive' ? '📈' : 
                                         headline.sentiment === 'negative' ? '📉' : '➡️'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Analysis Details */}
                        {message.analysis.reasoning && (
                          <div className="analysis-card analysis-details-card">
                            <div className="card-header">
                              <div>
                                <div className="card-title">📋 Analysis Summary</div>
                                <div className="card-subtitle">Key factors driving the recommendation</div>
                              </div>
                            </div>
                            <div className="reasoning-list">
                              {message.analysis.reasoning.map((reason, i) => (
                                <div key={i} className="reasoning-item">
                                  <span className="reasoning-bullet">•</span>
                                  <span className="reasoning-text">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scores Section - Full Width */}
                      {message.analysis.scores && (
                        <div className="analysis-card scores-card">
                          <div className="card-header">
                            <div>
                              <div className="card-title">🎯 Analysis Scores</div>
                              <div className="card-subtitle">Comprehensive scoring across all analysis dimensions</div>
                            </div>
                          </div>
                          <div className="scores-grid">
                            <div className="score-item">
                              <div className="score-label">Fundamental</div>
                              <div className="score-value">{message.analysis.scores.fundamental_score}/100</div>
                            </div>
                            <div className="score-item">
                              <div className="score-label">Technical</div>
                              <div className="score-value">{message.analysis.scores.technical_score}/100</div>
                            </div>
                            <div className="score-item">
                              <div className="score-label">News Sentiment</div>
                              <div className="score-value">{message.analysis.scores.news_sentiment_score || 50}/100</div>
                            </div>
                            <div className="score-item total">
                              <div className="score-label">Overall Score</div>
                              <div className="score-value">{message.analysis.scores.overall_score}/100</div>
                            </div>
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
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about any stock... (e.g., 'Analyze Apple', 'Show Tesla chart')"
                  disabled={isLoading}
                  className="chat-input-field"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={isLoading || !input.trim()}
                  className="send-button"
                >
                  {isLoading ? (
                    <div className="button-spinner"></div>
                  ) : (
                    <span>📤 Analyze</span>
                  )}
                </button>
              </div>
              <div className="input-hint">
                💡 Try: "AAPL analysis", "Tesla vs Ford", "Tech sector overview"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockChat;