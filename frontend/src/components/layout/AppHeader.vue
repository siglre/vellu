<template>
  <div>
    <!-- Строка акций -->
    <div class="announce">БЕСПЛАТНАЯ ДОСТАВКА ОТ ₽5 000 · БАРХАТНАЯ НЕЖНОСТЬ В КАЖДОЙ ИГРУШКЕ</div>

    <header>
      <div class="header-inner container">
        <!-- Бургер -->
        <button class="icon-btn hamburger" @click="mobileOpen = !mobileOpen">
          <IconMenu />
        </button>

        <!-- Логотип -->
        <RouterLink to="/" class="logo">
          <div class="logo-text serif">vellu</div>
          <div class="logo-sub">Москва · с любовью</div>
        </RouterLink>

        <!-- Действия -->
        <div class="header-actions">
          <button class="icon-btn desktop-only" @click="ui.openAuth()">
            <IconSearch />
          </button>

          <!-- Аватар / иконка пользователя -->
          <div class="user-wrap desktop-only" ref="userWrapRef">
            <button class="icon-btn" @click="auth.isLoggedIn ? userMenuOpen = !userMenuOpen : ui.openAuth('login')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            <Transition name="fade">
              <div v-if="userMenuOpen" class="user-menu">
                <RouterLink to="/account" class="menu-item" @click="userMenuOpen=false">👤 Профиль</RouterLink>
                <RouterLink to="/orders"  class="menu-item" @click="userMenuOpen=false">📦 Мои заказы</RouterLink>
                <RouterLink to="/wishlist" class="menu-item" @click="userMenuOpen=false">❤️ Избранное</RouterLink>
                <template v-if="auth.isAdmin">
                  <div class="menu-divider"/>
                  <RouterLink to="/admin" class="menu-item" @click="userMenuOpen=false">⚙️ Панель управления</RouterLink>
                </template>
                <div class="menu-divider"/>
                <button class="menu-item" @click="handleLogout">Выйти</button>
              </div>
            </Transition>
          </div>

          <!-- Избранное -->
          <RouterLink to="/wishlist" class="icon-btn desktop-only wish-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span v-if="wishlist.count > 0" class="cart-badge">{{ wishlist.count }}</span>
          </RouterLink>

          <!-- Корзина -->
          <button class="icon-btn cart-btn" @click="ui.openCart()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span v-if="cart.count > 0" class="cart-badge">{{ cart.count }}</span>
          </button>
        </div>
      </div>

      <!-- Навигация -->
      <nav class="main-nav">
        <ul class="nav-list container">
          <li v-for="link in navLinks" :key="link.label">
            <RouterLink :to="link.to" :class="['nav-link', { 'nav-sale': link.sale }]">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- Мобильное меню -->
      <Transition name="fade">
        <div v-if="mobileOpen" class="mobile-nav">
          <RouterLink v-for="link in navLinks" :key="link.label" :to="link.to"
            class="mobile-link" @click="mobileOpen=false">
            {{ link.label }}
          </RouterLink>
          <div class="mobile-divider"/>
          <template v-if="!auth.isLoggedIn">
            <button class="mobile-link" @click="mobileOpen=false; ui.openAuth('login')">👤 Войти</button>
            <button class="mobile-link" @click="mobileOpen=false; ui.openAuth('register')">✨ Регистрация</button>
          </template>
          <template v-else>
            <RouterLink to="/account" class="mobile-link" @click="mobileOpen=false">👤 Профиль ({{ auth.user?.name }})</RouterLink>
            <RouterLink to="/orders"  class="mobile-link" @click="mobileOpen=false">📦 Мои заказы</RouterLink>
            <RouterLink v-if="auth.isAdmin" to="/admin" class="mobile-link" @click="mobileOpen=false">⚙️ Панель управления</RouterLink>
            <button class="mobile-link mobile-logout" @click="handleLogout(); mobileOpen=false">Выйти</button>
          </template>
        </div>
      </Transition>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useUiStore   } from '@/stores/ui';

// Inline icon components (минимальные SVG)
const IconMenu   = { template: `<svg width="22" height="16" viewBox="0 0 22 16" fill="none"><rect width="22" height="2" rx="1" fill="currentColor"/><rect y="7" width="22" height="2" rx="1" fill="currentColor"/><rect y="14" width="22" height="2" rx="1" fill="currentColor"/></svg>` };
const IconSearch = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>` };
const IconUser   = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` };
const IconHeart  = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>` };
const IconCart   = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>` };

import { useWishlistStore } from '@/stores/wishlist';
const auth     = useAuthStore();
const cart     = useCartStore();
const ui       = useUiStore();
const wishlist = useWishlistStore();

const mobileOpen   = ref(false);
const userMenuOpen = ref(false);
const userWrapRef  = ref(null);

onClickOutside(userWrapRef, () => { userMenuOpen.value = false; });
onMounted(() => wishlist.fetch());

const navLinks = [
  { label: 'НОВИНКИ',  to: '/catalog?tag=Новый' },
  { label: 'ЗАЙЦЫ',    to: '/catalog?category=Зайцы' },
  { label: 'ЗАБАВНЫЕ', to: '/catalog?category=Забавные' },
  { label: 'ОКЕАН',    to: '/catalog?category=Океан' },
  { label: 'ДИКИЕ',    to: '/catalog?category=Дикие' },
  { label: 'ФЕРМА',    to: '/catalog?category=Ферма' },
];

function handleLogout() {
  auth.logout();
  cart.clear();
  userMenuOpen.value = false;
  ui.notify('Вы вышли из аккаунта');
}

</script>

<style scoped>
.announce { background:var(--mid); color:white; text-align:center; font-size:11px; letter-spacing:.15em; padding:8px; text-transform:uppercase; }
header { background:white; border-bottom:1px solid var(--brown); position:sticky; top:0; z-index:100; }
.header-inner { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; }
.logo { text-align:center; }
.logo-text { font-size:28px; letter-spacing:.25em; line-height:1; font-style:italic; }
.logo-sub  { font-size:9px; letter-spacing:.4em; color:var(--grey); text-transform:uppercase; margin-top:2px; }
.header-actions { display:flex; align-items:center; gap:20px; }
.icon-btn { color:var(--mid); transition:color .2s; display:flex; align-items:center; }
.icon-btn:hover { color:var(--grey); }
.cart-btn, .wish-wrap { position:relative; }
.cart-badge { position:absolute; top:-8px; right:-8px; background:var(--accent); color:white; font-size:10px; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:500; }
.avatar-btn { width:36px; height:36px; background:var(--accent); color:white; border-radius:50%; font-size:14px; font-weight:500; display:flex; align-items:center; justify-content:center; }
.user-wrap { position:relative; }
.user-menu { position:absolute; top:calc(100% + 8px); right:0; background:white; border:1px solid var(--beige); border-radius:8px; padding:8px 0; min-width:200px; box-shadow:0 8px 24px rgba(0,0,0,.12); z-index:50; }
.menu-item { display:block; width:100%; padding:10px 16px; font-size:13px; text-align:left; transition:background .2s; }
.menu-item:hover { background:var(--cream); }
.menu-divider { height:1px; background:var(--beige); margin:4px 0; }
nav.main-nav { border-top:1px solid var(--beige); }
.nav-list { display:flex; justify-content:center; gap:32px; padding:12px 0; }
.nav-link { font-size:12px; letter-spacing:.1em; text-transform:uppercase; transition:color .2s; }
.nav-link:hover, .router-link-active { color:var(--accent); }
.nav-sale { color:var(--accent); font-weight:500; }
.mobile-nav { background:white; border-top:1px solid var(--beige); }
.mobile-link { display:block; padding:12px 24px; font-size:14px; border-bottom:1px solid var(--beige); }
.mobile-link:hover { background:var(--cream); }
.mobile-divider { height:1px; background:var(--beige); margin:4px 0; }
.mobile-logout { color:var(--grey); width:100%; text-align:left; }
.hamburger, .desktop-only { display:none; }
@media(max-width:1024px) { .hamburger { display:flex; } nav.main-nav { display:none; } .desktop-only { display:none !important; } }
@media(min-width:1025px) { .hamburger { display:none; } .desktop-only { display:flex; } .mobile-nav { display:none !important; } }
</style>
