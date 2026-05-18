import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const cartOpen  = ref(false);
  const authOpen  = ref(false);
  const authMode  = ref('login'); // 'login' | 'register'
  const notif     = ref(null);
  let   notifTimer = null;

  function openCart()  { cartOpen.value = true; }
  function closeCart() { cartOpen.value = false; }
  function openAuth(mode = 'login')  { authMode.value = mode; authOpen.value = true; }
  function closeAuth() { authOpen.value = false; }

  function notify(message, type = 'default') {
    clearTimeout(notifTimer);
    notif.value = { message, type };
    notifTimer  = setTimeout(() => { notif.value = null; }, 3000);
  }

  return { cartOpen, authOpen, authMode, notif, openCart, closeCart, openAuth, closeAuth, notify };
});
