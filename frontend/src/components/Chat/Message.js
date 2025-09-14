import React, { useEffect, useRef, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';

const Message = ({ message, isMine, sendReadReceipt }) => {
    const { user } = useContext(AuthContext);
    const messageRef = useRef(null);

    useEffect(() => {
        const hasBeenReadByMe = message.read_by.some(u => u.username === user.username);
        
        // We only care about messages that are not ours and that we haven't read yet
        if (isMine || hasBeenReadByMe || !messageRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    sendReadReceipt(message.id);
                    observer.disconnect(); // Fire once and stop observing
                }
            },
            { threshold: 1.0 } // Trigger when 100% of the message is visible
        );

        observer.observe(messageRef.current);

        return () => observer.disconnect();
    }, [message.id, isMine, message.read_by, sendReadReceipt, user.username]);

    // Create the "Seen by" text, excluding the author and the current user
    const readByNames = message.read_by
        .filter(u => u.username !== message.author.username && u.username !== user.username)
        .map(u => u.username)
        .join(', ');

    return (
        <div className={`message ${isMine ? 'mine' : 'other'}`} ref={messageRef}>
            <div className="message-author">{isMine ? 'You' : message.author.username}</div>
            <div className="message-bubble">
                {message.content}
            </div>
            {/* Show "Seen" text only on your own messages, and if someone has read it */}
            {isMine && readByNames && (
                <div className="read-receipt" style={{ fontSize: '0.7rem', color: '#6c757d', marginRight: '5px', marginTop: '2px' }}>
                    <small>✓ Seen by {readByNames}</small>
                </div>
            )}
        </div>
    );
};

export default Message;