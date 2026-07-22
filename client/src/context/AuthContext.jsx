import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('agenda_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('agenda_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('agenda_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Erro ao restaurar sessão:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { user: userData, token } = res.data;
    localStorage.setItem('agenda_token', token);
    localStorage.setItem('agenda_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone, photo) => {
    const res = await API.post('/auth/register', { name, email, password, phone, photo });
    const { user: userData, token } = res.data;
    localStorage.setItem('agenda_token', token);
    localStorage.setItem('agenda_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const googleLogin = async (googleData) => {
    const res = await API.post('/auth/google', googleData);
    const { user: userData, token } = res.data;
    localStorage.setItem('agenda_token', token);
    localStorage.setItem('agenda_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('agenda_token');
    localStorage.removeItem('agenda_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await API.put('/auth/me', data);
    setUser(res.data);
    localStorage.setItem('agenda_user', JSON.stringify(res.data));
    return res.data;
  };

  const updateSettings = async (settingsData) => {
    const res = await API.put('/auth/settings', settingsData);
    setUser((prev) => ({ ...prev, settings: res.data }));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateProfile, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
