<template>
  <main>
    <!-- Hero Slider -->
    <section class="hero" :style="{ backgroundColor: slide.bg }">
      <div class="hero-inner container">
        <div class="hero-text">
          <p class="hero-sub" :style="{ color: slide.accent }">{{ slide.sub }}</p>
          <h1 class="hero-title serif">{{ slide.title }}</h1>
          <RouterLink :to="slide.link" class="hero-cta" :style="{ background: slide.accent }">
            {{ slide.cta }}
          </RouterLink>
        </div>
        <div class="hero-img">
          <div class="blob-bg" :style="{ backgroundColor: slide.accent }" />
          <img :src="slide.img" :alt="slide.sub" class="blob-img" :key="current"/>
        </div>
      </div>
      <div class="hero-dots">
        <button v-for="(_, i) in slides" :key="i" class="dot"
          :style="{ backgroundColor: i === current ? slide.accent : '#ccc' }"
          @click="goTo(i)" />
      </div>
      <svg class="wave" viewBox="0 0 1440 60" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,60 C360,20 720,60 1080,20 C1260,0 1380,40 1440,60 L1440,60 L0,60 Z"/>
      </svg>
    </section>

    <!-- Категории -->
    <section class="section bg-white">
      <div class="container">
        <div class="section-head text-center">
          <h2 class="serif">Выбрать по персонажу</h2>
          <p class="section-desc">Найдите своего идеального друга для объятий</p>
        </div>
        <div class="cat-grid">
          <RouterLink v-for="c in categories" :key="c.id"
            :to="`/catalog?category=${c.name}`"
            class="cat-card"
            :style="{ background: c.bg_color }">
            <img :src="emojiUrl(c.emoji)" :alt="c.name" class="cat-emoji" width="48" height="48"/>
            <p class="cat-name">{{ c.name }}</p>
            <p class="cat-count">{{ c.product_count }} товаров</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Хиты продаж -->
    <section class="section bg-cream2">
      <div class="container">
        <div class="section-header">
          <div>
            <p class="section-sub" style="color:var(--accent)">Наши любимые</p>
            <h2 class="serif">Хиты продаж</h2>
          </div>
          <RouterLink to="/catalog?sort=newest" class="view-all">Смотреть все</RouterLink>
        </div>
        <div v-if="loadingProducts" class="product-grid">
          <div v-for="n in 8" :key="n" class="skeleton" style="height:360px;border-radius:16px"/>
        </div>
        <div v-else class="product-grid">
          <ProductCard v-for="p in bestsellers" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- О нас -->
    <section class="about-section">
      <div class="container about-inner">
        <div class="about-text">
          <p class="about-sub">Наша история</p>
          <h2 class="about-title serif">Рождены в Москве,<br>любимы везде.</h2>
          <p class="about-desc">Основанная в 2020 году, Vellu создаёт неотразимо мягкие игрушки с заботой о каждой детали.</p>
          <p class="about-desc">Мы верим, что каждый заслуживает того, что можно обнять.</p>
        </div>
        <div class="stats-grid">
          <div v-for="s in stats" :key="s.num" class="stat-box">
            <div class="serif" style="font-size:40px;margin-bottom:8px">{{ s.num }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Новинки -->
    <section class="section bg-white">
      <div class="container">
        <div class="section-header">
          <div>
            <p class="section-sub" style="color:var(--green)">Только что появились</p>
            <h2 class="serif">Новинки</h2>
          </div>
          <RouterLink to="/catalog?tag=Новый" class="view-all">Все новинки</RouterLink>
        </div>
        <div class="product-grid">
          <ProductCard v-for="p in newArrivals" :key="p.id" :product="p" />
        </div>

        <!-- Баннер подарков -->
        <div class="gift-banner">
          <div>
            <p class="section-sub" style="color:var(--accent)">Идеи подарков</p>
            <h3 class="serif" style="font-size:28px;margin-bottom:12px">Найдите идеальный подарок</h3>
            <p style="color:#666">Наш подборщик поможет выбрать Vellu для любого повода.</p>
          </div>
          <RouterLink to="/catalog" class="btn btn-accent" style="padding:14px 40px">Подобрать подарок</RouterLink>
        </div>
      </div>
    </section>

    <!-- Подписка -->
    <section class="newsletter">
      <div class="newsletter-inner">
        <p class="section-sub" style="color:var(--accent);margin-bottom:16px">Будьте в курсе</p>
        <h2 class="serif">Новости и специальные предложения</h2>
        <p style="color:var(--grey);font-size:14px;margin-bottom:32px">Присоединяйтесь к семье Vellu и узнавайте первыми о новых персонажах.</p>
        <div v-if="!subscribed" class="nl-form">
          <input v-model="email" type="email" placeholder="Ваш email" class="nl-input"/>
          <button class="btn btn-dark" @click="subscribe">Подписаться</button>
        </div>
        <div v-else class="nl-success">🎉 Добро пожаловать в семью Vellu!</div>
        <p style="color:#ccc;font-size:12px;margin-top:16px">Мы уважаем вашу конфиденциальность.</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { productsApi, categoriesApi } from '@/api';
import ProductCard from '@/components/product/ProductCard.vue';

// ---- Hero ----
const slides = [
  { bg:'#f3e8ff', sub:'Весенняя коллекция', title:'Мягкие истории,\nкрепкие объятия.', cta:'Смотреть новинки', accent:'#9b5de5', link:'/catalog?tag=Новый', img:'/images/products/gray-bunny.jpg' },
  { bg:'#e8f5ea', sub:'Фрукты, овощи и всё такое', title:'Удивительно\nзабавные.', cta:'Забавная коллекция', accent:'#5b8c5a', link:'/catalog?category=Забавные', img:'/images/products/avocado.jpg' },
  { bg:'#e3eeff', sub:'Коллекция «Океан»', title:'Погружайтесь\nв чудеса.', cta:'Смотреть «Океан»', accent:'#3a5fa8', link:'/catalog?category=Океан', img:'/images/products/octopus.jpg' },
];
const current = ref(0);
const slide   = computed(() => slides[current.value]);
let timer = null;
function goTo(i) { current.value = i; }
onMounted(() => { timer = setInterval(() => current.value = (current.value + 1) % slides.length, 5000); });
onUnmounted(() => clearInterval(timer));

function emojiUrl(emoji) {
  const cp = [...emoji].map(c => c.codePointAt(0).toString(16)).filter(c => c !== 'fe0f').join('-');
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${cp}.png`;
}

// ---- Data ----
const categories     = ref([]);
const bestsellers    = ref([]);
const newArrivals    = ref([]);
const loadingProducts = ref(true);

const stats = [
  { num:'5+',   label:'Лет мягкой радости' },
  { num:'200+', label:'Уникальных персонажей' },
  { num:'50+',  label:'Городов России' },
  { num:'99%',  label:'Любовь с первого взгляда' },
];

onMounted(async () => {
  const [catRes, bestRes, newRes] = await Promise.all([
    categoriesApi.list(),
    productsApi.list({ sort:'newest', limit:8 }),
    productsApi.list({ tag:'Новый', limit:4 }),
  ]);
  categories.value  = catRes.data;
  bestsellers.value = bestRes.data.products;
  newArrivals.value = newRes.data.products;
  loadingProducts.value = false;
});

// ---- Newsletter ----
const email      = ref('');
const subscribed = ref(false);
function subscribe() {
  if (!email.value.includes('@')) return;
  subscribed.value = true;
}
</script>

<style scoped>
/* Hero */
.hero { position:relative; overflow:hidden; transition:background-color .7s; min-height:85vh; display:flex; align-items:center; }
.hero-inner { display:flex; align-items:center; gap:48px; width:100%; padding:60px 24px; flex-direction:column; }
@media(min-width:1024px) { .hero-inner { flex-direction:row; } }
.hero-text  { flex:1; text-align:center; }
@media(min-width:1024px) { .hero-text { text-align:left; } }
.hero-sub   { font-size:11px; letter-spacing:.4em; text-transform:uppercase; margin-bottom:16px; }
.hero-title { font-size:clamp(36px,6vw,68px); line-height:1.1; margin-bottom:32px; white-space:pre-line; }
.hero-cta   { display:inline-block; padding:14px 40px; color:white; font-size:12px; letter-spacing:.3em; text-transform:uppercase; transition:opacity .2s; }
.hero-cta:hover { opacity:.85; }
.hero-img   { flex:1; display:flex; justify-content:center; }
.blob-bg    { position:absolute; inset:16px; border-radius:50%; opacity:.3; pointer-events:none; }
.blob-img   { position:relative; width:300px; height:380px; object-fit:cover; border-radius:60% 40% 60% 40%/50% 60% 40% 50%; box-shadow:0 25px 50px -12px rgba(0,0,0,.25); animation:fadeIn .5s ease-out; }
@media(min-width:1024px) { .blob-img { width:440px; height:540px; } }
.hero-dots  { position:absolute; bottom:32px; left:50%; transform:translateX(-50%); display:flex; gap:12px; }
.dot { width:8px; height:8px; border-radius:50%; cursor:pointer; transition:all .3s; }
.wave { position:absolute; bottom:0; left:0; width:100%; pointer-events:none; }

/* Layout */
.section { padding:64px 0; }
.bg-white  { background:white; }
.bg-cream2 { background:var(--cream2); }
.section-head { margin-bottom:40px; }
.section-desc { color:var(--grey); font-size:14px; margin-top:8px; }
.text-center { text-align:center; }
.section-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:40px; }
.section-sub { font-size:11px; letter-spacing:.35em; text-transform:uppercase; margin-bottom:8px; }
.view-all { font-size:13px; color:var(--grey); text-decoration:underline; text-underline-offset:4px; transition:color .2s; }
.view-all:hover { color:var(--dark); }

/* Categories */
.cat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
@media(min-width:1024px) { .cat-grid { grid-template-columns:repeat(6,1fr); } }
.cat-card  { border-radius:16px; padding:20px; display:flex; flex-direction:column; align-items:center; gap:12px; transition:transform .2s; }
.cat-card:hover { transform:translateY(-4px); }
.cat-emoji { font-size:36px; }
.cat-name  { font-size:13px; font-weight:500; text-align:center; transition:color .2s; }
.cat-card:hover .cat-name { color:var(--accent); }
.cat-count { font-size:11px; color:#aaa; }

/* Products */
.product-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
@media(min-width:768px)  { .product-grid { grid-template-columns:repeat(3,1fr); } }
@media(min-width:1024px) { .product-grid { grid-template-columns:repeat(4,1fr); } }

/* About */
.about-section { background:var(--mid); color:white; padding:80px 0; }
.about-inner   { display:flex; flex-direction:column; gap:64px; align-items:center; }
@media(min-width:1024px) { .about-inner { flex-direction:row; } }
.about-text  { flex:1; text-align:center; }
@media(min-width:1024px) { .about-text { text-align:left; } }
.about-sub   { font-size:11px; letter-spacing:.4em; text-transform:uppercase; color:var(--accent); margin-bottom:16px; }
.about-title { font-size:clamp(28px,4vw,44px); line-height:1.15; margin-bottom:24px; }
.about-desc  { color:#b0a898; font-size:15px; line-height:1.7; max-width:480px; margin:0 auto 16px; }
@media(min-width:1024px) { .about-desc { margin:0 0 16px; } }
.stats-grid  { flex:1; display:grid; grid-template-columns:repeat(2,1fr); gap:1px; background:#44304d; width:100%; max-width:480px; }
@media(min-width:1024px) { .stats-grid { max-width:none; } }
.stat-box    { background:var(--mid); padding:40px; text-align:center; }
.stat-label  { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--grey); }

/* Gift Banner */
.gift-banner { background:#f3e8ff; border-radius:24px; padding:48px; display:flex; flex-direction:column; gap:32px; align-items:center; justify-content:space-between; margin-top:64px; }
@media(min-width:1024px) { .gift-banner { flex-direction:row; } }

/* Newsletter */
.newsletter       { padding:80px 0; background:var(--cream); border-top:1px solid var(--beige); text-align:center; }
.newsletter-inner { max-width:560px; margin:0 auto; padding:0 24px; }
.nl-form  { display:flex; max-width:440px; margin:0 auto; }
.nl-input { flex:1; padding:14px 20px; border:1px solid var(--brown); font-size:14px; outline:none; transition:border-color .2s; }
.nl-input:focus { border-color:var(--accent); }
.nl-success { color:var(--green); font-weight:500; font-size:18px; }
</style>
