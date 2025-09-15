import React, { useState, useEffect, useContext } from 'react';
import { ListGroup, Badge, Spinner } from 'react-bootstrap';
import axiosInstance from '../../api/axiosConfig';
import AuthContext from '../../contexts/AuthContext';
import GlobalSocketContext from '../../contexts/GlobalSocketContext';

const Sidebar = ({ setActiveChat, activeChatId }) => {
    const [chatList, setChatList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Single loading state for all sidebar data
    const { user } = useContext(AuthContext);
    const { onlineUsers, unreadCounts } = useContext(GlobalSocketContext);

    useEffect(() => {
        const fetchSidebarData = async () => {
            setIsLoading(true); // Start loading when we begin fetching
            try {
                // We run all our initial API calls in parallel for better performance
                const [chatsResponse, usersResponse] = await Promise.all([
                    axiosInstance.get('/api/chatrooms/'),
                    axiosInstance.get('/api/users/')
                ]);

                const fetchedChats = chatsResponse.data;
                const generalRoom = fetchedChats.find(room => room.name === "General");

                // If the user isn't in the General room yet, join them and refetch the list
                if (!generalRoom) {
                    await axiosInstance.get('/api/chatrooms/get_or_create_general_room/');
                    const finalChatsResponse = await axiosInstance.get('/api/chatrooms/');
                    setChatList(finalChatsResponse.data);
                } else {
                    setChatList(fetchedChats);
                }
                
                setUserList(usersResponse.data);

            } catch (error) {
                console.error("Failed to fetch sidebar data", error);
            } finally {
                setIsLoading(false); // Finish loading, whether it succeeded or failed
            }
        };

        // This is the key: only run the fetch function if the user object is available
        if (user) {
            fetchSidebarData();
        }
    }, [user]);

    const handleStartPrivateChat = async (targetUserId) => {
        try {
            const response = await axiosInstance.post('/api/chatrooms/start_private_chat/', {
                target_user_id: targetUserId
            });
            const newChatRoom = response.data;
            
            // Refetch the chat list to include the new private chat
            const chatsResponse = await axiosInstance.get('/api/chatrooms/');
            setChatList(chatsResponse.data);

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

    return (
        <div className="sidebar">
            <h5 className="p-3">Chats</h5>
            {isLoading ? (
                <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>
            ) : (
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
            )}
            <hr/>
            <h5 className="p-3">Users</h5>
            {isLoading ? (
                <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>
            ) : (
                <ListGroup variant="flush">
                    {userList.map(u => (
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
                                }}
                            ></span>
                            {u.username}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default Sidebar;