import { API_ENDPOINTS } from '../config/api';
import { TokenManager } from '../utils/storage';

class LoanService {
  async getLoansWithUserInfo(page = 1, limit = 10) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${API_ENDPOINTS.LOANS_WITH_USER_INFO}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch loan statistics');
      }

      if (data.success && data.data) {
        return {
          success: true,
          loans: data.data.loans || [],
          statistics: data.data.statistics || {},
          pagination: data.data.pagination || {},
          message: data.message || 'Loan statistics fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get loan statistics error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch loan statistics',
        loans: [],
        statistics: {},
        pagination: {}
      };
    }
  }

  async getLoanTypes(search = '') {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      if (search) {
        queryParams.append('search', search);
      }

      const response = await fetch(`${API_ENDPOINTS.LOAN_TYPES}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch loan types');
      }

      if (data.success) {
        return {
          success: true,
          loanTypes: data.data?.items || [],
          message: data.message || 'Loan types fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get loan types error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch loan types',
        loanTypes: []
      };
    }
  }

  async createLoan(loanData) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.CREATE_LOAN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(loanData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create loan');
      }

      if (data.success) {
        return {
          success: true,
          loan: data.data || data.loan,
          message: data.message || 'Loan created successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Create loan error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create loan'
      };
    }
  }

  async updateLoanStatus(loanId, status) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.UPDATE_LOAN_STATUS(loanId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update loan status');
      }

      if (data.success) {
        return {
          success: true,
          loan: data.data || data.loan,
          message: data.message || 'Loan status updated successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Update loan status error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update loan status'
      };
    }
  }

  async getLoanById(loanId) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.LOAN_BY_ID(loanId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch loan details');
      }

      if (data.success) {
        return {
          success: true,
          loan: data.data,
          message: data.message || 'Loan details fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get loan by id error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch loan details'
      };
    }
  }

  async receivePayment(loanId, amount) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.RECEIVE_LOAN_PAYMENT(loanId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process payment');
      }

      if (data.success) {
        return {
          success: true,
          payment: data.data,
          message: data.message || 'Payment processed successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Receive payment error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process payment'
      };
    }
  }
}

export default new LoanService();