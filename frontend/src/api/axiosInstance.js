import axios from 'axios';

// Base URL comes from .env (VITE_API_URL). Auth token interceptors will be
// added in Phase 3 once login exists - for now this is just a plain client.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default axiosInstance;
