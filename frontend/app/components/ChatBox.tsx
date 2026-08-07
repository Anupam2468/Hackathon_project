'use client';

import { useState } from 'react';
import styles from './ChatBox.module.css';

export default function ChatBox({ onClose, partnerName }: { onClose: () => void, partnerName: string }) {
    const [messages, setMessages] = useState([
        { text: `Hi, I am ${partnerName}, I received your emergency ping. I am 12 mins away.`, sender: 'partner' },
        { text: 'Thank you so much! Please reach the main reception.', sender: 'me' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { text: input, sender: 'me' }]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { text: 'Got it, navigating there now.', sender: 'partner' }]);
        }, 2000);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.chatContainer}>
                <div className={styles.header}>
                    <h3>Chat with {partnerName}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.messages}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`${styles.message} ${styles[msg.sender]}`}>
                            <div className={styles.bubble}>{msg.text}</div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSend} className={styles.inputArea}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className={styles.input}
                    />
                    <button type="submit" className={styles.sendBtn}>Send</button>
                </form>
            </div>
        </div>
    );
}
