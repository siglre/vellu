<template>
  <main class="container" style="padding:48px 24px">
    <h1 class="serif" style="font-size:32px;margin-bottom:32px">Профиль</h1>
    <div class="account-grid">
      <div class="form-card">
        <h2 style="font-size:18px;margin-bottom:24px">Личные данные</h2>
        <div class="form-group"><label class="form-label">Имя</label><input v-model="form.name" class="form-input"/></div>
        <div class="form-group"><label class="form-label">Email</label><input v-model="form.email" type="email" class="form-input"/></div>
        <button class="btn btn-dark" @click="save">Сохранить</button>
        <p v-if="saved" style="color:var(--green);margin-top:12px;font-size:14px">✓ Сохранено</p>
      </div>
      <div class="links-card">
        <RouterLink to="/orders" class="link-item">📦 Мои заказы</RouterLink>
        <a href="#" class="link-item" @click.prevent="ui.notify('Избранное скоро!')">❤️ Избранное</a>
        <button class="link-item" style="color:var(--accent)" @click="logout">Выйти из аккаунта</button>
      </div>
    </div>
  </main>
</template>
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUiStore }   from '@/stores/ui';
import { authApi } from '@/api';
import { useRouter } from 'vue-router';
const auth   = useAuthStore();
const ui     = useUiStore();
const router = useRouter();
const form   = ref({ name: auth.user?.name || '', email: auth.user?.email || '' });
const saved  = ref(false);
async function save() {
  await authApi.update(form.value);
  saved.value = true;
  setTimeout(() => saved.value = false, 2000);
}
function logout() { auth.logout(); router.push('/'); ui.notify('Вы вышли из аккаунта'); }
</script>
<style scoped>
.account-grid { display:grid; grid-template-columns:1fr 280px; gap:32px; }
@media(max-width:768px) { .account-grid { grid-template-columns:1fr; } }
.form-card { background:white; border-radius:16px; padding:32px; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.links-card { background:white; border-radius:16px; padding:24px; box-shadow:0 1px 4px rgba(0,0,0,.06); display:flex; flex-direction:column; gap:4px; height:fit-content; }
.link-item { display:block; padding:12px 16px; font-size:14px; border-radius:8px; transition:background .2s; text-align:left; width:100%; }
.link-item:hover { background:var(--cream); }
</style>
