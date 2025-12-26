import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import InputEmoji from 'react-input-emoji';

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
    </svg>
);

const MessageInput = ({ sendMessage, sendTypingNotification }) => {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef(null);

    const handleTyping = (text) => {
        setMessage(text);
        sendTypingNotification(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingNotification(false);
        }, 2000);
    };

    const handleSendMessage = () => {
        if (message && message.trim()) {
            sendMessage(message);
            setMessage('');
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            sendTypingNotification(false);
        }
    };
    
    const handleEnter = () => {
        handleSendMessage();
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    return (
        <div className="message-input-container">
            {}
            <div className="custom-input-emoji-wrapper">
                <InputEmoji
                    value={message}
                    onChange={handleTyping}
                    cleanOnEnter
                    onEnter={handleEnter}
                    placeholder="Type a message..."
                />
            </div>
            <Button variant="primary" onClick={handleSendMessage} className="send-button-symbol">
                <SendIcon />
            </Button>
        </div>
    );
};

export default MessageInput;