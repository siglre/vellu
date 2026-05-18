import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api';

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('vellu_user') || 'null'));
  const token = ref(localStorage.getItem('vellu_token') || null);

  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const isAdmin    = computed(() => user.value?.role === 'admin');

  function persist(u, t) {
    user.value  = u;
    token.value = t;
    localStorage.setItem('vellu_user',  JSON.stringify(u));
    localStorage.setItem('vellu_token', t);
  }

  async function login(email, password) {
    const { data } = await authApi.login({ email, password });
    persist(data.user, data.token);
    return data.user;
  }

  async function register(name, email, password) {
    const { data } = await authApi.register({ name, email, password });
    persist(data.user, data.token);
    return data.user;
  }

  function logout() {
    user.value  = null;
    token.value = null;
    localStorage.removeItem('vellu_user');
    localStorage.removeItem('vellu_token');
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const { data } = await authApi.me();
      user.value = data;
      localStorage.setItem('vellu_user', JSON.stringify(data));
    } catch {
      logout();
    }
  }

  return { user, token, isLoggedIn, isAdmin, login, register, logout, fetchMe };
});
