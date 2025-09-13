import { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import axiosInstance from '../api/axiosConfig';

const useWebSocket = (roomId) => {
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]); // <-- NEW STATE
    const [isConnecting, setIsConnecting] = useState(true);
    const socketRef = useRef(null);
    const { user, authTokens } = useContext(AuthContext);

    useEffect(() => {
        if (!roomId || !user || !authTokens) {
            return;
        }

        const fetchMessages = async () => {
            try {
                const response = await axiosInstance.get(`/api/chatrooms/${roomId}/messages/`);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to fetch initial messages:", error);
            } finally {
                setIsConnecting(false);
            }
        };
        fetchMessages();

        const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
        const wsURL = `${wsScheme}://${window.location.host.replace('3000', '8000')}/ws/chat/${roomId}/?token=${authTokens.access}`;
        
        socketRef.current = new WebSocket(wsURL);
        socketRef.current.onopen = () => console.log('WebSocket connected');
        socketRef.current.onclose = () => console.log('WebSocket disconnected');
        socketRef.current.onerror = (err) => console.error('WebSocket error:', err);

        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'chat_message') {
                setMessages(prev => [...prev, data.message]);
            } 
            // --- NEW: HANDLE INCOMING TYPING EVENT ---
            else if (data.type === 'typing') {
                const typingUser = data.user;
                if (data.is_typing) {
                    setTypingUsers(prev => [...new Set([...prev, typingUser])]);
                } else {
                    setTypingUsers(prev => prev.filter(u => u !== typingUser));
                }
            }
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [roomId, user, authTokens]);

    const sendMessage = (message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                'type': 'chat_message',
                'message': message,
            }));
        } else {
            console.error('WebSocket is not connected.');
        }
    };

    // --- NEW: FUNCTION TO SEND TYPING NOTIFICATION ---
    const sendTypingNotification = (isTyping) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                'type': 'typing',
                'is_typing': isTyping,
            }));
        }
    };

    return { messages, typingUsers, isConnecting, sendMessage, sendTypingNotification };
};

export default useWebSocket;