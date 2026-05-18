<template>
  <main>
    <div class="catalog-hero">
      <div class="container">
        <h1 class="serif">Каталог</h1>
        <p>{{ total }} товаров</p>
      </div>
    </div>

    <div class="container">
      <!-- Быстрые фильтры -->
      <div class="filter-bar">
        <button :class="['filter-btn', { active: !activeCategory }]" @click="setCategory('')">Все</button>
        <button v-for="c in categories" :key="c.id"
          :class="['filter-btn', { active: activeCategory === c.name }]"
          @click="setCategory(c.name)">
          <img :src="emojiUrl(c.emoji)" :alt="c.name" width="18" height="18"/>{{ c.name }}
        </button>
      </div>

      <div class="layout">
        <!-- Сайдбар -->
        <aside class="sidebar">
          <div class="sidebar-section">
            <h4 class="sidebar-title">Поиск</h4>
            <input v-model="search" type="text" class="price-input" placeholder="Название игрушки..." style="width:100%"/>
          </div>
          <div class="sidebar-section">
            <h4 class="sidebar-title">Цена, ₽</h4>
            <div class="price-row">
              <div class="price-field">
                <span class="price-hint">от</span>
                <input v-model.number="priceMin" type="number" class="price-input"/>
              </div>
              <div class="price-field">
                <span class="price-hint">до</span>
                <input v-model.number="priceMax" type="number" class="price-input"/>
              </div>
            </div>
          </div>
          <div class="sidebar-section">
            <h4 class="sidebar-title">Метка</h4>
            <label v-for="t in ['Хит','Новый','Популярный']" :key="t" class="check-row">
              <input type="radio" v-model="selectedTag" :value="t"/> {{ t }}
            </label>
            <label class="check-row">
              <input type="radio" v-model="selectedTag" :value="''"/> Все
            </label>
          </div>
          <div class="sidebar-section">
            <h4 class="sidebar-title">В наличии</h4>
            <label class="check-row"><input v-model="inStock" type="checkbox"/> Только в наличии</label>
          </div>
        </aside>

        <!-- Товары -->
        <div class="products-col">
          <div class="sort-bar">
            <span class="result">{{ total }} товаров</span>
            <select v-model="sort" class="sort-select">
              <option value="newest">По новизне</option>
              <option value="price_asc">Цена: по возрастанию</option>
              <option value="price_desc">Цена: по убыванию</option>
              <option value="name">По названию</option>
            </select>
          </div>

          <div v-if="loading" class="product-grid">
            <div v-for="n in 12" :key="n" class="skeleton" style="height:360px;border-radius:16px"/>
          </div>
          <div v-else-if="products.length" class="product-grid">
            <ProductCard v-for="p in products" :key="p.id" :product="p" />
          </div>
          <div v-else class="empty">
            <p>😔 Товары не найдены</p>
            <button class="btn btn-dark btn-sm" style="margin-top:16px" @click="reset">Сбросить фильтры</button>
          </div>

          <!-- Пагинация -->
          <div v-if="total > limit" class="pagination">
            <button class="btn btn-outline btn-sm" :disabled="offset === 0" @click="offset = Math.max(0, offset - limit)">← Назад</button>
            <span>{{ Math.floor(offset/limit) + 1 }} / {{ Math.ceil(total/limit) }}</span>
            <button class="btn btn-outline btn-sm" :disabled="offset + limit >= total" @click="offset += limit">Вперёд →</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

function useDebounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
import { useRoute, useRouter } from 'vue-router';

function emojiUrl(emoji) {
  const cp = [...emoji].map(c => c.codePointAt(0).toString(16)).filter(c => c !== 'fe0f').join('-');
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${cp}.png`;
}
import { productsApi, categoriesApi } from '@/api';
import ProductCard from '@/components/product/ProductCard.vue';

const route  = useRoute();
const router = useRouter();

const products       = ref([]);
const categories     = ref([]);
const total          = ref(0);
const loading        = ref(true);
const activeCategory = ref(route.query.category || '');
const sort           = ref(route.query.sort || 'newest');
const priceMin       = ref(0);
const priceMax       = ref(10000);
const inStock        = ref(false);
const search         = ref('');
const selectedTag    = ref(route.query.tag || '');
const limit          = ref(12);
const offset         = ref(0);

async function load() {
  loading.value = true;
  try {
    const params = { sort: sort.value, limit: limit.value, offset: offset.value };
    if (activeCategory.value) params.category = activeCategory.value;
    if (selectedTag.value) params.tag = selectedTag.value;
    if (search.value) params.search = search.value;
    if (priceMin.value > 0) params.price_min = priceMin.value;
    if (priceMax.value < 10000) params.price_max = priceMax.value;
    if (inStock.value) params.in_stock = true;
    const { data } = await productsApi.list(params);
    products.value = data.products;
    total.value    = data.total;
  } finally {
    loading.value = false;
  }
}

function setCategory(cat) {
  activeCategory.value = cat;
  offset.value = 0;
  router.replace({ query: { ...route.query, category: cat || undefined } });
}

function reset() {
  activeCategory.value = '';
  sort.value    = 'newest';
  priceMin.value = 0;
  priceMax.value = 10000;
  offset.value  = 0;
}

const loadDebounced = useDebounce(() => { offset.value = 0; load(); }, 400);

watch(() => route.query.category, (cat) => { activeCategory.value = cat || ''; offset.value = 0; });
watch(() => route.query.tag, () => { offset.value = 0; load(); });
watch([sort, activeCategory, offset, selectedTag], load);
watch([priceMin, priceMax], loadDebounced);
watch(search, loadDebounced);
watch(inStock, () => { offset.value = 0; load(); });
onMounted(async () => {
  const { data } = await categoriesApi.list();
  categories.value = data;
  await load();
});
</script>

<style scoped>
.catalog-hero { background:var(--cream2); padding:48px 0 32px; text-align:center; border-bottom:1px solid var(--beige); }
.catalog-hero h1 { font-size:40px; margin-bottom:8px; }
.catalog-hero p  { color:var(--grey); font-size:14px; }
.filter-bar { display:flex; gap:8px; flex-wrap:wrap; padding:24px 0; }
.filter-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 20px; border:1px solid var(--brown); border-radius:99px; font-size:13px; transition:all .2s; }
.filter-btn:hover, .filter-btn.active { border-color:var(--accent); background:var(--accent); color:white; }
.layout  { display:flex; padding:40px 0; align-items:flex-start; }
.sidebar { display:flex; flex-direction:column; flex-shrink:0; width:200px; position:sticky; top:80px; padding-right:32px; margin-right:8px; }
.products-col { flex:1; min-width:0; overflow:hidden; border-left:1px solid var(--beige); padding-left:40px; }
@media(max-width:768px) { .layout { flex-direction:column; } .sidebar { display:none; } }
.sidebar-section { margin-bottom:28px; }
.sidebar-title   { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--grey); margin-bottom:12px; }
.price-row   { display:flex; gap:8px; }
.price-field { display:flex; flex-direction:column; gap:4px; flex:1; }
.price-hint  { font-size:11px; color:var(--grey); letter-spacing:.05em; }
.price-input { width:100%; padding:8px 10px; border:1px solid var(--brown); font-size:13px; outline:none; }
.price-input:focus { border-color:var(--accent); }
.check-row  { display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer; margin-bottom:6px; }
.check-row input[type="radio"] { accent-color:var(--accent); cursor:pointer; }
.check-row input { accent-color:var(--accent); }
.sort-bar   { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
.result     { font-size:14px; color:var(--grey); }
.sort-select { padding:8px 14px; border:1px solid var(--brown); font-size:13px; outline:none; background:white; }
.product-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
@media(min-width:768px) { .product-grid { grid-template-columns:repeat(3,1fr); } }
.empty { text-align:center; padding:80px 0; color:var(--grey); font-size:16px; }
.pagination { display:flex; align-items:center; justify-content:center; gap:24px; margin-top:48px; }
.pagination span { font-size:14px; color:var(--grey); }
</style>
