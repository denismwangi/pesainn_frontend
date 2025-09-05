import { API_ENDPOINTS } from '../config/api';
import { TokenManager, UserManager } from '../utils/storage';

class UserService {
  async getUserProfile() {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }

      if (data.success) {
        // Update stored user data with fresh profile data
        // Handle nested structure: data.data.user
        const userData = data.data?.user || data.user || data.data;
        UserManager.setUser(userData);
        
        return {
          success: true,
          user: userData,
          message: data.message || 'Profile fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user profile'
      };
    }
  }

  async updateUserProfile(profileData) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success) {
        // Update stored user data with updated profile
        const userData = data.user || data.data;
        UserManager.setUser(userData);
        
        return {
          success: true,
          user: userData,
          message: data.message || 'Profile updated successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  getCurrentUser() {
    return UserManager.getUser();
  }

  updateLocalUser(userData) {
    return UserManager.updateUser(userData);
  }

  async addUser(userData) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get businessId from current user if not provided
      const currentUser = UserManager.getUser();
      const businessId = userData.businessId || currentUser?.businessId || '689b4173e6b783b4d67a4f1e';

      const response = await fetch(API_ENDPOINTS.ADD_USER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userData,
          businessId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add user');
      }

      if (data.success) {
        return {
          success: true,
          user: data.data?.user || data.user,
          message: data.message || 'User added successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Add user error:', error);
      return {
        success: false,
        message: error.message || 'Failed to add user'
      };
    }
  }

  async getUsersList(page = 1, limit = 10) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.USERS}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      if (data.success && data.data) {
        return {
          success: true,
          users: data.data.users || [],
          pagination: data.data.pagination || {},
          stats: data.data.stats || {},
          message: data.message || 'Users fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get users list error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch users',
        users: [],
        pagination: {},
        stats: {}
      };
    }
  }

  async getEmployeeDetails(employeeId) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.EMPLOYEE_DETAILS(employeeId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch employee details');
      }

      if (data.success && data.data) {
        return {
          success: true,
          employee: data.data.employee,
          message: data.message || 'Employee details fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get employee details error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch employee details',
        employee: null
      };
    }
  }

  async updateEmployeeProfile(employeeId, profileData) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.USER_PROFILE}/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success) {
        return {
          success: true,
          message: data.message || 'Profile updated successfully',
          user: data.data?.user || data.user
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Update employee profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  async approveUser(userId, role = 'User', permissions = ['read_business', 'manage_inventory']) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get current user's businessId
      const currentUser = UserManager.getUser();
      const businessId = currentUser?.businessId || '689b4173e6b783b4d67a4f1e';

      const response = await fetch(API_ENDPOINTS.APPROVE_USER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          businessId,
          role,
          permissions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve user');
      }

      if (data.success) {
        return {
          success: true,
          message: data.message || 'User approved successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Approve user error:', error);
      return {
        success: false,
        message: error.message || 'Failed to approve user'
      };
    }
  }

  async rejectUser(userId, reason = 'Request rejected') {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.REJECT_USER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          reason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject user');
      }

      if (data.success) {
        return {
          success: true,
          message: data.message || 'User rejected successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Reject user error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reject user'
      };
    }
  }

  async getEmployeeStatistics(page = 1, limit = 10) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${API_ENDPOINTS.EMPLOYEE_STATISTICS}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch employee statistics');
      }

      if (data.success && data.data) {
        return {
          success: true,
          users: data.data.users || [],
          pagination: data.data.pagination || {},
          statistics: data.data.statistics || {},
          message: data.message || 'Employee statistics fetched successfully'
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Get employee statistics error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch employee statistics',
        users: [],
        pagination: {},
        statistics: {}
      };
    }
  }

  async updateEmployeeSalary(employeeId, salary) {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_EMPLOYEE_SALARY(employeeId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          salary
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update employee salary');
      }

      if (data.success) {
        return {
          success: true,
          message: data.message || 'Employee salary updated successfully',
          user: data.data?.user || data.user
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Update employee salary error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update employee salary'
      };
    }
  }
}

export default new UserService();