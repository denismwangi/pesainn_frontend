import { API_ENDPOINTS } from '../config/api';
import { TokenManager } from '../utils/storage';

class TransactionService {
  async getTransactions(page = 1, limit = 10, filters = {}) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transactions');
      }

      if (data.success && data.data) {
        return {
          success: true,
          transactions: data.data.transactions || [],
          pagination: data.data.pagination || {},
          filters: data.data.filters || {},
          message: data.message || 'Transactions fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get transactions error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch transactions',
        transactions: [],
        pagination: {},
        filters: {}
      };
    }
  }

  async getTransactionById(id) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.TRANSACTION_BY_ID(id), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transaction details');
      }

      if (data.success && data.data) {
        return {
          success: true,
          transaction: data.data.transaction,
          message: data.message || 'Transaction fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get transaction details error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch transaction details',
        transaction: null
      };
    }
  }
}

export default new TransactionService();