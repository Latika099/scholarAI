import React, { useState, useRef, useEffect } from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { sendChatMessage } from '../services/api';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Loader2, 
  Database, 
  ExternalLink,
  BookOpen,
  MessageSquare
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  "What scholarships can I apply for with 80% marks?",
  "Which international scholarships offer full tuition + living stipend?",
  "What is the maximum family income limit for PM-USP?",
  "Tell me about the Chevening Scholarship requirements for Indian students.",
  "What scholarships are available for PhD research in STEM?",
  "Suggest the top 3 scholarships for my profile."
];

export default function AssistantPage() {
  const { profile } = useScholarship();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${profile.fullName || 'there'}! I am **ScholarAI Copilot**.\n\nI can answer questions regarding scholarship criteria, government guidelines (NSP/DST), corporate CSR grants, and international fellowships, grounded directly in verified scheme data.\n\nHow can I help you today?`,
      mode: 'deterministic_rag',
      provider: 'Local Scholarship Knowledge Base',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend) => {
    const query = (messageToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(query, profile, newHistory);
      
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer || 'I could not retrieve an answer for that query.',
        mode: response.mode,
        provider: response.provider || 'Scholarship Knowledge Base',
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Error contacting assistant engine: ${err.message}. Please try again.`,
          mode: 'error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format simple markdown lines into HTML elements
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold
      let parsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      parsed = parsed.replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 0.1rem 0.3rem; border-radius: 4px;">$1</code>');
      
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ margin: '0.8rem 0 0.4rem', fontSize: '1.05rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: parsed.replace('### ', '') }} />;
      }
      if (line.startsWith('> ')) {
        return (
          <div key={idx} style={{ borderLeft: '3px solid var(--primary-500)', paddingLeft: '0.75rem', margin: '0.5rem 0', fontStyle: 'italic', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: parsed.replace('> ', '') }} />
        );
      }
      if (line.startsWith('- ')) {
        return <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem' }} dangerouslySetInnerHTML={{ __html: parsed.replace('- ', '') }} />;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }
      return <p key={idx} style={{ margin: '0 0 0.35rem' }} dangerouslySetInnerHTML={{ __html: parsed }} />;
    });
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          <Sparkles size={16} /> Verified Knowledge Assistant
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          ScholarAI Copilot Chat
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Ask questions regarding eligibility cutoffs, required certificates, or scheme deadlines. Grounded in 18+ verified records.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="chat-window">
        {/* Messages Scroll Area */}
        <div className="chat-messages">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
                >
                  {/* Sender Header */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      marginBottom: '0.45rem',
                      opacity: 0.85
                    }}
                  >
                    {isUser ? <User size={13} /> : <Bot size={13} />}
                    <span style={{ fontWeight: 600 }}>{isUser ? 'You' : 'ScholarAI Assistant'}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  {/* Body Text */}
                  <div>
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Referenced Sources Pills */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Referenced Scheme Portals:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {msg.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              background: 'white',
                              border: '1px solid var(--border-light)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              color: 'var(--primary-700)',
                              textDecoration: 'none'
                            }}
                          >
                            <span>{s.name}</span>
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engine mode footnote */}
                  {!isUser && msg.provider && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Database size={11} />
                      <span>Reasoning Engine: {msg.provider}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Assistant Typing Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              <Loader2 size={16} className="animate-spin" color="var(--primary-600)" />
              <span>Analyzing scholarship criteria and generating grounded response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example Prompt Chips */}
        <div 
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-page)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            <Sparkles size={12} /> Try asking:
          </span>
          {SAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              style={{
                fontSize: '0.75rem',
                background: 'white',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.65rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.color = 'var(--primary-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-light)',
            background: 'white',
            display: 'flex',
            gap: '0.75rem',
            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Ask anything about scholarships, eligibility, income ceilings, or deadlines..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{ flex: 1 }}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !input.trim()}
            style={{ padding: '0 1.25rem' }}
          >
            <Send size={16} />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
