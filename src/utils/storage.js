// Secure storage utilities for managing sensitive data

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  RESET_TOKEN: 'reset_token',
  RESET_DATA: 'reset_data',
};

// Encode data for storage
const encode = (data) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (error) {
    console.error('Error encoding data:', error);
    return null;
  }
};

// Decode data from storage
const decode = (data) => {
  try {
    return JSON.parse(decodeURIComponent(atob(data)));
  } catch (error) {
    console.error('Error decoding data:', error);
    return null;
  }
};

// Token management
export const TokenManager = {
  setToken: (token) => {
    if (token) {
      const encoded = btoa(token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, encoded);
      // Also set in session storage for extra security
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, encoded);
    }
  },

  getToken: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
                  sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      try {
        return atob(token);
      } catch {
        return null;
      }
    }
    return null;
  },

  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  hasToken: () => {
    return !!(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
             sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  }
};

// User data management
export const UserManager = {
  setUser: (userData) => {
    if (userData) {
      const encoded = encode(userData);
      if (encoded) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, encoded);
        sessionStorage.setItem(STORAGE_KEYS.USER_DATA, encoded);
      }
    }
  },

  getUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA) || 
                    sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? decode(userData) : null;
  },

  updateUser: (updates) => {
    const currentUser = UserManager.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      UserManager.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  },

  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  hasUser: () => {
    return !!(localStorage.getItem(STORAGE_KEYS.USER_DATA) || 
             sessionStorage.getItem(STORAGE_KEYS.USER_DATA));
  }
};

// Session management
export const SessionManager = {
  createSession: (token, user, rememberMe = false) => {
    TokenManager.setToken(token);
    UserManager.setUser(user);
    
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }
  },

  clearSession: () => {
    TokenManager.removeToken();
    UserManager.removeUser();
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    // Clear all session storage
    sessionStorage.clear();
  },

  isAuthenticated: () => {
    return TokenManager.hasToken() && UserManager.hasUser();
  },

  getSessionData: () => {
    return {
      token: TokenManager.getToken(),
      user: UserManager.getUser(),
      isAuthenticated: SessionManager.isAuthenticated()
    };
  },

  refreshSession: () => {
    const token = TokenManager.getToken();
    const user = UserManager.getUser();
    
    if (token && user) {
      // Re-save to refresh timestamps
      TokenManager.setToken(token);
      UserManager.setUser(user);
      return true;
    }
    return false;
  }
};

// Reset token management
export const ResetTokenManager = {
  setResetToken: (resetToken) => {
    if (resetToken) {
      const encoded = btoa(resetToken);
      sessionStorage.setItem(STORAGE_KEYS.RESET_TOKEN, encoded);
    }
  },

  getResetToken: () => {
    const token = sessionStorage.getItem(STORAGE_KEYS.RESET_TOKEN);
    if (token) {
      try {
        return atob(token);
      } catch {
        return null;
      }
    }
    return null;
  },

  removeResetToken: () => {
    sessionStorage.removeItem(STORAGE_KEYS.RESET_TOKEN);
  },

  hasResetToken: () => {
    return !!sessionStorage.getItem(STORAGE_KEYS.RESET_TOKEN);
  }
};

// Reset data management
export const ResetDataManager = {
  setResetData: (resetData) => {
    if (resetData) {
      const encoded = encode(resetData);
      if (encoded) {
        sessionStorage.setItem(STORAGE_KEYS.RESET_DATA, encoded);
      }
    }
  },

  getResetData: () => {
    const data = sessionStorage.getItem(STORAGE_KEYS.RESET_DATA);
    return data ? decode(data) : null;
  },

  removeResetData: () => {
    sessionStorage.removeItem(STORAGE_KEYS.RESET_DATA);
  },

  clearAllResetData: () => {
    ResetTokenManager.removeResetToken();
    ResetDataManager.removeResetData();
  }
};

// Export all managers
export default {
  TokenManager,
  UserManager,
  SessionManager,
  ResetTokenManager,
  ResetDataManager
};