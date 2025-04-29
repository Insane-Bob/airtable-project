// src/stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  actions: {
    setUser(user) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user)); 
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user'); 
    },
  },
  getters: {
    getAuthStatus: (state) => !!state.user,
    isAdmin: (state) => state.user && state.user.roles === 'Admin',
    isStudent (state) {
      return state.user && (state.user.roles === 'Student' || state.user.roles === 'Admin');
    }
  }
});
