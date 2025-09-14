import React, { useState, useEffect, useContext } from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import axiosInstance from '../../api/axiosConfig';
import AuthContext from '../../contexts/AuthContext';
import GlobalSocketContext from '../../contexts/GlobalSocketContext';

const Sidebar = ({ setActiveChat, activeChatId }) => {
    const [chatList, setChatList] = useState([]);
    const [userList, setUserList] = useState([]);
    const { user } = useContext(AuthContext);
    const { onlineUsers, unreadCounts } = useContext(GlobalSocketContext);

    const fetchUserChats = async () => {
        try {
            await axiosInstance.get('/api/chatrooms/get_or_create_general_room/');
            const chatsResponse = await axiosInstance.get('/api/chatrooms/');
            setChatList(chatsResponse.data);
        } catch (error) {
            console.error("Failed to fetch user's chats", error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersResponse = await axiosInstance.get('/api/users/');
                setUserList(usersResponse.data);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
        if (user) {
            fetchUserChats();
            fetchUsers();
        }
    }, [user]);

    const handleStartPrivateChat = async (targetUserId) => {
        try {
            const response = await axiosInstance.post('/api/chatrooms/start_private_chat/', {
                target_user_id: targetUserId
            });
            const newChatRoom = response.data;
            fetchUserChats();
            setActiveChat(newChatRoom);
        } catch (error) {
            console.error("Failed to start private chat", error);
        }
    };

    const getChatName = (room) => {
        if (room.room_type === 'private') {
            const otherParticipant = room.participants.find(p => p.username !== user.username);
            return otherParticipant ? otherParticipant.username : 'Private Chat';
        }
        return room.name;
    };

    // --- ADD FIRST DEBUGGING LOG HERE ---
    console.log("Current Online Users Set:", onlineUsers);

    return (
        <div className="sidebar">
            <h5 className="p-3">Chats</h5>
            <ListGroup variant="flush">
                {chatList.map(room => (
                    <ListGroup.Item 
                        key={room.id} 
                        action 
                        active={room.id === activeChatId}
                        onClick={() => setActiveChat(room)}
                        className="d-flex justify-content-between align-items-start"
                    >
                        {getChatName(room)}
                        {unreadCounts[room.id] > 0 && (
                            <Badge bg="primary" pill>
                                {unreadCounts[room.id]}
                            </Badge>
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <hr/>
            <h5 className="p-3">Users</h5>
            <ListGroup variant="flush">
                {userList.map(u => {
                    // --- ADD SECOND DEBUGGING LOG HERE ---
                    console.log(`Checking user: ${u.username}, ID: ${u.id}, Type: ${typeof u.id}. Is online?`, onlineUsers.has(u.id));

                    return (
                        <ListGroup.Item 
                            key={u.id}
                            action
                            onClick={() => handleStartPrivateChat(u.id)}
                            className="d-flex align-items-center"
                        >
                            <span 
                                className="rounded-circle me-2"
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: onlineUsers.has(u.id) ? '#28a745' : '#6c757d',
                                    transition: 'background-color 0.3s ease',
                                }}
                            ></span>
                            {u.username}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </div>
    );
};

export default Sidebar;