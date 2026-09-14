import axios from 'axios';
import { storage } from '../utils/storage';

// ─── Base URL ──────────────────────────────────────────────────
// Update this to your production server URL when deploying
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://bobby-server.onrender.com/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth interceptor — attach JWT ────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — handle 401 ───────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem('access_token');
      await storage.removeItem('refresh_token');
      // Navigation will be handled by the auth store
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:         (data: { email: string; password: string }) => apiClient.post('/auth/login', data),
  me:            () => apiClient.get('/auth/me'),
  forgotPassword:(data: { email: string }) => apiClient.post('/auth/forgot-password', data),
  logout:        () => apiClient.post('/auth/logout'),
};

// ─── Bookings ─────────────────────────────────────────────────
export const bookingsApi = {
  list:         (params?: object) => apiClient.get('/bookings', { params }),
  get:          (id: number | string) => apiClient.get(`/bookings/${id}`),
  updateStatus: (id: number | string, data: object) => apiClient.patch(`/bookings/${id}/status`, data),
  cancel:       (id: number | string, data: object) => apiClient.post(`/bookings/${id}/cancel`, data),
};

// ─── Payments ─────────────────────────────────────────────────
export const paymentsApi = {
  createOrder: (data: object) => apiClient.post('/payments/create-order', data),
  verify:      (data: object) => apiClient.post('/payments/verify', data),
  manual:      (data: object) => apiClient.post('/payments/manual', data),
  list:        (params?: object) => apiClient.get('/payments', { params }),
  summary:     () => apiClient.get('/payments/summary'),
};

// ─── Gallery ──────────────────────────────────────────────────
export const galleryApi = {
  list:          () => apiClient.get('/gallery'),
  getByBooking:  (bookingId: number | string) => apiClient.get(`/gallery/booking/${bookingId}`),
  upload:        (galleryId: number | string, formData: FormData) =>
    apiClient.post(`/gallery/${galleryId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  create:        (bookingId: number | string, data: object) =>
    apiClient.post(`/gallery/booking/${bookingId}`, data),
};

// ─── Rewards ──────────────────────────────────────────────────
export const rewardsApi = {
  get: () => apiClient.get('/rewards'),
};

// ─── Customers (CRM) ──────────────────────────────────────────
export const customersApi = {
  list: (params?: object) => apiClient.get('/customers', { params }),
  get:  (id: number | string) => apiClient.get(`/customers/${id}`),
};

// ─── Reports ──────────────────────────────────────────────────
export const reportsApi = {
  dashboard: () => apiClient.get('/reports/dashboard'),
  revenue:   (params?: object) => apiClient.get('/reports/revenue', { params }),
};

// ─── Users ────────────────────────────────────────────────────
export const usersApi = {
  updateProfile: (formData: FormData) =>
    apiClient.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (data: object) => apiClient.put('/users/change-password', data),
};

// ─── Notifications ────────────────────────────────────────────
export const notificationsApi = {
  list:    () => apiClient.get('/admin/notifications'),
  markRead:() => apiClient.patch('/admin/notifications/read'),
};
