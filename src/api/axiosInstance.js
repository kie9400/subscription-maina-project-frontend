import axios from 'axios';

export const instance = axios.create({
    baseURL: "http://localhost:8080", 
    headers: { 'Content-Type': 'application/json' },
});
  
// Request 인터셉터
instance.interceptors.request.use(
    async (config) => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);
  
axios.interceptors.response.use(
    (response) => { // 정상 응답
      return response;
    },
  
    async (error) => {
      const originalConfig = error.config;

      // 401 에러가 아니거나 이미 재시도한 요청인 경우
      if (error.response?.status !== 401 || originalConfig._retry) {
        return Promise.reject(error);
      }

      originalConfig._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token not found");
        }

        const response = await axios.post(
          `${instance.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = response.headers.get("Authorization");
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalConfig);
        }
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // 로그인 페이지로 리다이렉트
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }

      return Promise.reject(error);
    }
);