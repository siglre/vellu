<template>
  <main>
    <div class="page-hero">
      <div class="container">
        <h1 class="serif">Избранное</h1>
        <p>{{ wishlist.count }} {{ noun(wishlist.count) }}</p>
      </div>
    </div>

    <div class="container" style="padding:48px 24px">
      <div v-if="wishlist.loading" class="grid">
        <div v-for="n in 4" :key="n" class="skeleton" style="height:360px;border-radius:16px"/>
      </div>

      <div v-else-if="wishlist.items.length" class="grid">
        <div v-for="p in wishlist.items" :key="p.id" class="card">
          <div class="img-wrap" @click="$router.push(`/product/${p.id}`)">
            <img :src="p.image_url" :alt="p.name" @error="e => e.target.src='/images/products/placeholder.jpg'"/>
            <div v-if="p.tag" :class="['tag', p.tag==='Новый'?'tag-new':'tag-hit']">{{ p.tag }}</div>
            <button class="remove-btn" @click.stop="remove(p.id)" title="Убрать из избранного">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </button>
          </div>
          <div class="info" @click="$router.push(`/product/${p.id}`)">
            <p class="cat">{{ p.category }}</p>
            <p class="name">{{ p.name }}</p>
            <p class="price">₽{{ Number(p.price).toLocaleString('ru') }}</p>
          </div>
          <button class="btn btn-dark btn-full" style="font-size:11px;padding:12px" @click="addToCart(p)">
            В корзину
          </button>
        </div>
      </div>

      <div v-else class="empty">
        <div class="empty-icon">🤍</div>
        <h2 class="serif">Пока здесь пусто</h2>
        <p>Добавляйте понравившиеся игрушки в избранное — они будут ждать вас здесь.</p>
        <RouterLink to="/catalog" class="btn btn-dark" style="margin-top:24px;padding:14px 40px">
          Перейти в каталог
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';

const wishlist = useWishlistStore();
const cart     = useCartStore();
const ui       = useUiStore();

onMounted(() => wishlist.fetch());

async function remove(id) {
  await wishlist.toggle(id);
}

async function addToCart(product) {
  const ok = await cart.addItem(product.id, product.sizes?.[0] || '');
  if (ok) ui.notify(`${product.name} добавлен в корзину 🛍️`);
}

function noun(n) {
  const mod = n % 10;
  if (n % 100 >= 11 && n % 100 <= 14) return 'товаров';
  if (mod === 1) return 'товар';
  if (mod >= 2 && mod <= 4) return 'товара';
  return 'товаров';
}
</script>

<style scoped>
.page-hero { background:var(--cream2); padding:48px 0 32px; text-align:center; border-bottom:1px solid var(--beige); }
.page-hero h1 { font-size:40px; margin-bottom:8px; }
.page-hero p  { color:var(--grey); font-size:14px; }

.grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
@media(min-width:768px)  { .grid { grid-template-columns:repeat(3,1fr); } }
@media(min-width:1024px) { .grid { grid-template-columns:repeat(4,1fr); } }

.card { display:flex; flex-direction:column; gap:12px; }
.img-wrap { position:relative; border-radius:16px; overflow:hidden; background:var(--cream2); aspect-ratio:4/5; cursor:pointer; }
.img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .5s; }
.card:hover .img-wrap img { transform:scale(1.05); }

.tag { position:absolute; top:12px; left:12px; color:white; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 12px; border-radius:99px; font-weight:500; }
.tag-new { background:var(--green); }
.tag-hit { background:var(--mid); }

.remove-btn { position:absolute; top:12px; right:12px; width:32px; height:32px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,.1); color:var(--accent); transition:transform .2s; }
.remove-btn:hover { transform:scale(1.1); }

.info { cursor:pointer; }
.cat   { font-size:11px; color:var(--grey); text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
.name  { font-size:14px; font-weight:500; margin-bottom:4px; transition:color .2s; }
.card:hover .name { color:var(--accent); }
.price { font-size:14px; font-weight:500; }

.empty { text-align:center; padding:80px 0; }
.empty-icon { font-size:64px; margin-bottom:24px; }
.empty h2 { font-size:28px; margin-bottom:12px; }
.empty p { color:var(--grey); font-size:15px; }
</style>
