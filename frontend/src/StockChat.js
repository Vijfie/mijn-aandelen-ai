import React, { useState } from 'react';
import axios from 'axios';
import './StockChat.css';

function StockChat() {
  const [messages, setMessages] = useState([
    { text: "Hallo! Ik ben je AI aandelen adviseur. Vraag me of je een aandeel moet kopen of verkopen! Probeer bijvoorbeeld: 'Moet ik Apple kopen?'", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Voeg gebruiker bericht toe
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Echte API call naar onze backend
      const response = await axios.post('http://localhost:3001/api/analyze', {
        question: userInput
      });

      const data = response.data;
      
      const aiResponse = {
        text: data.answer,
        isUser: false,
        analysis: {
          recommendation: data.recommendation,
          confidence: data.confidence,
          reasoning: data.reasoning,
          scores: data.analysis
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, er ging iets mis met de analyse. Zorg ervoor dat de backend server draait!", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>🤖 Aandelen AI Adviseur</h1>
        <p>Vraag me advies over aandelen zoals Apple, Microsoft, Tesla, etc.</p>
      </div>
      
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user' : 'ai'}`}>
            <div className="message-content">
              {message.text}
              {message.analysis && (
                <div className="analysis">
                  <div className={`recommendation ${message.analysis.recommendation.toLowerCase()}`}>
                    📊 {message.analysis.recommendation}
                  </div>
                  <div className="confidence">
                    🎯 Zekerheid: {message.analysis.confidence}%
                  </div>
                  {message.analysis.reasoning && (
                    <div className="reasoning">
                      <strong>Redenen:</strong>
                      <ul>
                        {message.analysis.reasoning.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.analysis.scores && (
                    <div className="scores">
                      <div>📈 Fundamenteel: {message.analysis.scores.fundamental_score}/100</div>
                      <div>📊 Technisch: {message.analysis.scores.technical_score}/100</div>
                      <div>💭 Sentiment: {message.analysis.scores.sentiment_score}/100</div>
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
              <div className="loading">🔍 Analyseren van aandelen data...</div>
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
          placeholder="Bijv: 'Moet ik Apple aandelen kopen?'"
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