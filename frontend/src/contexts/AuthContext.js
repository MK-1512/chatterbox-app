import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(() =>
        localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null
    );
    // This new state will solve our race condition
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';


    const loginUser = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/users/token/`, {
                username,
                password,
            });
            const data = response.data;
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/');
        } catch (error) {
            alert('Login failed. Please check your username and password.');
        }
    };

    const registerUser = async (username, password) => {
         try {
            await axios.post(`${API_URL}/api/users/register/`, {
                username,
                password,
            });
            await loginUser(username, password);
        } catch (error) {
            alert('Registration failed. The username may already be taken.');
        }
    }

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        registerUser,
    };

    useEffect(() => {
        // This effect runs once on startup to finish the loading process
        if (loading) {
            setLoading(false);
        }
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {/* We will not render the rest of the app until the auth check is complete */}
            {loading ? null : children}
        </AuthContext.Provider>
    );
};