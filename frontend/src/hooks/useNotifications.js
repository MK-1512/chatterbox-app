import { useState, useEffect, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const useNotifications = () => {
    const [unreadCounts, setUnreadCounts] = useState({});
    const { user, authTokens } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !authTokens) return;

        const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
        const wsURL = `${wsScheme}://${window.location.host.replace('3000', '8000')}/ws/notifications/?token=${authTokens.access}`;

        const socket = new WebSocket(wsURL);

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'notification' && data.message.type === 'new_message') {
                const roomId = data.message.room_id;
                // Increment the unread count for the specific room
                setUnreadCounts(prev => ({
                    ...prev,
                    [roomId]: (prev[roomId] || 0) + 1,
                }));
            }
        };
        
        socket.onclose = () => console.log('Notification socket closed');
        socket.onerror = (err) => console.error('Notification socket error:', err);

        return () => socket.close();
    }, [user, authTokens]);

    // Function to be called when a user clicks on a chat
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