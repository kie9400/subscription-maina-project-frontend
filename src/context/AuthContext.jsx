import React, { createContext, useState, useContext, useEffect } from 'react';
import { instance } from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkTokenAndSetAuth = (accessToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      const roles = decoded.roles || [];
      const isAdminRole = roles.includes('ADMIN');
      setIsAdmin(isAdminRole);
      return decoded;
    } catch (error) {
      console.error('토큰 디코딩 실패:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userDataString = localStorage.getItem('user');

        if (!refreshToken) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        if (accessToken) {
          const decoded = checkTokenAndSetAuth(accessToken);
          if (decoded && userDataString) {
            const userData = JSON.parse(userDataString);
            setUser(userData);
            setIsLoggedIn(true);
          }
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
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          checkTokenAndSetAuth(newAccessToken);
        }

      } catch (error) {
        console.error('Error checking login status:', error);
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
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      checkTokenAndSetAuth(accessToken);
    }
    setUser(userData);
    setIsLoggedIn(true);
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

// AuthContext를 편리하게 꺼내 쓰기 위한 도우미 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    //AuthProvider로 감싸지 않은 컴포넌트에서 쓰면 에러 발생
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 