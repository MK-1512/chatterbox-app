import React from 'react';

const TypingIndicator = ({ users }) => {
    if (users.length === 0) {
        return <div className="typing-indicator"></div>;
    }

    let message = '';
    if (users.length === 1) {
        message = `${users[0]} is typing...`;
    } else if (users.length === 2) {
        message = `${users[0]} and ${users[1]} are typing...`;
    } else {
        message = 'Several people are typing...';
    }

    return (
        <div className="typing-indicator">
            <small><em>{message}</em></small>
        </div>
    );
};

export default TypingIndicator;