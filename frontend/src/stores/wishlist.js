import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { wishlistApi } from '@/api';
import { useAuthStore } from './auth';

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([]);
  const loading = ref(false);

  const ids = computed(() => new Set(items.value.map(i => i.id)));
  const count = computed(() => items.value.length);
  const has = (productId) => ids.value.has(productId);

  async function fetch() {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) return;
    loading.value = true;
    try {
      const { data } = await wishlistApi.list();
      items.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function toggle(productId) {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) return false;
    if (has(productId)) {
      await wishlistApi.remove(productId);
      items.value = items.value.filter(i => i.id !== productId);
    } else {
      await wishlistApi.add(productId);
      await fetch();
    }
    return true;
  }

  function clear() { items.value = []; }

  return { items, loading, count, has, fetch, toggle, clear };
});
