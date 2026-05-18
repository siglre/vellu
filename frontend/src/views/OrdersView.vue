<template>
  <main class="container" style="padding:48px 24px">
    <h1 class="serif" style="font-size:32px;margin-bottom:32px">Мои заказы</h1>
    <div v-if="loading" style="color:var(--grey)">Загрузка...</div>
    <div v-else-if="!orders.length" style="text-align:center;padding:80px 0">
      <p style="font-size:48px;margin-bottom:16px">📦</p>
      <p style="color:var(--grey)">Заказов пока нет</p>
      <RouterLink to="/catalog" class="btn btn-dark" style="margin-top:24px;display:inline-flex">Перейти в каталог</RouterLink>
    </div>
    <div v-else style="display:flex;flex-direction:column;gap:16px">
      <div v-for="o in orders" :key="o.id" class="order-card">
        <div class="order-head">
          <div>
            <p style="font-weight:500">Заказ #{{ o.id.slice(0,8) }}…</p>
            <p style="font-size:13px;color:var(--grey)">{{ new Date(o.created_at).toLocaleDateString('ru') }}</p>
          </div>
          <span :class="['badge', statusClass(o.status)]">{{ o.status }}</span>
          <p style="font-weight:500">₽{{ Number(o.total).toLocaleString('ru') }}</p>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <img v-for="item in o.items" :key="item.id" :src="item.image_url" :alt="item.name" style="width:56px;height:64px;object-fit:cover;border-radius:8px;background:var(--cream2)"/>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { ordersApi } from '@/api';
const orders  = ref([]);
const loading = ref(true);
const statusClass = s => ({ new:'badge-green', paid:'badge-green', shipped:'badge-grey', delivered:'badge-grey', cancelled:'badge-red' })[s] || 'badge-grey';
onMounted(async () => { const { data } = await ordersApi.list(); orders.value = data; loading.value = false; });
</script>
<style scoped>
.order-card { background:white; border-radius:12px; padding:24px; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.order-head { display:flex; align-items:center; gap:24px; }
.badge { display:inline-block; padding:4px 12px; border-radius:99px; font-size:12px; }
.badge-green { background:#e8f5e9; color:var(--green); }
.badge-grey  { background:#f0f0f0; color:var(--grey); }
.badge-red   { background:#fde8ec; color:var(--accent); }
</style>
