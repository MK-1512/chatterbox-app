import React, { useState, useContext } from 'react';
import ChatWindow from '../components/Chat/ChatWindow';
import Sidebar from '../components/Layout/Sidebar';
import GlobalSocketContext from '../contexts/GlobalSocketContext';

const ChatPage = () => {
    const [activeChat, setActiveChat] = useState(null);
    const { clearUnreadCount } = useContext(GlobalSocketContext);

    const handleSetActiveChat = (room) => {
        setActiveChat(room);
        if (room) {
            clearUnreadCount(room.id);
        }
    };

    return (
        <div className="chat-page">
            {}
            {}
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