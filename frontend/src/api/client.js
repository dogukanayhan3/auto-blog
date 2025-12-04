import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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