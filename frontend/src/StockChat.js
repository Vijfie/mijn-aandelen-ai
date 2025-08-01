import React, { useState } from 'react';
import axios from 'axios';
import './StockChat.css';

function StockChat() {
  const [messages, setMessages] = useState([
    { 
      text: "🚀 Hallo! Ik ben je AI aandelen adviseur met echte marktdata. Vraag me over aandelen zoals Apple, Microsoft, Tesla, Google, Amazon, en veel meer!", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/analyze', {
        question: userInput
      });

      const data = response.data;
      
      const aiResponse = {
        text: data.answer,
        isUser: false,
        analysis: {
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
          fundamentalData: data.fundamentalData
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, er ging iets mis met de analyse. Zorg ervoor dat de backend server draait en probeer een bekend aandeel zoals AAPL, MSFT, of TSLA.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  const formatPercent = (percent) => {
    if (!percent) return 'N/A';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>🤖 AI Aandelen Adviseur</h1>
        <p>💹 Met echte marktdata van Yahoo Finance</p>
      </div>
      
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user' : 'ai'}`}>
            <div className="message-content">
              {message.text}
              
              {message.analysis && (
                <div className="analysis">
                  {/* Stock Header */}
                  {message.analysis.name && (
                    <div className="stock-header">
                      <h3>{message.analysis.name} ({message.analysis.symbol})</h3>
                      <div className="price-info">
                        <span className="current-price">{formatPrice(message.analysis.currentPrice)}</span>
                        <span className={`price-change ${message.analysis.priceChange >= 0 ? 'positive' : 'negative'}`}>
                          {formatPrice(message.analysis.priceChange)} ({formatPercent(message.analysis.priceChangePercent)})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className={`recommendation ${message.analysis.recommendation.toLowerCase()}`}>
                    📊 {message.analysis.recommendation}
                  </div>
                  <div className="confidence">
                    🎯 Zekerheid: {message.analysis.confidence}%
                  </div>

                  {/* Reasoning */}
                  {message.analysis.reasoning && (
                    <div className="reasoning">
                      <strong>📋 Analyse:</strong>
                      <ul>
                        {message.analysis.reasoning.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Scores */}
                  {message.analysis.scores && (
                    <div className="scores">
                      <div className="score-item">
                        📈 Fundamenteel: {message.analysis.scores.fundamental_score}/100
                      </div>
                      <div className="score-item">
                        📊 Technisch: {message.analysis.scores.technical_score}/100
                      </div>
                      <div className="score-item">
                        🎯 Totaal: {message.analysis.scores.overall_score}/100
                      </div>
                    </div>
                  )}

                  {/* Technical Data */}
                  {message.analysis.technicalData && Object.keys(message.analysis.technicalData).length > 0 && (
                    <div className="technical-data">
                      <strong>📊 Technische Indicatoren:</strong>
                      <div className="indicators">
                        {message.analysis.technicalData.rsi && (
                          <span>RSI: {message.analysis.technicalData.rsi}</span>
                        )}
                        {message.analysis.technicalData.trend && (
                          <span>Trend: {message.analysis.technicalData.trend.replace('_', ' ')}</span>
                        )}
                        {message.analysis.technicalData.sma20 && (
                          <span>SMA20: ${parseFloat(message.analysis.technicalData.sma20).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="loading">
                🔍 Ophalen van real-time marktdata...<br/>
                📊 Uitvoeren van technische analyse...<br/>
                🤖 AI maakt beslissing...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Bijv: 'Moet ik Tesla kopen?' of 'Hoe staat Apple ervoor?'"
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? '⏳' : '📤'} Verstuur
        </button>
      </div>
    </div>
  );
}

export default StockChat;