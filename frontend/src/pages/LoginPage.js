import React from 'react';
import Login from '../components/Auth/Login';

const LoginPage = () => {
    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Login />
        </div>
    );
};

export default LoginPage;