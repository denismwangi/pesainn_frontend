import { API_ENDPOINTS } from '../config/api';
import { SessionManager } from '../utils/storage';

class AuthService {
  async login(identifier, password, loginType = 'phone') {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN(loginType), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        // Store the token temporarily
        const token = data.data.token;
        
        // Fetch the user profile with the new token
        const profileResponse = await fetch(API_ENDPOINTS.USER_PROFILE, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          // If profile fetch fails, still use login data
          console.error('Failed to fetch profile:', profileData.message);
          SessionManager.createSession(
            token,
            data.data.user,
            true // remember me - can be made configurable
          );

          return {
            success: true,
            user: data.data.user,
            token: token,
            message: data.message
          };
        }

        // Use the profile data if successfully fetched (handle nested structure: data.data.user)
        const userData = profileData.success 
          ? (profileData.data?.user || profileData.user || profileData.data) 
          : data.data.user;
        
        // Check if user is admin
        if (userData && userData.role != 'Admin') {
          return {
            success: false,
            message: 'Login Failed.'
          };
        }
        
        // Store token and user profile data securely
        SessionManager.createSession(
          token,
          userData,
          true // remember me - can be made configurable
        );

        return {
          success: true,
          user: userData,
          token: token,
          message: data.message
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Failed to login. Please try again.'
      };
    }
  }

  async initiatePasswordReset(identifier, identifierType = 'email') {
    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD_INITIATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          identifierType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }

      if (data.success && data.data) {
        return {
          success: true,
          message: data.message || 'Reset code sent successfully',
          resetToken: data.data.resetToken,
          user: data.data.user
        };
      }

      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('Reset password initiate error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send reset code'
      };
    }
  }

  async verifyOTP(identifier, otp) {
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          otp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      return {
        success: true,
        message: data.message || 'OTP verified successfully',
        token: data.data?.token
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP'
      };
    }
  }

  async verifyResetOTP(otp, userId) {
    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD_VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp,
          userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      return {
        success: true,
        message: data.message || 'OTP verified successfully',
        token: data.data?.token
      };
    } catch (error) {
      console.error('Reset OTP verification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP'
      };
    }
  }

  async updatePassword(token, newPassword) {
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      return {
        success: true,
        message: data.message || 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update password'
      };
    }
  }

  async updateResetPassword(newPassword, userId) {
    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD_UPDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
          userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      return {
        success: true,
        message: data.message || 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update reset password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update password'
      };
    }
  }

  async logout() {
    try {
      const token = SessionManager.getSessionData().token;
      
      if (token) {
        // Call logout API endpoint with Bearer token
        const response = await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Logout API error:', data.message);
          // Even if API fails, clear local session
        }
      }
      
      // Always clear local session
      SessionManager.clearSession();
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, clear the local session
      SessionManager.clearSession();
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  getCurrentUser() {
    return SessionManager.getSessionData();
  }

  isAuthenticated() {
    return SessionManager.isAuthenticated();
  }
}

export default new AuthService();