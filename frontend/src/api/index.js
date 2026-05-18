import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Добавляем JWT-токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vellu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Обрабатываем 401 — разлогиниваем
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vellu_token');
      localStorage.removeItem('vellu_user');
      window.location.href = '/?login=1';
    }
    return Promise.reject(err);
  }
);

export default api;

// ---- API методы ----
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  update:   (data) => api.patch('/auth/me', data),
};

export const productsApi = {
  list:   (params) => api.get('/products', { params }),
  get:    (id)     => api.get(`/products/${id}`),
  create: (data)   => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  remove: (id)     => api.delete(`/products/${id}`),
};

export const uploadApi = {
  image: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const categoriesApi = {
  list:   ()          => api.get('/categories'),
  create: (data)      => api.post('/categories', data),
  update: (id, data)  => api.patch(`/categories/${id}`, data),
  remove: (id)        => api.delete(`/categories/${id}`),
};

export const imagesApi = {
  list: () => api.get('/images'),
};

export const cartApi = {
  get:    ()              => api.get('/cart'),
  add:    (data)          => api.post('/cart', data),
  update: (itemId, qty)   => api.patch(`/cart/${itemId}`, { qty }),
  remove: (itemId)        => api.delete(`/cart/${itemId}`),
  clear:  ()              => api.delete('/cart'),
};

export const ordersApi = {
  list:         ()         => api.get('/orders'),
  get:          (id)       => api.get(`/orders/${id}`),
  create:       (data)     => api.post('/orders', data),
  adminList:    (params)   => api.get('/orders/admin/all', { params }),
  updateStatus: (id, status) => api.patch(`/orders/admin/${id}/status`, { status }),
};

export const wishlistApi = {
  list:   ()   => api.get('/wishlist'),
  add:    (id) => api.post(`/wishlist/${id}`),
  remove: (id) => api.delete(`/wishlist/${id}`),
};

export const adminApi = {
  stats:          ()       => api.get('/admin/stats'),
  getSettings:    ()       => api.get('/admin/settings'),
  updateSettings: (data)   => api.patch('/admin/settings', data),
  getUsers:       ()       => api.get('/admin/users'),
};
