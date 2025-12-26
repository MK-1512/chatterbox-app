import { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import axiosInstance from '../api/axiosConfig';

const useWebSocket = (roomId) => {
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isConnecting, setIsConnecting] = useState(true);
    const socketRef = useRef(null);
    const { user, authTokens } = useContext(AuthContext);

    useEffect(() => {
        if (!roomId || !user || !authTokens) return;
        
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

        const apiUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
        const wsScheme = apiUrl.startsWith("https://") ? "wss" : "ws";
        const wsHost = apiUrl.split('//')[1];
        const wsURL = `${wsScheme}://${wsHost}/ws/chat/${roomId}/?token=${authTokens.access}`;
        
        socketRef.current = new WebSocket(wsURL);
        socketRef.current.onopen = () => console.log('WebSocket connected for room:', roomId);
        socketRef.current.onclose = () => console.log('WebSocket disconnected for room:', roomId);
        socketRef.current.onerror = (err) => console.error('WebSocket error:', err);

        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'chat_message') {
                setMessages(prev => [...prev, data.message]);
            } 
            else if (data.type === 'typing') {
                const typingUser = data.user;
                if (data.is_typing) {
                    setTypingUsers(prev => [...new Set([...prev, typingUser])]);
                } else {
                    setTypingUsers(prev => prev.filter(u => u !== typingUser));
                }
            }
            else if (data.type === 'message_read') {
                setMessages(prev => prev.map(msg => {
                    if (msg.id === data.message_id) {
                        const newReader = { username: data.read_by_user };
                        if (!msg.read_by.some(u => u.username === newReader.username)) {
                            return { ...msg, read_by: [...msg.read_by, newReader] };
                        }
                    }
                    return msg;
                }));
            }
        };

        return () => { if (socketRef.current) socketRef.current.close(); };
    }, [roomId, user, authTokens]);

    const sendMessage = (message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ 'type': 'chat_message', 'message': message }));
        }
    };
    const sendTypingNotification = (isTyping) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ 'type': 'typing', 'is_typing': isTyping }));
        }
    };
    
    const sendReadReceipt = (messageId) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                'type': 'read_receipt',
                'message_id': messageId,
            }));
        }
    };

    return { messages, typingUsers, isConnecting, sendMessage, sendTypingNotification, sendReadReceipt };
};

export default useWebSocket;