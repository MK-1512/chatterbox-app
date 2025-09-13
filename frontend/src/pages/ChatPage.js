import React, { useState } from 'react';
import ChatWindow from '../components/Chat/ChatWindow';
import Sidebar from '../components/Layout/Sidebar';
import useNotifications from '../hooks/useNotifications';

const ChatPage = () => {
    const [activeChat, setActiveChat] = useState(null);
    const { unreadCounts, clearUnreadCount } = useNotifications();

    const handleSetActiveChat = (room) => {
        setActiveChat(room);
        // When a chat is activated, clear its notifications
        if (room) {
            clearUnreadCount(room.id);
        }
    };

    return (
        <div className="chat-page">
            <Sidebar 
                setActiveChat={handleSetActiveChat} 
                activeChatId={activeChat?.id}
                unreadCounts={unreadCounts}
            />
            <div className="chat-window-container">
                {activeChat ? (
                    <ChatWindow chatRoom={activeChat} key={activeChat.id} />
                ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <h4 className="text-muted">Select a chat to start messaging</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;