import { api } from './api';

const AUTH_STORAGE_KEY = 'golf_tracker_user';

export const authService = {
  getUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get user from storage:', error);
      return null;
    }
  },

  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  },

  async signIn(username) {
    try {
      const response = await api.signIn(username);
      this.setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  },

  signOut() {
    this.setUser(null);
    window.location.reload();
  },

  isAuthenticated() {
    return this.getUser() !== null;
  }
};
