import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalSocketProvider } from './contexts/GlobalSocketContext';
import AppNavbar from './components/Layout/Navbar';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/Common/PrivateRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <GlobalSocketProvider>
                    <AppNavbar />
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                    </Routes>
                </GlobalSocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;