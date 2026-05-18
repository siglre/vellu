<template>
  <main class="container" style="padding:48px 24px">
    <div v-if="loading" class="product-layout">
      <div class="skeleton" style="height:520px;border-radius:16px"/>
      <div style="padding:32px"><div v-for="n in 5" :key="n" class="skeleton" :style="`height:${n===1?40:20}px;margin-bottom:16px;border-radius:4px`"/></div>
    </div>
    <div v-else-if="product" class="product-layout">
      <!-- Галерея -->
      <div class="gallery">
        <!-- Миниатюры -->
        <div v-if="allImages.length > 1" class="thumbs">
          <button
            v-for="(img, i) in allImages" :key="i"
            :class="['thumb', { active: i === activeIdx }]"
            @click="activeIdx = i"
          >
            <img :src="img" :alt="`фото ${i+1}`" @error="e => e.target.src='/images/products/placeholder.jpg'"/>
          </button>
        </div>

        <!-- Главное фото -->
        <div class="main-wrap">
          <img
            :src="allImages[activeIdx]"
            :alt="product.name"
            class="main-img"
            @error="e => e.target.src='/images/products/placeholder.jpg'"
            @mousemove="onMouseMove"
            @mouseleave="resetZoom"
            :style="zoomStyle"
          />
          <div v-if="product.tag" :class="['tag', product.tag==='Новый'?'tag-new':'tag-hit']">{{ product.tag }}</div>
          <button v-if="allImages.length > 1" class="arrow arrow-l" @click="prev">‹</button>
          <button v-if="allImages.length > 1" class="arrow arrow-r" @click="next">›</button>
        </div>
      </div>

      <!-- Информация -->
      <div class="product-info">
        <p class="cat">{{ product.category }}</p>
        <h1 class="name serif">{{ product.name }}</h1>
        <p class="price">₽{{ currentPrice.toLocaleString('ru') }}</p>
        <p class="desc">{{ product.description }}</p>

        <!-- Размеры -->
        <div v-if="product.sizes?.length" class="sizes">
          <p class="sizes-label">Размер: <strong>{{ selectedSize }}</strong></p>
          <div class="sizes-btns">
            <button v-for="s in product.sizes" :key="s.name"
              :class="['size-btn', { active: selectedSize === s.name }]"
              @click="selectedSize = s.name">
              {{ s.name }}
              <span v-if="s.price" class="size-price">₽{{ Number(s.price).toLocaleString('ru') }}</span>
            </button>
          </div>
        </div>

        <!-- В корзину -->
        <button :class="['btn btn-full', added ? 'btn-added' : 'btn-dark']"
          style="padding:16px;margin-top:auto"
          @click="handleAdd" :disabled="adding">
          {{ added ? '✓ Добавлено в корзину' : adding ? 'Добавляем...' : 'Добавить в корзину' }}
        </button>

        <div class="features">
          <span>Бесплатный возврат</span>
          <span>Подарочная упаковка</span>
          <span>Можно стирать</span>
        </div>

        <!-- Остаток -->
        <p v-if="product.stock < 5 && product.stock > 0" class="stock-warn">
          ⚡ Осталось {{ product.stock }} шт.
        </p>
      </div>
    </div>
    <div v-else class="not-found">Товар не найден. <RouterLink to="/catalog">← В каталог</RouterLink></div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { productsApi } from '@/api';
import { useCartStore } from '@/stores/cart';
import { useUiStore   } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';

const route  = useRoute();
const cart   = useCartStore();
const ui     = useUiStore();
const auth   = useAuthStore();

const product      = ref(null);
const loading      = ref(true);
const selectedSize = ref('');
const adding       = ref(false);
const added        = ref(false);
const activeIdx    = ref(0);
const zoomStyle    = ref({});

const currentPrice = computed(() => {
  if (!product.value) return 0;
  const sizes = product.value.sizes || [];
  const found = sizes.find(s => s.name === selectedSize.value);
  return found?.price ?? product.value.price;
});

const allImages = computed(() => {
  if (!product.value) return [];
  const imgs = product.value.images;
  if (imgs && imgs.length > 0) return imgs;
  return [product.value.image_url];
});

function prev() { activeIdx.value = (activeIdx.value - 1 + allImages.value.length) % allImages.value.length; }
function next() { activeIdx.value = (activeIdx.value + 1) % allImages.value.length; }
function onMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  zoomStyle.value = { transform: `scale(1.4)`, transformOrigin: `${x}% ${y}%`, transition: 'transform .1s' };
}
function resetZoom() { zoomStyle.value = { transform: 'scale(1)', transition: 'transform .3s' }; }

onMounted(async () => {
  try {
    const { data } = await productsApi.get(route.params.id);
    product.value      = data;
    selectedSize.value = data.sizes?.[1]?.name || data.sizes?.[0]?.name || '';
  } finally { loading.value = false; }
});

async function handleAdd() {
  if (!auth.isLoggedIn) { ui.openAuth('login'); return; }
  adding.value = true;
  try {
    await cart.addItem(product.value.id, selectedSize.value);
    added.value = true;
    ui.notify(`${product.value.name} добавлен в корзину 🛍️`);
    setTimeout(() => { added.value = false; }, 2000);
  } finally { adding.value = false; }
}
</script>

<style scoped>
.product-layout { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
@media(max-width:768px) { .product-layout { grid-template-columns:1fr; } }
.gallery { display:flex; gap:12px; }
.thumbs { display:flex; flex-direction:column; gap:8px; }
.thumb { width:72px; height:72px; border-radius:8px; overflow:hidden; border:2px solid transparent; transition:border-color .2s; flex-shrink:0; }
.thumb.active { border-color:var(--accent); }
.thumb img { width:100%; height:100%; object-fit:cover; }
.main-wrap { position:relative; flex:1; border-radius:16px; overflow:hidden; background:var(--cream2); aspect-ratio:3/4; cursor:zoom-in; }
.main-img { width:100%; height:100%; object-fit:cover; transform-origin:center; }
.tag { position:absolute; top:16px; left:16px; color:white; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 12px; border-radius:99px; font-weight:500; z-index:2; pointer-events:none; }
.tag-new { background:var(--green); } .tag-hit { background:var(--mid); }
.arrow { position:absolute; top:50%; transform:translateY(-50%); z-index:3; width:32px; height:32px; background:rgba(255,255,255,.9); border-radius:50%; font-size:20px; line-height:1; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,.15); transition:background .2s; }
.arrow-l { left:10px; }
.arrow-r { right:10px; }
.arrow:hover { background:white; }
.tag { position:absolute; top:16px; left:16px; color:white; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 12px; border-radius:99px; font-weight:500; }
.tag-new { background:var(--green); } .tag-hit { background:var(--mid); }
.product-info { display:flex; flex-direction:column; padding:16px 0; }
.cat   { font-size:11px; color:var(--grey); text-transform:uppercase; letter-spacing:.1em; margin-bottom:8px; }
.name  { font-size:clamp(24px,3vw,36px); margin-bottom:12px; }
.price { font-size:24px; font-weight:500; margin-bottom:24px; }
.desc  { color:#666; font-size:15px; line-height:1.7; margin-bottom:32px; }
.sizes { margin-bottom:32px; }
.sizes-label { font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--grey); margin-bottom:12px; }
.sizes-btns  { display:flex; gap:8px; flex-wrap:wrap; }
.size-btn  { padding:8px 16px; font-size:13px; border:1px solid var(--brown); transition:all .2s; display:flex; flex-direction:column; align-items:center; gap:2px; }
.size-btn.active { border-color:var(--mid); background:var(--mid); color:white; }
.size-btn:not(.active):hover { border-color:var(--grey); }
.size-price { font-size:11px; opacity:.8; }
.btn-added { background:var(--green) !important; }
.features  { display:flex; gap:16px; justify-content:center; margin-top:16px; }
.features span { font-size:11px; color:#aaa; }
.stock-warn { color:var(--accent); font-size:13px; margin-top:12px; font-weight:500; }
.not-found { text-align:center; padding:80px 0; font-size:18px; }
</style>
