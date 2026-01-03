import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState(null);
  const [attachedImageBase64, setAttachedImageBase64] = useState(null);
  const [attachedMimeType, setAttachedMimeType] = useState(null);
  const [attachedFileName, setAttachedFileName] = useState(null);
  const [messages, setMessages] = useState([
    { text: 'Hi! How can I help you donate today?', sender: 'bot' },
  ]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Get API URL from environment or use default

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMessages((prev) => [
        ...prev,
        { text: 'Connection restored! I\'m back online.', sender: 'system' },
      ]);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setMessages((prev) => [
        ...prev,
        { text: 'You appear to be offline. Please check your internet connection.', sender: 'error' },
      ]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const looksLikePdf = file.name?.toLowerCase?.().endsWith('.pdf');
    const effectiveMimeType = file.type || (looksLikePdf ? 'application/pdf' : '');
    const isImage = effectiveMimeType.startsWith('image/');
    const isPdf = effectiveMimeType === 'application/pdf';
    if (!isImage && !isPdf) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!dataUrl) return;

      setAttachedFileName(file.name || null);
      setAttachedMimeType(effectiveMimeType);

      if (isImage) {
        setAttachedPreviewUrl(dataUrl);
      } else {
        setAttachedPreviewUrl(null);
      }

      const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
      const base64 = match?.[2] || null;
      setAttachedImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Check if user is online
    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        { text: 'You are currently offline. Please check your internet connection.', sender: 'error' },
      ]);
      return;
    }

    const userText = input.trim();
    setMessages((prev) => [...prev, { text: userText, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai/chat`, {
        userMessage: userText,
        image: attachedImageBase64 || undefined,
        mimeType: attachedMimeType || undefined,
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const reply = res?.data?.reply || 'I am here to help!';
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);

      if (attachedImageBase64) {
        setAttachedPreviewUrl(null);
        setAttachedImageBase64(null);
        setAttachedMimeType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = 'Sorry, I encountered an error.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.code === 'ERR_NETWORK' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.response) {
        // Server responded with error status
        if (err.response.status === 500) {
          errorMessage = 'Server error. The AI service might be temporarily unavailable.';
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid request. Please try again.';
        } else {
          errorMessage = `Error: ${err.response.data?.error || 'Something went wrong.'}`;
        }
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'Cannot connect to server. Please ensure the server is running.';
      }
      
      setMessages((prev) => [
        ...prev,
        { text: errorMessage, sender: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .chat-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .chat-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .chat-bounce {
          animation: bounce 1s infinite;
        }

        .chat-markdown {
          white-space: normal;
          word-break: break-word;
        }
        .chat-markdown h3 {
          margin: 0 0 6px 0;
          font-size: 13px;
          font-weight: 700;
        }
        .chat-markdown p {
          margin: 0 0 6px 0;
        }
        .chat-markdown ul {
          margin: 0 0 6px 0;
          padding-left: 18px;
        }
        .chat-markdown li {
          margin: 0 0 2px 0;
        }
      `}</style>

      <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        {/* Chat Window */}
        {isOpen && (
          <div className="chat-slide-up" style={{
            width: 'min(360px, calc(100vw - 48px))',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: 'min(70vh, 520px)',
            maxHeight: 'calc(100vh - 120px)',
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(to right, #059669, #14b8a6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💬</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Donorly Assistant</span>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  background: isOnline ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isOnline ? '#22c55e' : '#ef4444',
                  }}></span>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <button
                onClick={toggleOpen}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '16px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '16px',
              minHeight: 0,
              overflowY: 'auto',
              background: '#f9fafb',
            }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    borderRadius: '16px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(to right, #059669, #14b8a6)' 
                      : msg.sender === 'error'
                      ? '#fee2e2'
                      : msg.sender === 'system'
                      ? '#dbeafe'
                      : '#fff',
                    color: msg.sender === 'user' ? '#fff' : msg.sender === 'error' ? '#991b1b' : msg.sender === 'system' ? '#1e40af' : '#1f2937',
                    border: msg.sender === 'error' ? '1px solid #fca5a5' : msg.sender === 'system' ? '1px solid #93c5fd' : msg.sender === 'bot' ? '1px solid #e5e7eb' : 'none',
                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.sender === 'bot' || msg.sender === 'error' ? '4px' : '16px',
                  }}>
                    {msg.sender === 'bot' ? (
                      <div className="chat-markdown">
                        <ReactMarkdown>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="chat-bounce" style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animationDelay: '0ms' }}></span>
                      <span className="chat-bounce" style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animationDelay: '150ms' }}></span>
                      <span className="chat-bounce" style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animationDelay: '300ms' }}></span>
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              padding: '12px',
              background: '#fff',
            }}>
              {attachedPreviewUrl && (
                <div style={{
                  marginBottom: '8px',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  background: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  <img
                    src={attachedPreviewUrl}
                    alt="Attached"
                    style={{
                      height: '52px',
                      width: 'auto',
                      maxWidth: '100%',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      objectFit: 'cover',
                      background: '#fff',
                    }}
                  />
                </div>
              )}

              {!attachedPreviewUrl && attachedMimeType === 'application/pdf' && attachedFileName && (
                <div style={{
                  marginBottom: '8px',
                  padding: '8px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  background: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    PDF attached: <span style={{ fontWeight: 600 }}>{attachedFileName}</span>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end',
              }}>
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{
                  flex: 1,
                  resize: 'none',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  padding: '10px 14px',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Type your message..."
                />

                <button
                  type="button"
                  onClick={handleAttachmentClick}
                  disabled={loading}
                  aria-label="Attach image"
                  style={{
                    flexShrink: 0,
                    background: '#fff',
                    color: '#111827',
                    borderRadius: '12px',
                    padding: '10px 10px',
                    border: '1px solid #d1d5db',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.target.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fff';
                  }}
                >
                  <Paperclip size={18} />
                </button>

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  flexShrink: 0,
                  background: (loading || !input.trim()) ? '#9ca3af' : 'linear-gradient(to right, #059669, #14b8a6)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: 'none',
                  cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  fontSize: '18px',
                }}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                }}
              >
                ➤
              </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button with Pulse */}
        <div style={{ position: 'relative' }}>
          <span className="chat-ping" style={{
            position: 'absolute',
            display: 'inline-flex',
            height: '100%',
            width: '100%',
            borderRadius: '50%',
            background: '#10b981',
            opacity: 0.75,
          }}></span>
          <button
            onClick={toggleOpen}
            style={{
              position: 'relative',
              height: '56px',
              width: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(to right, #059669, #14b8a6)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 14px rgba(0,0,0,0.3)';
            }}
          >
            💬
          </button>
        </div>
      </div>
    </>
  );
}
