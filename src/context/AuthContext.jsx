import React, { createContext, useState, useContext, useEffect } from 'react';
import { instance } from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 먼저 localStorage에서 토큰들과 사용자 정보 확인
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userDataString = localStorage.getItem('user');

        if (!refreshToken) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        // 저장된 사용자 정보가 있으면 먼저 설정
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setIsLoggedIn(true);
          setIsAdmin(userData.role === 'ADMIN');
        }

        // access token이 있으면 Authorization 헤더 설정
        if (accessToken) {
          instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }

        // refresh token으로 새로운 access token 발급 시도
        const response = await instance.post('/auth/token/refresh', null, {
          headers: { 
            Refresh: refreshToken,
            Authorization: accessToken ? `Bearer ${accessToken}` : ''
          },
        });

        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          instance.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        }

      } catch (error) {
        console.error('Error checking login status:', error);
        // 토큰 갱신 실패 시 모든 인증 정보 삭제
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.role === 'ADMIN');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    instance.defaults.headers.common['Authorization'] = '';
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        isAdmin,
        user,
        setUser,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 