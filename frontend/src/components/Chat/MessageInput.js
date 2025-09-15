import React, { useState, useRef, useEffect } from 'react';
import { InputGroup, Button } from 'react-bootstrap';
import InputEmoji from 'react-input-emoji';

const MessageInput = ({ sendMessage, sendTypingNotification }) => {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef(null);

    const handleTyping = (text) => {
        setMessage(text); // The library gives us the full text
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
    
    // This allows the component to work when the user presses Enter
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
            <InputGroup>
                {/* The new, self-contained emoji input component */}
                <InputEmoji
                    value={message}
                    onChange={handleTyping}
                    cleanOnEnter
                    onEnter={handleEnter}
                    placeholder="Type a message..."
                />
                <Button variant="primary" onClick={handleSendMessage}>Send</Button>
            </InputGroup>
        </div>
    );
};

export default MessageInput;