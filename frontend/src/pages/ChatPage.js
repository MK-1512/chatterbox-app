import React, { useState, useContext } from 'react';
import ChatWindow from '../components/Chat/ChatWindow';
import Sidebar from '../components/Layout/Sidebar';
import GlobalSocketContext from '../contexts/GlobalSocketContext'; // Import our new global context

const ChatPage = () => {
    const [activeChat, setActiveChat] = useState(null);
    // Get the function we need from the new context
    const { clearUnreadCount } = useContext(GlobalSocketContext);

    const handleSetActiveChat = (room) => {
        setActiveChat(room);
        // When a chat is activated, clear its notifications
        if (room) {
            clearUnreadCount(room.id);
        }
    };

    return (
        <div className="chat-page">
            {/* Note: we no longer need to pass unreadCounts down as a prop */}
            {/* The Sidebar will get it directly from the context itself */}
            <Sidebar 
                setActiveChat={handleSetActiveChat} 
                activeChatId={activeChat?.id}
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