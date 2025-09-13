import React from 'react';

const Message = ({ message, isMine }) => {
    return (
        <div className={`message ${isMine ? 'mine' : 'other'}`}>
             <div className="message-author">{isMine ? 'You' : message.author.username}</div>
            <div className="message-bubble">
                {message.content}
            </div>
        </div>
    );
};

export default Message;