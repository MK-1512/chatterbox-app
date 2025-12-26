import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
});

axiosInstance.interceptors.request.use(async req => {
    const authTokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;

    if (!authTokens) {
        return req;
    }
    
    req.headers.Authorization = `Bearer ${authTokens.access}`;
    return req;
});

export default axiosInstance;