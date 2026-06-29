import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  { q: 'How do I report an issue?', a: 'Go to "Report an Issue" in the sidebar, upload a photo, pick a category, and confirm your location on the map. Our system will automatically route it to the right ward officer.' },
  { q: 'How long does resolution take?', a: 'Most issues are reviewed within 24-48 hours. Depending on the severity, it typically takes 3 to 7 days for full resolution. You can track the live status from "My Reports".' },
  { q: 'How do I earn points and badges?', a: 'You earn points for every report submitted and bonus points when it\'s resolved. You can view your points, level, and badges in the "Rewards" section.' },
  { q: 'My location was detected incorrectly. What do I do?', a: 'You can manually adjust the pin on the map during the report submission process to set the exact coordinates.' },
  { q: 'Can I report an issue anonymously?', a: 'Yes, you can choose to hide your identity on public reports. Go to your "Profile" page and toggle the "Publicly Anonymous" setting. Note that you still need to be logged in to submit reports and earn rewards.' },
  { q: 'What categories of issues can I report?', a: 'You can report various municipal issues including: Garbage Dumps, Overflowing Bins, Missed Waste Pickups, Potholes, Broken Street Lights, Water Leaks, and Construction Waste.' },
  { q: 'How does AI image verification work?', a: 'When you upload an issue photo, our built-in AI analyzes the image to verify the type of waste, estimate its severity, and ensure it is a valid municipal issue. This prevents spam and speeds up routing.' },
  { q: 'What do the different priority levels mean?', a: 'Issues are categorized as Low, Medium, High, or Critical. For example, a minor pothole is Low/Medium, whereas an open manhole or toxic waste dumping is marked as Critical and gets dispatched immediately.' },
  { q: 'Can I edit or delete a submitted complaint?', a: 'Once a complaint is submitted, it is routed immediately to municipal officers. You cannot delete it, but you can add comments or update its status under "My Reports".' },
  { q: 'Who resolves my reported issues?', a: 'Issues are assigned to the respective Ward Officer and field workers of the area where the issue is reported. They will update the status with photo proof once resolved.' }
];

// Conversational engine for the local mock chatbot
const getBotResponse = (userText) => {
  const text = userText.toLowerCase().trim();
  
  if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('hola')) {
    return "Hello! How can I help you with the Smart Cities portal today?";
  }
  if (text.includes('report') || text.includes('complaint') || text.includes('file') || text.includes('submit')) {
    return "To report an issue:\n\n1. Click on **'Report an Issue'** in the sidebar.\n2. Upload a photo of the problem.\n3. The AI will suggest a category, or you can pick one manually.\n4. Adjust the location pin on the map if needed.\n5. Click submit! We will route it to the respective ward officer.";
  }
  if (text.includes('category') || text.includes('categories') || text.includes('what can i report')) {
    return "You can report various issues including:\n\n* **🗑️ Garbage Dumps** (unauthorized waste piling)\n* **♻️ Overflowing Bins** (public bins needing clearing)\n* **🚛 Missed Pickups** (household waste not collected)\n* **🚗 Potholes** (damaged roads)\n* **💡 Street Lights** (broken or flickering lights)\n* **💧 Water Leaks** (broken water pipelines)\n* **🏗️ Construction Waste** (debris left on streets)\n\nOur AI will automatically suggest the best category when you upload a photo!";
  }
  if (text.includes('anonymous') || text.includes('hide') || text.includes('private') || text.includes('identity')) {
    return "You can report issues **anonymously**! Go to your **'Profile'** page and toggle the **'Publicly Anonymous'** option. This hides your name and profile picture from public feeds, though municipal officers will still receive the report to resolve it.";
  }
  if (text.includes('verify') || text.includes('verification') || text.includes('ai') || text.includes('analyze') || text.includes('image')) {
    return "When you upload a photo, our portal uses **AI Image Verification** to analyze the waste type and estimate the severity. This helps prevent duplicate reports, filter out spam, and automatically assign the correct priority level.";
  }
  if (text.includes('priority') || text.includes('severity') || text.includes('critical') || text.includes('low') || text.includes('medium') || text.includes('high')) {
    return "Issues have four priority levels:\n\n* **🟢 Low**: Minor issues (e.g., small potholes).\n* **🟡 Medium**: Standard issues (e.g., flickering streetlight).\n* **🟠 High**: Urgent issues (e.g., large garbage piles blocking streets).\n* **🔴 Critical**: Immediate safety hazards (e.g., chemical leaks, open manholes).\n\nCritical issues are prioritized and dispatched immediately to field teams.";
  }
  if (text.includes('reward') || text.includes('point') || text.includes('badge') || text.includes('coin') || text.includes('level')) {
    return "You earn **10 points** for every valid report you submit, and **50 points** once the issue is resolved! You can check your progress, unlock badges, and see the leaderboard under the **'Rewards'** tab.";
  }
  if (text.includes('time') || text.includes('duration') || text.includes('how long') || text.includes('days') || text.includes('resolve')) {
    return "Our team reviews all reports within **24 to 48 hours**. Minor issues are resolved in **2 to 3 days**, while larger infrastructure issues can take up to **7 days**. You can track the live progress in **'My Reports'**.";
  }
  if (text.includes('location') || text.includes('map') || text.includes('gps') || text.includes('wrong') || text.includes('pin') || text.includes('goa')) {
    return "If the automatic GPS detection is incorrect, you can click and drag the red marker pin on the map to your exact location before clicking submit. (For Goa, we have fixed the map centering issue so it zooms exactly to Goa, India!)";
  }
  if (text.includes('track') || text.includes('status') || text.includes('check') || text.includes('where')) {
    return "You can track all your submitted issues under the **'My Reports'** tab in the sidebar. Each report has a live status timeline (Pending, Assigned, In Progress, Resolved).";
  }
  if (text.includes('officer') || text.includes('ward') || text.includes('who')) {
    return "Each area has an assigned **Ward Officer**. Our portal uses your report's location to automatically assign it to the correct officer. They are responsible for inspecting and resolving the issue.";
  }
  if (text.includes('thank') || text.includes('thanks') || text.includes('helpful')) {
    return "You're very welcome! Let me know if you have any other questions. Thank you for helping build a cleaner, smarter city!";
  }
  if (text.includes('bye') || text.includes('goodbye') || text.includes('exit')) {
    return "Goodbye! Have a wonderful day, and feel free to chat again if you need help.";
  }
  
  return "I'm here to help with any questions about the Smart Cities portal! You can ask me about reporting issues, tracking status, earning rewards, or map coordinates. If you have a specific inquiry, you can also email our support team at **support@smartcities.gov.in**.";
};

export default function HelpSupport() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' or 'chat' (mainly for mobile)
  
  // Chat States
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am Swachhata Sahayak, your Smart City Assistant. 🤖\n\nI can help you report municipal issues, track complaints, explain rewards, or answer any other questions about this portal. How can I assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    // Trigger Bot Reply
    setIsTyping(true);
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: getBotResponse(text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const quickReplies = [
    'How do I report a pothole?',
    'How to track my complaint?',
    'How do I earn points?',
    'My location is wrong'
  ];

  return (
    <div className="page" style={{ background: 'var(--sand-50)', minHeight: '100vh', padding: 0 }}>
      {/* Dynamic styles for micro-animations and responsive tabs */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background-color: var(--ink); margin: 0 2px;
          animation: blink 1.4s infinite both;
        }
        .dot:nth-child(2) { animation-delay: .2s; }
        .dot:nth-child(3) { animation-delay: .4s; }

        /* Responsive Layout styling */
        .support-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        
        .tab-button {
          flex: 1;
          padding: 12px;
          border: none;
          background: none;
          font-weight: 700;
          font-size: 14px;
          color: var(--sand-400);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.25s ease;
        }
        
        .tab-button.active {
          color: var(--green-600);
          border-bottom-color: var(--green-500);
        }

        .mobile-tabs {
          display: flex;
          background: var(--white);
          border-bottom: 1.5px solid var(--sand-100);
          margin-bottom: 16px;
        }

        @media (min-width: 768px) {
          .support-grid {
            grid-template-columns: 1.1fr 1.2fr;
          }
          .mobile-tabs {
            display: none;
          }
          .desktop-visible {
            display: block !important;
          }
        }
      `}</style>

      {/* Topbar */}
      <div className="topbar" style={{
        background: 'var(--white)', borderBottom: '1px solid var(--sand-100)', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: '14px'
      }}>
        <button className="back-btn" onClick={() => navigate(-1)}
          style={{ 
            transition: 'transform 0.2s ease', background: 'var(--sand-100)', border: 'none',
            width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
          ←
        </button>
        <div className="topbar-title" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ink)', letterSpacing: '-0.4px' }}>
          Help & Support
        </div>
      </div>

      {/* Mobile-only tab switcher */}
      <div className="mobile-tabs">
        <button 
          className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`} 
          onClick={() => setActiveTab('faq')}
        >
          Frequently Asked Questions
        </button>
        <button 
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`} 
          onClick={() => setActiveTab('chat')}
        >
          AI Chat Assistant
        </button>
      </div>

      {/* Grid container */}
      <div className="support-grid">
        
        {/* LEFT COLUMN: FAQ Accordion */}
        <div 
          className="desktop-visible"
          style={{ 
            display: activeTab === 'faq' ? 'block' : 'none',
            animation: 'slideUp 0.3s ease' 
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Knowledge Base
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--ink)', margin: '4px 0 0', letterSpacing: '-0.4px' }}>
              Frequently Asked Questions
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--sand-600)', marginTop: '6px' }}>
              Find quick answers to the most common questions about reporting issues and tracking their progress.
            </p>
          </div>

          {/* Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((f, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  style={{ 
                    background: 'var(--white)', 
                    border: '1.5px solid var(--sand-100)',
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transform: isOpen ? 'translateY(-1px)' : 'none',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      outline: 'none',
                    }}
                  >
                    <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--ink)', paddingRight: '12px' }}>
                      {f.q}
                    </span>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: isOpen ? 'var(--green-500)' : 'var(--sand-400)',
                      transition: 'transform 0.2s ease',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}>
                      ＋
                    </span>
                  </button>
                  
                  <div style={{
                    maxHeight: isOpen ? '200px' : '0',
                    opacity: isOpen ? '1' : '0',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: isOpen ? '0 20px 20px 20px' : '0 20px',
                    fontSize: '13.5px',
                    color: 'var(--sand-600)',
                    lineHeight: '1.6',
                    borderTop: isOpen ? '1px solid var(--sand-50)' : '1px solid transparent',
                  }}>
                    {f.a}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Email Support Banner */}
          <div style={{ 
            background: 'var(--green-50)', 
            border: '1.5px solid var(--green-100)',
            borderRadius: '16px',
            padding: '18px 20px', 
            marginTop: '20px', 
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}>
            <span style={{ fontSize: '24px' }}>📧</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green-600)' }}>
                Still need assistance?
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--green-600)', marginTop: '4px', opacity: 0.9 }}>
                Send an email directly to our support team at <a href="mailto:support@smartcities.gov.in" style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}>support@smartcities.gov.in</a>. We respond within 24 hours.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Chat Assistant */}
        <div 
          className="desktop-visible"
          style={{ 
            display: activeTab === 'chat' ? 'block' : 'none',
            animation: 'slideUp 0.3s ease' 
          }}
        >
          {/* Header text for Desktop */}
          <div style={{ marginBottom: '20px' }} className="desktop-only-header">
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Live Assistant
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--ink)', margin: '4px 0 0', letterSpacing: '-0.4px' }}>
              Chat with Swachhata Sahayak
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--sand-600)', marginTop: '6px' }}>
              Ask questions in real time and get instant guidance on smart city operations and services.
            </p>
          </div>

          {/* Chat Window Box */}
          <div style={{
            background: 'var(--white)',
            border: '1.5px solid var(--sand-100)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-md)',
            height: '560px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Chat Box Header */}
            <div style={{
              background: 'var(--sand-50)',
              padding: '16px 20px',
              borderBottom: '1.5px solid var(--sand-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--green-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)' }}>
                    Swachhata Sahayak
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      animation: 'pulse 2s infinite'
                    }} />
                    <span style={{ fontSize: '11px', color: 'var(--sand-400)', fontWeight: '700' }}>
                      Online Assistant
                    </span>
                  </div>
                </div>
              </div>

              {/* Clear Chat Button */}
              <button 
                onClick={() => setMessages([{
                  id: 1,
                  sender: 'bot',
                  text: 'Chat history cleared. How can I help you today?',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }])}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--sand-400)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--sand-400)'}
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Messages Scroll Container */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'var(--white)'
            }}>
              {messages.map(m => {
                const isBot = m.sender === 'bot';
                return (
                  <div 
                    key={m.id}
                    style={{
                      alignSelf: isBot ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                      animation: 'slideUp 0.25s ease-out',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isBot ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <div style={{
                      background: isBot ? 'var(--sand-50)' : 'var(--green-500)',
                      color: isBot ? 'var(--ink)' : '#ffffff',
                      padding: '12px 16px',
                      borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                      border: isBot ? '1.5px solid var(--sand-100)' : 'none',
                      fontSize: '13.5px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-line'
                    }}>
                      {m.text}
                    </div>
                    <span style={{ 
                      fontSize: '10px', 
                      color: 'var(--sand-400)', 
                      marginTop: '4px',
                      fontWeight: '600',
                      padding: '0 4px'
                    }}>
                      {m.time}
                    </span>
                  </div>
                );
              })}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'var(--sand-50)',
                  border: '1.5px solid var(--sand-100)',
                  padding: '12px 18px',
                  borderRadius: '18px 18px 18px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  animation: 'slideUp 0.15s ease-out'
                }}>
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div style={{
              padding: '10px 16px 6px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              background: 'var(--white)',
              borderTop: '1px solid var(--sand-50)'
            }}>
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qr)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: '1.5px solid var(--sand-100)',
                    background: 'var(--white)',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--sand-600)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--green-100)';
                    e.currentTarget.style.background = 'var(--green-50)';
                    e.currentTarget.style.color = 'var(--green-600)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--sand-100)';
                    e.currentTarget.style.background = 'var(--white)';
                    e.currentTarget.style.color = 'var(--sand-600)';
                  }}
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1.5px solid var(--sand-100)',
              background: 'var(--sand-50)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a question..."
                style={{
                  flex: 1,
                  background: 'var(--white)',
                  border: '1.5px solid var(--sand-200)',
                  borderRadius: '24px',
                  padding: '10px 18px',
                  fontSize: '13.5px',
                  color: 'var(--ink)',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--green-500)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--sand-200)'}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputVal.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: inputVal.trim() ? 'var(--green-500)' : 'var(--sand-200)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputVal.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  fontSize: '16px'
                }}
                onMouseEnter={e => {
                  if (inputVal.trim()) {
                    e.currentTarget.style.background = 'var(--green-600)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (inputVal.trim()) {
                    e.currentTarget.style.background = 'var(--green-500)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
