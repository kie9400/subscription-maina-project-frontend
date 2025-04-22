import axios from 'axios';

export const instance = axios.create({
    baseURL: "http://localhost:8080", 
    headers: { 'Content-Type': 'application/json' },
});
  
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
      const originalConfig = error.config; // 서버에게 보내려고 했던 요청
      const { logout } = useAuthStore.getState(); 
      if (error.response.status === 401) { // 토큰이 만료된 경우
        try {
          console.log("roatate token");
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("Refresh token not available.");
          }
          const res = await axios.create().post(
            "/auth/refresh",
            {},
            {
              baseURL: "http://localhost:8080",
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                "Content-type": "application/json",
              },
            }
          );
  
          const newAccessToken = res.data.accessToken.newAccessToken; // 새로운 토큰을 발급 받음.
          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            originalConfig.headers.Authorization = `Bearer ${newAccessToken}`; // 새로운 엑세스 토큰을 저장
            return axios(originalConfig); // 다시 재요청
          }
        } catch (refreshError) {
            // 리프레시 토큰이 없는 경우, 또는 만료된 경우 로그아웃
          console.error(refreshError); 
          localStorage.clear();
          logout();
          return Promise.reject(refreshError);
        }
      }
  
      localStorage.clear();
      return Promise.reject(error);
    }
  );