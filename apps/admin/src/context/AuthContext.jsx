// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'admin_token';

function getStoredAuth() {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (storedToken) {
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        return {
          token: storedToken,
          user: {
            id: payload.userId,
            username: payload.username,
            email: payload.email,
            role: payload.role,
          },
        };
      }
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Invalid token:', e);
      localStorage.removeItem(TOKEN_KEY);
    }
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(getStoredAuth);
  const loading = false;

  const saveAuth = (authToken, userData) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    setAuth({ token: authToken, user: userData });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuth({ token: null, user: null });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isDeveloper: user?.role === 'developer',
    isAdmin: user?.role === 'admin' || user?.role === 'developer',
    saveAuth,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
