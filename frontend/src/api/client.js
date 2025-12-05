import axios from 'axios';

// In production (Docker), use relative URL so nginx proxy works
// In development, use localhost with port
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Proxied through nginx
  : process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export const articlesApi = {
  // Get all articles
  getAll: async () => {
    try {
      const response = await apiClient.get('/articles');
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Get single article
  getOne: async (identifier) => {
    try {
      const response = await apiClient.get(`/articles/${identifier}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  // Manually generate article (for testing)
  generate: async () => {
    try {
      const response = await apiClient.post('/articles/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating article:', error);
      throw error;
    }
  },
};

export default apiClient;