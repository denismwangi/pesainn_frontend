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

      if (data.success && data.data) {
        // Update stored user data with fresh profile data
        UserManager.setUser(data.data);
        
        return {
          success: true,
          user: data.data,
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

      if (data.success && data.data) {
        // Update stored user data with updated profile
        UserManager.setUser(data.data);
        
        return {
          success: true,
          user: data.data,
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
}

export default new UserService();