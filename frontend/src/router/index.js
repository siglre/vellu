import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/',          name: 'Home',     component: () => import('@/views/HomeView.vue') },
  { path: '/catalog',   name: 'Catalog',  component: () => import('@/views/CatalogView.vue') },
  { path: '/product/:id', name: 'Product', component: () => import('@/views/ProductView.vue') },
  { path: '/cart',      name: 'Cart',     component: () => import('@/views/CartView.vue'),    meta: { requiresAuth: true } },
  { path: '/account',   name: 'Account',  component: () => import('@/views/AccountView.vue'), meta: { requiresAuth: true } },
  { path: '/orders',    name: 'Orders',   component: () => import('@/views/OrdersView.vue'),  meta: { requiresAuth: true } },
  { path: '/wishlist',  name: 'Wishlist', component: () => import('@/views/WishlistView.vue'), meta: { requiresAuth: true } },
  { path: '/admin',     name: 'Admin',    component: () => import('@/views/AdminView.vue'),   meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFoundView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Home', query: { login: '1' } };
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'Home' };
  }
});

export default router;
