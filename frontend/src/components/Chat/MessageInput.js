import React, { useState, useRef, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const MessageInput = ({ sendMessage, sendTypingNotification }) => {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef(null);

    // This function now handles typing notifications
    const handleTyping = (e) => {
        setMessage(e.target.value);
        
        // Send "is typing" signal
        sendTypingNotification(true);

        // Clear the previous timeout to reset the timer
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set a new timeout. If the user doesn't type for 2 seconds, send "stopped typing"
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingNotification(false);
        }, 2000); // 2 seconds
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(message);
            setMessage('');
            // Clear the timeout and send "stopped typing" immediately after sending a message
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            sendTypingNotification(false);
        }
    };

    // Cleanup the timer when the component is removed
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    return (
        <div className="message-input-container">
            <Form onSubmit={handleSubmit}>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleTyping}
                        autoComplete="off"
                    />
                    <Button variant="primary" type="submit">Send</Button>
                </InputGroup>
            </Form>
        </div>
    );
};

export default MessageInput;