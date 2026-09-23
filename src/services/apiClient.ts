import axios, { InternalAxiosRequestConfig } from 'axios';

let inMemoryToken: string | null = null;

export const setToken = (token: string) => {
  inMemoryToken = token;
};

export const clearToken = () => {
  inMemoryToken = null;
};

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
