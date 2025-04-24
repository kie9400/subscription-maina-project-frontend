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
      
      // JWT에서 memberId 추출하여 user 상태 업데이트
      setUser({
        memberId: decoded.memberId,
        roles: decoded.roles
      });
      
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

        if (!refreshToken) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        if (accessToken) {
          const decoded = checkTokenAndSetAuth(accessToken);
          if (decoded) {
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
      setIsLoggedIn(true);
    }
  };

  const logout = async () => {
    try {
      const response = await instance.post('/auth/logout');
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggingOut');
        instance.defaults.headers.common['Authorization'] = '';
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
      // 오류가 발생해도 로컬 상태는 초기화
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggingOut');
      instance.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      throw error;
    }
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