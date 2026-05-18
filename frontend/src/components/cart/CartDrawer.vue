<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="ui.cartOpen" class="overlay" @click="ui.closeCart()" />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide-right">
      <div v-if="ui.cartOpen" class="drawer">
        <div class="drawer-header">
          <h2 class="serif">Ваша корзина</h2>
          <button class="close-btn" @click="ui.closeCart()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Пустая корзина -->
        <div v-if="!cart.items.length" class="empty">
          <div class="empty-emoji">🐰</div>
          <p>Ваша корзина пуста</p>
          <p class="empty-sub">Время найти нового лучшего друга!</p>
          <button class="btn btn-dark btn-sm" style="margin-top:24px" @click="ui.closeCart()">
            Продолжить покупки
          </button>
        </div>

        <!-- Товары -->
        <div v-else class="items">
          <div v-for="item in cart.items" :key="item.id" class="item">
            <img :src="item.image_url" :alt="item.name" class="item-img"/>
            <div class="item-info">
              <p class="item-cat">{{ item.category }}</p>
              <p class="item-name">{{ item.name }}{{ item.size ? ' · ' + item.size : '' }}</p>
              <div class="item-controls">
                <div class="qty">
                  <button @click="cart.updateQty(item.id, item.qty - 1)">−</button>
                  <span>{{ item.qty }}</span>
                  <button @click="cart.updateQty(item.id, item.qty + 1)">+</button>
                </div>
                <button class="remove-btn" @click="cart.removeItem(item.id)">Удалить</button>
              </div>
            </div>
            <p class="item-price">₽{{ (item.price * item.qty).toLocaleString('ru') }}</p>
          </div>
        </div>

        <!-- Итог -->
        <div v-if="cart.items.length" class="footer">
          <div class="subtotal">
            <span>Промежуточный итог</span>
            <strong>₽{{ cart.total.toLocaleString('ru') }}</strong>
          </div>
          <p class="delivery-note">Бесплатная доставка от ₽5 000</p>
          <RouterLink to="/cart" class="btn btn-dark btn-full" @click="ui.closeCart()">
            Оформить заказ
          </RouterLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useCartStore } from '@/stores/cart';
import { useUiStore }   from '@/stores/ui';
const cart = useCartStore();
const ui   = useUiStore();
</script>

<style scoped>
.overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:200; }
.drawer  { position:fixed; top:0; right:0; height:100%; width:100%; max-width:440px; background:white; z-index:201; display:flex; flex-direction:column; box-shadow:-8px 0 32px rgba(0,0,0,.12); }
.drawer-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--beige); }
.close-btn { color:var(--grey); transition:color .2s; }
.close-btn:hover { color:var(--dark); }
.empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; text-align:center; }
.empty-emoji { font-size:56px; margin-bottom:16px; }
.empty p     { color:var(--grey); font-size:14px; }
.empty-sub   { font-size:12px; color:var(--light); margin-top:4px; }
.items  { flex:1; overflow-y:auto; padding:16px 24px; }
.item   { display:flex; gap:16px; padding:16px 0; border-bottom:1px solid var(--beige); }
.item-img  { width:80px; height:96px; object-fit:cover; border-radius:12px; background:var(--cream2); flex-shrink:0; }
.item-info { flex:1; }
.item-cat  { font-size:11px; color:var(--grey); margin-bottom:2px; }
.item-name { font-size:14px; font-weight:500; margin-bottom:12px; }
.item-controls { display:flex; align-items:center; gap:8px; }
.item-price { font-size:14px; font-weight:500; white-space:nowrap; }
.qty { display:flex; align-items:center; border:1px solid var(--brown); }
.qty button { padding:6px 12px; color:var(--grey); font-size:16px; transition:color .2s; }
.qty button:hover { color:var(--dark); }
.qty span   { padding:6px 12px; font-size:14px; min-width:32px; text-align:center; }
.remove-btn { font-size:12px; color:var(--light); text-decoration:underline; text-underline-offset:2px; transition:color .2s; }
.remove-btn:hover { color:var(--accent); }
.footer { padding:24px; border-top:1px solid var(--beige); }
.subtotal { display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; }
.subtotal span { color:var(--grey); }
.delivery-note { font-size:12px; color:var(--light); text-align:center; margin-bottom:16px; }
</style>
