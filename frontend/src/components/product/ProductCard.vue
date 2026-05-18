<template>
  <div class="card" @mouseenter="onEnter" @mouseleave="onLeave">
    <div class="img-wrap" @click="$router.push(`/product/${product.id}`)" @mousemove="onMouseMove" @mouseleave="resetZoom">

      <!-- Фото -->
      <img
        :src="allImages[activeIdx]"
        :alt="product.name"
        loading="lazy"
        class="main-img"
        :style="zoomStyle"
        @error="e => e.target.src = '/images/products/placeholder.jpg'"
      />

      <!-- Тег -->
      <div v-if="product.tag" :class="['tag', tagClass]">{{ product.tag }}</div>

      <!-- Quick add -->
      <div :class="['quick-add', { visible: hovered }]">
        <button @click.stop="handleAdd">Быстро добавить</button>
      </div>

      <!-- Wishlist -->
      <button :class="['wish-btn', { visible: hovered || isWished, wished: isWished }]" @click.stop="handleWishlist">
        <svg width="14" height="14" viewBox="0 0 24 24" :fill="isWished ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>
    </div>

    <div class="info" @click="$router.push(`/product/${product.id}`)">
      <p class="cat">{{ product.category }}</p>
      <p class="name">{{ product.name }}</p>
      <p class="price"><span v-if="hasVariedPrices" class="from">от </span>₽{{ Number(product.price).toLocaleString('ru') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore     } from '@/stores/cart';
import { useUiStore       } from '@/stores/ui';
import { useAuthStore     } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';

const props    = defineProps({ product: Object });
const cart     = useCartStore();
const ui       = useUiStore();
const auth     = useAuthStore();
const wishlist = useWishlistStore();

const hovered   = ref(false);
const activeIdx = ref(0);
const zoomStyle = ref({});

const allImages = computed(() => {
  const imgs = props.product.images;
  if (imgs && imgs.length > 0) return imgs;
  return [props.product.image_url];
});

const isWished = computed(() => wishlist.has(props.product.id));

const hasVariedPrices = computed(() => {
  const sizes = props.product.sizes || [];
  const prices = sizes.map(s => s.price).filter(p => p != null && p > 0);
  return prices.length > 1 && new Set(prices).size > 1;
});

const tagClass = computed(() => ({
  'tag-new':  props.product.tag === 'Новый',
  'tag-hit':  props.product.tag === 'Хит' || props.product.tag === 'Популярный',
  'tag-sale': props.product.tag === 'Скидка',
}));

function onEnter() { hovered.value = true; }
function onLeave() { hovered.value = false; activeIdx.value = 0; }

function onMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  zoomStyle.value = { transform: `scale(1.18)`, transformOrigin: `${x}% ${y}%`, transition: 'transform .15s' };
}
function resetZoom() { zoomStyle.value = { transform: 'scale(1)', transition: 'transform .3s' }; }

async function handleAdd() {
  if (!auth.isLoggedIn) { ui.openAuth('login'); return; }
  const ok = await cart.addItem(props.product.id, '');
  if (ok) ui.notify(`${props.product.name} добавлен в корзину 🛍️`);
}

async function handleWishlist() {
  if (!auth.isLoggedIn) { ui.openAuth('login'); return; }
  await wishlist.toggle(props.product.id);
  ui.notify(isWished.value ? `${props.product.name} в избранном ❤️` : `Убрано из избранного`);
}
</script>

<style scoped>
.card { cursor:pointer; }
.img-wrap { position:relative; overflow:hidden; border-radius:16px; background:var(--cream2); aspect-ratio:4/5; margin-bottom:16px; }
.main-img { width:100%; height:100%; object-fit:cover; transform:scale(1); }

.tag { position:absolute; top:12px; left:12px; color:white; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 12px; border-radius:99px; font-weight:500; z-index:2; }
.tag-new  { background:var(--green); }
.tag-hit  { background:var(--mid); }
.tag-sale { background:var(--accent); }


.quick-add { position:absolute; bottom:0; left:0; right:0; background:rgba(255,255,255,.96); padding:12px 16px; transform:translateY(100%); transition:transform .3s; z-index:3; }
.quick-add.visible { transform:translateY(0); }
.quick-add button { width:100%; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--dark); font-weight:500; transition:color .2s; }
.quick-add button:hover { color:var(--accent); }

.wish-btn { position:absolute; top:12px; right:12px; width:32px; height:32px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; box-shadow:0 2px 4px rgba(0,0,0,.1); z-index:3; }
.wish-btn.visible { opacity:1; }
.wish-btn:hover, .wish-btn.wished { color:var(--accent); }

.cat   { font-size:11px; color:var(--grey); text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
.name  { font-size:14px; font-weight:500; color:var(--dark); margin-bottom:4px; transition:color .2s; }
.card:hover .name { color:var(--accent); }
.price { font-size:14px; font-weight:500; }
.from  { font-size:11px; color:var(--grey); font-weight:400; }
</style>
