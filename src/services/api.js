import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clients API
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  create: (data) => api.post('/clients', data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getPayments: (projectId) => api.get(`/projects/${projectId}/payments`),
  getPaymentSummary: (projectId) => api.get(`/projects/${projectId}/payment-summary`),
  createPayment: (projectId, data) => api.post(`/projects/${projectId}/payments`, data),
  deletePayment: (projectId, paymentId) => api.delete(`/projects/${projectId}/payments/${paymentId}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  create: (data) => api.post('/inventory', data),
  updateQuantity: (id, quantityChange) => api.patch(`/inventory/${id}/quantity`, { quantityChange }),
  delete: (id) => api.delete(`/inventory/${id}`),
};

// Invoices API
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  create: (data) => api.post('/invoices', data),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  delete: (id) => api.delete(`/invoices/${id}`),
};

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Employees API
export const employeesAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Salaries API
export const salariesAPI = {
  getAll: (params) => api.get('/salaries', { params }),
  create: (data) => api.post('/salaries', data),
  preview: (data) => api.post('/salaries/preview', data),
  delete: (id) => api.delete(`/salaries/${id}`),
};

// Loans API
export const loansAPI = {
  getAll: (params) => api.get('/loans', { params }),
  create: (data) => api.post('/loans', data),
  addRepayment: (id, data) => api.post(`/loans/${id}/repayments`, data),
  delete: (id) => api.delete(`/loans/${id}`),
};

// Advances API
export const advancesAPI = {
  getAll: (params) => api.get('/advances', { params }),
  create: (data) => api.post('/advances', data),
  delete: (id) => api.delete(`/advances/${id}`),
};

// Leaves API
export const leavesAPI = {
  getAll: (params) => api.get('/leaves', { params }),
  create: (data) => api.post('/leaves', data),
  updateStatus: (id, status, approvedBy) => api.patch(`/leaves/${id}`, { status, approved_by: approvedBy }),
  delete: (id) => api.delete(`/leaves/${id}`),
};

export default api;

