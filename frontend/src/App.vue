<template>
  <div>
    <AppHeader />
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <AppFooter />

    <!-- Глобальные оверлеи -->
    <CartDrawer />
    <AuthModal />
    <AppNotification />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';

import AppHeader      from '@/components/layout/AppHeader.vue';
import AppFooter      from '@/components/layout/AppFooter.vue';
import CartDrawer     from '@/components/cart/CartDrawer.vue';
import AuthModal      from '@/components/auth/AuthModal.vue';
import AppNotification from '@/components/ui/AppNotification.vue';

const auth  = useAuthStore();
const cart  = useCartStore();
const ui    = useUiStore();
const route = useRoute();

onMounted(async () => {
  await auth.fetchMe();
  if (auth.isLoggedIn) await cart.fetch();
  // Открыть модалку логина если пришли с ?login=1
  if (route.query.login === '1') ui.openAuth('login');
});
</script>
