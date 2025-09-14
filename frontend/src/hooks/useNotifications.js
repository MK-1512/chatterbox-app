import { useState, useEffect, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const useNotifications = () => {
    const [unreadCounts, setUnreadCounts] = useState({});
    const { user, authTokens } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !authTokens) return;

        // --- THIS IS THE UPDATED LOGIC ---
        const apiUrl = process.env.REACT_APP_API_URL;
        const wsScheme = apiUrl.startsWith("https://") ? "wss" : "ws";
        const wsHost = apiUrl.split('//')[1];
        // It builds the final, correct WebSocket URL for notifications
        const wsURL = `${wsScheme}://${wsHost}/ws/notifications/?token=${authTokens.access}`;

        const socket = new WebSocket(wsURL);

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'notification' && data.message.type === 'new_message') {
                const roomId = data.message.room_id;
                setUnreadCounts(prev => ({
                    ...prev,
                    [roomId]: (prev[roomId] || 0) + 1,
                }));
            }
        };
        
        socket.onopen = () => console.log('Notification socket connected');
        socket.onclose = () => console.log('Notification socket closed');
        socket.onerror = (err) => console.error('Notification socket error:', err);

        return () => socket.close();
    }, [user, authTokens]);

    const clearUnreadCount = (roomId) => {
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            if (newCounts[roomId]) {
                delete newCounts[roomId];
            }
            return newCounts;
        });
    };

    return { unreadCounts, clearUnreadCount };
};

export default useNotifications;