import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cartApi } from '@/api';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', () => {
  const items  = ref([]);
  const total  = ref(0);
  const cartId = ref(null);
  const loading = ref(false);

  const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0));

  function setCart(data) {
    items.value  = data.items  || [];
    total.value  = data.total  || 0;
    cartId.value = data.cartId || null;
  }

  async function fetch() {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) return;
    loading.value = true;
    try {
      const { data } = await cartApi.get();
      setCart(data);
    } finally {
      loading.value = false;
    }
  }

  async function addItem(productId, size = '') {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) return false; // сигнал показать модалку логина
    loading.value = true;
    try {
      const { data } = await cartApi.add({ product_id: productId, size, qty: 1 });
      setCart(data);
      return true;
    } finally {
      loading.value = false;
    }
  }

  async function updateQty(itemId, qty) {
    const { data } = await cartApi.update(itemId, qty);
    setCart(data);
  }

  async function removeItem(itemId) {
    const { data } = await cartApi.remove(itemId);
    setCart(data);
  }

  async function clear() {
    const { data } = await cartApi.clear();
    setCart(data);
  }

  return { items, total, cartId, count, loading, fetch, addItem, updateQty, removeItem, clear };
});
