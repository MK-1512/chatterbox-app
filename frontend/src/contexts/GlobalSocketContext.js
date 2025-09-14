import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';
import axiosInstance from '../api/axiosConfig';

const GlobalSocketContext = createContext();
export default GlobalSocketContext;

export const GlobalSocketProvider = ({ children }) => {
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [unreadCounts, setUnreadCounts] = useState({});
    const { user, authTokens } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !authTokens) return;

        // Fetch initial online users list
        const fetchOnlineUsers = async () => {
            try {
                const response = await axiosInstance.get('/api/users/online/');
                const onlineUserIds = response.data.map(u => u.id);
                setOnlineUsers(new Set(onlineUserIds));
            } catch (error) {
                console.error("Failed to fetch online users", error);
            }
        };
        fetchOnlineUsers();

        const apiUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
        const wsScheme = apiUrl.startsWith("https://") ? "wss" : "ws";
        const wsHost = apiUrl.split('//')[1];
        const wsURL = `${wsScheme}://${wsHost}/ws/notifications/?token=${authTokens.access}`;
        
        const socket = new WebSocket(wsURL);

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);

            // Handle User Status messages (for green dots)
            if (data.type === 'user_status') {
                const userId = data.user_id;
                const status = data.status;
                setOnlineUsers(prev => {
                    const newOnlineUsers = new Set(prev);
                    if (status === 'online') {
                        newOnlineUsers.add(userId);
                    } else {
                        newOnlineUsers.delete(userId);
                    }
                    return newOnlineUsers;
                });
            }
            // Handle Notification messages (for unread counts)
            if (data.type === 'notification' && data.message.type === 'new_message') {
                const roomId = data.message.room_id;
                setUnreadCounts(prev => ({ ...prev, [roomId]: (prev[roomId] || 0) + 1 }));
            }
        };
        
        socket.onclose = () => console.log('Global socket closed');
        socket.onerror = (err) => console.error('Global socket error:', err);

        return () => socket.close();
    }, [user, authTokens]);

    const clearUnreadCount = (roomId) => {
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            if (newCounts[roomId]) delete newCounts[roomId];
            return newCounts;
        });
    };

    const contextData = { onlineUsers, unreadCounts, clearUnreadCount };

    return (
        <GlobalSocketContext.Provider value={contextData}>
            {children}
        </GlobalSocketContext.Provider>
    );
};