import React, { useEffect, useRef, useContext } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import AuthContext from '../../contexts/AuthContext';
import useWebSocket from '../../hooks/useWebSocket';
import { Spinner } from 'react-bootstrap';

const ChatWindow = ({ chatRoom }) => {
    const { user } = useContext(AuthContext);
    const messagesEndRef = useRef(null);

    // Get new state and function from the hook
    const { messages, typingUsers, isConnecting, sendMessage, sendTypingNotification } = useWebSocket(chatRoom?.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (isConnecting) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" />
                <span className="ms-2">Loading messages...</span>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="message-list">
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} isMine={msg.author.username === user.username} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* Pass typingUsers down, but filter out the current user */}
            <TypingIndicator users={typingUsers.filter(u => u !== user.username)} />
            {/* Pass sendTypingNotification down to the input */}
            <MessageInput sendMessage={sendMessage} sendTypingNotification={sendTypingNotification} />
        </div>
    );
};

export default ChatWindow;