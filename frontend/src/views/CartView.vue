<template>
  <main class="container" style="padding:48px 24px">
    <h1 class="serif" style="font-size:32px;margin-bottom:32px">Оформление заказа</h1>
    <div v-if="!cart.items.length" style="text-align:center;padding:80px 0">
      <p style="font-size:48px;margin-bottom:16px">🛒</p>
      <p style="color:var(--grey)">Корзина пуста</p>
      <RouterLink to="/catalog" class="btn btn-dark" style="margin-top:24px;display:inline-flex">Перейти в каталог</RouterLink>
    </div>
    <div v-else class="cart-layout">
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.id" class="cart-item">
          <img :src="item.image_url" :alt="item.name"/>
          <div>
            <p style="font-weight:500">{{ item.name }}<span v-if="item.size"> · {{ item.size }}</span></p>
            <div style="display:flex;gap:8px;align-items:center;margin-top:12px">
              <div class="qty"><button @click="cart.updateQty(item.id,item.qty-1)">−</button><span>{{ item.qty }}</span><button @click="cart.updateQty(item.id,item.qty+1)">+</button></div>
              <button style="font-size:12px;color:var(--light);text-decoration:underline" @click="cart.removeItem(item.id)">Удалить</button>
            </div>
          </div>
          <p style="font-weight:500;margin-left:auto">₽{{ (Number(item.price)*item.qty).toLocaleString('ru') }}</p>
        </div>
      </div>
      <div class="order-summary">
        <h3 style="margin-bottom:24px">Итого</h3>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:var(--grey)">Товары</span><span>₽{{ cart.total.toLocaleString('ru') }}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:24px"><span style="color:var(--grey)">Доставка</span><span style="color:var(--green)">{{ cart.total >= 5000 ? 'Бесплатно' : '₽350' }}</span></div>
        <div class="form-group"><label class="form-label">Имя получателя</label><input v-model="shipping.name" class="form-input"/></div>
        <div class="form-group"><label class="form-label">Телефон</label><input v-model="shipping.phone" class="form-input"/></div>
        <div class="form-group"><label class="form-label">Адрес доставки</label><input v-model="shipping.address" class="form-input"/></div>
        <button class="btn btn-dark btn-full" @click="placeOrder" :disabled="ordering">{{ ordering ? 'Оформляем...' : 'Оформить заказ' }}</button>
      </div>
    </div>
  </main>
</template>
<script setup>
import { ref } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useUiStore }   from '@/stores/ui';
import { ordersApi } from '@/api';
import { useRouter } from 'vue-router';
const cart    = useCartStore();
const ui      = useUiStore();
const router  = useRouter();
const ordering = ref(false);
const shipping = ref({ name:'', phone:'', address:'' });
async function placeOrder() {
  if (!shipping.value.name || !shipping.value.address) { ui.notify('Заполните данные доставки'); return; }
  ordering.value = true;
  try {
    await ordersApi.create({ shipping_name: shipping.value.name, shipping_phone: shipping.value.phone, shipping_address: shipping.value.address });
    await cart.fetch();
    ui.notify('Заказ оформлен! 🎉');
    router.push('/orders');
  } catch(e) { ui.notify('Ошибка оформления заказа'); } finally { ordering.value = false; }
}
</script>
<style scoped>
.cart-layout { display:grid; grid-template-columns:1fr 380px; gap:40px; }
@media(max-width:768px) { .cart-layout { grid-template-columns:1fr; } }
.cart-items { display:flex; flex-direction:column; gap:0; }
.cart-item  { display:flex; gap:16px; padding:20px 0; border-bottom:1px solid var(--beige); align-items:flex-start; }
.cart-item img { width:80px; height:96px; object-fit:cover; border-radius:12px; background:var(--cream2); }
.qty { display:flex; align-items:center; border:1px solid var(--brown); }
.qty button { padding:6px 12px; font-size:16px; color:var(--grey); }
.qty span   { padding:6px 12px; min-width:32px; text-align:center; }
.order-summary { background:white; border-radius:16px; padding:32px; box-shadow:0 1px 4px rgba(0,0,0,.06); height:fit-content; }
</style>
