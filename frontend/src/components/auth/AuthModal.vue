<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="ui.authOpen" class="modal-wrap">
        <div class="backdrop" @click="ui.closeAuth()" />
        <div class="modal-box">
          <button class="modal-close" @click="ui.closeAuth()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="modal-logo serif">vellu</div>
          <div class="modal-sub">Мягко. Нежно. С любовью.</div>

          <!-- Вкладки -->
          <div class="tabs">
            <button :class="['tab', { active: ui.authMode === 'login' }]"    @click="ui.authMode = 'login'">Войти</button>
            <button :class="['tab', { active: ui.authMode === 'register' }]" @click="ui.authMode = 'register'">Регистрация</button>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <!-- Форма входа -->
          <form v-if="ui.authMode === 'login'" @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-input" placeholder="your@email.ru" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Пароль</label>
              <input v-model="form.password" type="password" class="form-input" placeholder="••••••" required/>
            </div>
            <button type="submit" class="btn btn-dark btn-full" :disabled="loading">
              {{ loading ? 'Входим...' : 'Войти в аккаунт' }}
            </button>
          </form>

          <!-- Форма регистрации -->
          <form v-else @submit.prevent="handleRegister">
            <div class="form-group">
              <label class="form-label">Имя</label>
              <input v-model="form.name" type="text" class="form-input" placeholder="Ваше имя" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-input" placeholder="your@email.ru" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Пароль</label>
              <input v-model="form.password" type="password" class="form-input" placeholder="Минимум 6 символов" required minlength="6"/>
            </div>
            <button type="submit" class="btn btn-dark btn-full" :disabled="loading">
              {{ loading ? 'Создаём...' : 'Создать аккаунт' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useUiStore }   from '@/stores/ui';

const auth  = useAuthStore();
const cart  = useCartStore();
const ui    = useUiStore();

const form    = ref({ name:'', email:'', password:'' });
const error   = ref('');
const loading = ref(false);

// Сброс при открытии
watch(() => ui.authOpen, (open) => {
  if (open) { form.value = { name:'', email:'', password:'' }; error.value = ''; }
});

async function handleLogin() {
  loading.value = true; error.value = '';
  try {
    const user = await auth.login(form.value.email, form.value.password);
    await cart.fetch();
    ui.closeAuth();
    ui.notify(`Добро пожаловать, ${user.name}! 👋`);
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка входа';
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  loading.value = true; error.value = '';
  try {
    const user = await auth.register(form.value.name, form.value.email, form.value.password);
    await cart.fetch();
    ui.closeAuth();
    ui.notify(`Добро пожаловать, ${user.name}! 🎉`);
  } catch (e) {
    error.value = e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || 'Ошибка регистрации';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-wrap  { position:fixed; inset:0; z-index:400; display:flex; align-items:center; justify-content:center; padding:16px; }
.backdrop    { position:absolute; inset:0; background:rgba(0,0,0,.6); }
.modal-box   { position:relative; background:white; width:100%; max-width:440px; padding:40px; border-radius:16px; z-index:1; }
.modal-close { position:absolute; top:16px; right:16px; color:var(--grey); transition:color .2s; }
.modal-close:hover { color:var(--dark); }
.modal-logo  { font-size:26px; letter-spacing:.25em; text-align:center; font-style:italic; margin-bottom:4px; }
.modal-sub   { font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:var(--grey); text-align:center; margin-bottom:28px; }
.tabs        { display:flex; border-bottom:1px solid var(--beige); margin-bottom:28px; }
.tab         { flex:1; padding:12px; font-size:13px; text-align:center; color:var(--grey); border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .2s; }
.tab.active  { color:var(--dark); border-bottom-color:var(--dark); }
.error       { color:var(--red-err); font-size:13px; margin-bottom:16px; }
</style>
