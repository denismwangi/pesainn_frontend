// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: (loginType) => `${API_URL}/api/v1/auth/login?loginType=${loginType}`,
  LOGOUT: `${API_URL}/api/v1/auth/logout`,
  REGISTER: `${API_URL}/api/v1/auth/register`,
  RESET_PASSWORD_INITIATE: `${API_URL}/api/v1/auth/password-reset/initiate`,
  VERIFY_OTP: `${API_URL}/api/v1/auth/verify-otp`,
  RESET_PASSWORD_VERIFY_OTP: `${API_URL}/api/v1/auth/password-reset/verify-otp`,
  UPDATE_PASSWORD: `${API_URL}/api/v1/auth/update-password`,
  RESET_PASSWORD_UPDATE: `${API_URL}/api/v1/auth/password-reset/update-password`,
  
  // Employee endpoints
  EMPLOYEES: `${API_URL}/api/employees`,
  EMPLOYEE_BY_ID: (id) => `${API_URL}/api/employees/${id}`,
  
  // Payroll endpoints
  PAYROLL: `${API_URL}/api/payroll`,
  PAYROLL_BY_ID: (id) => `${API_URL}/api/payroll/${id}`,
  RUN_PAYROLL: `${API_URL}/api/payroll/run`,
  BULK_CREDIT_SALARY: `${API_URL}/api/v1/wallet/admin/bulk-credit-employees-salary`,
  
  // Loan endpoints
  LOANS: `${API_URL}/api/loans`,
  LOANS_WITH_USER_INFO: `${API_URL}/api/v1/loans/with-user-info`,
  CREATE_LOAN: `${API_URL}/api/v1/loans`,
  LOAN_TYPES: `${API_URL}/api/v1/loan-types`,
  LOAN_BY_ID: (id) => `${API_URL}/api/v1/loans/${id}`,
  UPDATE_LOAN_STATUS: (id) => `${API_URL}/api/v1/loans/${id}/status`,
  RECEIVE_LOAN_PAYMENT: (id) => `${API_URL}/api/v1/loans/${id}/payments`,
  APPROVE_LOAN: (id) => `${API_URL}/api/loans/${id}/approve`,
  REJECT_LOAN: (id) => `${API_URL}/api/loans/${id}/reject`,
  
  // Transaction endpoints
  TRANSACTIONS: `${API_URL}/api/v1/transactions`,
  TRANSACTION_BY_ID: (id) => `${API_URL}/api/v1/transactions/${id}`,
  
  // User endpoints
  USER_PROFILE: `${API_URL}/api/v1/users/profile`,
  USERS: `${API_URL}/api/v1/users`,
  ADD_USER: `${API_URL}/api/v1/users/add-user`,
  EMPLOYEE_DETAILS: (id) => `${API_URL}/api/v1/users/employee/${id}`,
  EMPLOYEE_STATISTICS: `${API_URL}/api/v1/users/employee-statistics`,
  UPDATE_EMPLOYEE_SALARY: (id) => `${API_URL}/api/v1/users/${id}/salary`,
  APPROVE_USER: `${API_URL}/api/v1/business/users/approve`,
  REJECT_USER: `${API_URL}/api/v1/business/users/reject`,
  
  // Settings endpoints
  SETTINGS: `${API_URL}/api/settings`,
  UPDATE_PROFILE: `${API_URL}/api/settings/profile`,
  UPDATE_COMPANY: `${API_URL}/api/settings/company`,
  UPDATE_NOTIFICATIONS: `${API_URL}/api/settings/notifications`,
  UPDATE_PASSWORD: `${API_URL}/api/settings/password`,
  
  // Dashboard endpoints
  DASHBOARD_STATISTICS: `${API_URL}/api/v1/dashboard/statistics`,
  SALARY_STATISTICS: `${API_URL}/api/v1/dashboard/salary-statistics`,
  PAYROLL_HISTORY: `${API_URL}/api/v1/dashboard/payroll-history`,
  REVENUE_STATISTICS: `${API_URL}/api/v1/dashboard/revenue-statistics`,
  RECENT_TRANSACTIONS: `${API_URL}/api/v1/transactions`,
};

// API Headers
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// API Request helper
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: getHeaders(token),
  };
  
  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
};