import React, { useState, useEffect, useRef } from 'react';
import Vapi from "@vapi-ai/web";

const vapiInstance = new Vapi('0f62e0e2-6c98-4bc0-bcda-1eba72fff361');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are DSA Teacher - an expert Data Structures & Algorithms tutor.
STRICT RULES:
- Keep ALL responses under 4 lines max
- Be direct and point-to-point, no fluff
- Use simple language, no unnecessary words
- For code: give only the key snippet, no full programs unless asked
- Format: answer first, explanation if needed in 1 line
- Never repeat what the user said
- Never say "Great question!" or similar filler phrases`;

const VoiceTeacher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState(null); // 'voice' | 'text' | null
    const [isCalling, setIsCalling] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVapiSpeaking, setIsVapiSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const assistantId = '1ef3572e-7152-4cc1-8a5d-183f2739ba77';

    useEffect(() => {
        vapiInstance.on('call-start', () => setIsCalling(true));
        vapiInstance.on('call-end', () => { setIsCalling(false); setIsVapiSpeaking(false); });
        vapiInstance.on('speech-start', () => setIsVapiSpeaking(true));
        vapiInstance.on('speech-end', () => setIsVapiSpeaking(false));
        vapiInstance.on('error', (e) => {
            console.error("Vapi Error:", e);
            setIsCalling(false);
            setIsVapiSpeaking(false);
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startVoiceCall = () => {
        setMode('voice');
        vapiInstance.start(assistantId);
    };

    const stopVoiceCall = () => {
        vapiInstance.stop();
        setMode(null);
    };

    const sendTextMessage = async () => {
        if (!inputText.trim() || isLoading) return;
        const userMsg = { role: 'user', content: inputText.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        setIsLoading(true);

        try {
            const groqKey = process.env.REACT_APP_GROQ_API_KEY;
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqKey}`
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...newMessages
                    ],
                    max_tokens: 200,
                    temperature: 0.5
                })
            });
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || "Error getting response.";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendTextMessage();
        }
    };

    const closeModal = () => {
        if (isCalling) vapiInstance.stop();
        setIsOpen(false);
        setMode(null);
        setMessages([]);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '25px',
                    left: '25px',
                    padding: '14px 24px',
                    backgroundColor: isCalling ? '#ef4444' : '#6366f1',
                    color: 'white',
                    borderRadius: '50px',
                    zIndex: 99998,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                }}
            >
                <span>{isCalling ? '🔴' : '🎙️'}</span>
                {isCalling ? 'In Call...' : 'DSA Teacher'}
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    padding: '20px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: '#1e1e2e',
                        borderRadius: '20px',
                        width: '380px',
                        maxHeight: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        overflow: 'hidden',
                        animation: 'slideUp 0.3s ease'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px'
                                }}>🤖</div>
                                <div>
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>DSA Teacher</div>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                                        {isCalling ? (isVapiSpeaking ? '🔊 Speaking...' : '🎙️ Listening...') : 'AI Powered'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeModal} style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none', color: 'white',
                                width: '32px', height: '32px',
                                borderRadius: '50%', cursor: 'pointer',
                                fontSize: '16px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>✕</button>
                        </div>

                        {/* Mode Selection */}
                        {!mode && (
                            <div style={{
                                padding: '30px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                flex: 1
                            }}>
                                <p style={{ color: '#a0a0b0', textAlign: 'center', marginBottom: '10px', fontSize: '14px' }}>
                                    Kaise baat karni hai?
                                </p>
                                <button onClick={startVoiceCall} style={{
                                    padding: '16px',
                                    backgroundColor: 'rgba(99,102,241,0.15)',
                                    border: '2px solid rgba(99,102,241,0.4)',
                                    borderRadius: '14px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.3)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.15)'}
                                >
                                    <span style={{ fontSize: '28px' }}>🎙️</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>Voice Call</div>
                                        <div style={{ fontSize: '12px', color: '#a0a0b0', fontWeight: 400 }}>Bolke pooch, AI voice mein jawab dega</div>
                                    </div>
                                </button>
                                <button onClick={() => setMode('text')} style={{
                                    padding: '16px',
                                    backgroundColor: 'rgba(139,92,246,0.15)',
                                    border: '2px solid rgba(139,92,246,0.4)',
                                    borderRadius: '14px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.3)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.15)'}
                                >
                                    <span style={{ fontSize: '28px' }}>💬</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>Text Chat</div>
                                        <div style={{ fontSize: '12px', color: '#a0a0b0', fontWeight: 400 }}>Type karke pooch, short answers milenge</div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Voice Mode UI */}
                        {mode === 'voice' && (
                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                padding: '40px 20px', gap: '20px'
                            }}>
                                {/* Animated circles */}
                                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    {isVapiSpeaking && (
                                        <>
                                            <div style={{
                                                position: 'absolute', inset: '-15px',
                                                borderRadius: '50%',
                                                border: '2px solid rgba(99,102,241,0.4)',
                                                animation: 'pulse 1.5s ease-in-out infinite'
                                            }} />
                                            <div style={{
                                                position: 'absolute', inset: '-30px',
                                                borderRadius: '50%',
                                                border: '2px solid rgba(99,102,241,0.2)',
                                                animation: 'pulse 1.5s ease-in-out infinite 0.3s'
                                            }} />
                                        </>
                                    )}
                                    <div style={{
                                        width: '100px', height: '100px',
                                        backgroundColor: isCalling ? (isVapiSpeaking ? '#6366f1' : '#22c55e') : '#ef4444',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '40px',
                                        transition: 'background-color 0.3s'
                                    }}>
                                        {isVapiSpeaking ? '🔊' : '🎙️'}
                                    </div>
                                </div>
                                <div style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>
                                    {isCalling ? (isVapiSpeaking ? 'Teacher bol raha hai...' : 'Sun raha hoon...') : 'Connecting...'}
                                </div>
                                <div style={{ color: '#a0a0b0', fontSize: '13px', textAlign: 'center' }}>
                                    DSA ke baare mein kuch bhi pooch!
                                </div>
                                <button onClick={stopVoiceCall} style={{
                                    marginTop: '10px',
                                    padding: '12px 30px',
                                    backgroundColor: '#ef4444',
                                    border: 'none', borderRadius: '50px',
                                    color: 'white', cursor: 'pointer',
                                    fontWeight: 700, fontSize: '14px'
                                }}>
                                    🛑 Call Band Karo
                                </button>
                            </div>
                        )}

                        {/* Text Chat Mode */}
                        {mode === 'text' && (
                            <>
                                {/* Messages */}
                                <div style={{
                                    flex: 1, overflowY: 'auto',
                                    padding: '16px',
                                    display: 'flex', flexDirection: 'column', gap: '10px',
                                    maxHeight: '380px'
                                }}>
                                    {messages.length === 0 && (
                                        <div style={{
                                            textAlign: 'center', color: '#a0a0b0',
                                            fontSize: '13px', marginTop: '20px'
                                        }}>
                                            <div style={{ fontSize: '30px', marginBottom: '8px' }}>👋</div>
                                            Pooch kuch bhi DSA ke baare mein!<br/>
                                            <span style={{ fontSize: '12px' }}>Arrays, Trees, DP, Graph... sab</span>
                                        </div>
                                    )}
                                    {messages.map((msg, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                        }}>
                                            <div style={{
                                                maxWidth: '80%',
                                                padding: '10px 14px',
                                                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                backgroundColor: msg.role === 'user' ? '#6366f1' : '#2a2a3e',
                                                color: 'white',
                                                fontSize: '13px',
                                                lineHeight: '1.5',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div style={{
                                                padding: '10px 16px',
                                                backgroundColor: '#2a2a3e',
                                                borderRadius: '18px 18px 18px 4px',
                                                color: '#a0a0b0', fontSize: '13px'
                                            }}>
                                                ✍️ Soch raha hoon...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', gap: '8px', alignItems: 'center'
                                }}>
                                    <input
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="DSA question type karo..."
                                        style={{
                                            flex: 1,
                                            padding: '10px 14px',
                                            backgroundColor: '#2a2a3e',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            borderRadius: '50px',
                                            color: 'white',
                                            fontSize: '13px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={sendTextMessage}
                                        disabled={isLoading || !inputText.trim()}
                                        style={{
                                            width: '40px', height: '40px',
                                            backgroundColor: inputText.trim() ? '#6366f1' : '#3a3a4e',
                                            border: 'none', borderRadius: '50%',
                                            color: 'white', cursor: inputText.trim() ? 'pointer' : 'default',
                                            fontSize: '16px', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >➤</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                }
            `}</style>
        </>
    );
};

export default VoiceTeacher;