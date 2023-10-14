import React, { createContext, useState, useContext, useEffect } from 'react';
import { postRequest } from '../services/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const uuid = localStorage.getItem('loggedIn');
        const email = localStorage.getItem('email');

        if (uuid && email) {
            postRequest('isauth_react.php', { uuid, email })
                .then(data => {
                    setIsAuthenticated(data.success);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
