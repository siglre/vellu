<template>
  <main>
    <div class="admin-bar">
      <div class="admin-logo serif">vellu · Панель управления</div>
      <span class="admin-user">{{ auth.user?.name }}</span>
    </div>

    <div class="container" style="padding:32px 24px">
      <div class="admin-tabs">
        <button v-for="tab in tabs" :key="tab.key"
          :class="['admin-tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Статистика -->
      <div v-if="activeTab === 'stats'">
        <div v-if="loadingStats" class="stats-grid">
          <div v-for="n in 4" :key="n" class="skeleton" style="height:100px;border-radius:12px"/>
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card"><div class="stat-num">₽{{ stats.revenue?.toLocaleString('ru') }}</div><div class="stat-lbl">Выручка</div></div>
          <div class="stat-card"><div class="stat-num">{{ stats.orders }}</div><div class="stat-lbl">Заказов</div><div class="stat-new">{{ stats.newOrders }} новых</div></div>
          <div class="stat-card"><div class="stat-num">{{ stats.users }}</div><div class="stat-lbl">Пользователей</div></div>
          <div class="stat-card"><div class="stat-num">{{ (stats.revenue / (stats.orders||1)).toLocaleString('ru', {maximumFractionDigits:0}) }}₽</div><div class="stat-lbl">Средний чек</div></div>
        </div>
        <div v-if="stats.topProducts?.length" class="admin-card" style="margin-top:24px">
          <h3>Топ товаров</h3>
          <table class="admin-table">
            <thead><tr><th>Товар</th><th>Продано</th><th>Выручка</th></tr></thead>
            <tbody>
              <tr v-for="p in stats.topProducts" :key="p.name">
                <td>{{ p.name }}</td><td>{{ p.sold }}</td>
                <td>₽{{ Number(p.revenue).toLocaleString('ru') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Заказы -->
      <div v-if="activeTab === 'orders'">
        <div class="admin-card">
          <h3>Заказы</h3>
          <div v-if="loadingOrders" style="color:var(--grey);padding:24px">Загрузка...</div>
          <table v-else class="admin-table">
            <thead><tr><th>ID</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Дата</th><th></th></tr></thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id">
                <td style="font-family:monospace;font-size:12px">{{ o.id.slice(0,8) }}…</td>
                <td>{{ o.customer_name }}</td>
                <td>₽{{ Number(o.total).toLocaleString('ru') }}</td>
                <td><span :class="['badge', statusClass(o.status)]">{{ o.status }}</span></td>
                <td style="color:var(--grey);font-size:13px">{{ new Date(o.created_at).toLocaleDateString('ru') }}</td>
                <td>
                  <select :value="o.status" @change="updateStatus(o.id, $event.target.value)" class="sort-select" style="font-size:12px;padding:4px 8px">
                    <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Товары -->
      <div v-if="activeTab === 'products'">
        <div class="admin-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Все товары ({{ products.length }})</h3>
            <button class="btn btn-dark btn-sm" @click="openProductModal(null)">+ Добавить</button>
          </div>
          <div class="prod-grid">
            <div v-for="p in products" :key="p.id" class="prod-card" :class="{ inactive: p.is_active === false }">
              <img :src="p.image_url || '/placeholder.jpg'" :alt="p.name" class="prod-img"/>
              <div style="padding:12px">
                <p style="font-size:13px;font-weight:500;margin-bottom:4px">{{ p.name }}</p>
                <p style="font-size:12px;color:var(--grey)">₽{{ Number(p.price).toLocaleString('ru') }} · Склад: {{ p.stock }}</p>
                <div style="display:flex;gap:8px;margin-top:10px">
                  <button class="btn btn-outline btn-sm" @click="openProductModal(p)">Изменить</button>
                  <button class="btn btn-sm" style="border:1px solid var(--accent);color:var(--accent)" @click="toggleProduct(p)">
                    {{ p.is_active === false ? 'Показать' : 'Скрыть' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Категории -->
      <div v-if="activeTab === 'categories'">
        <div class="admin-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Категории</h3>
            <button class="btn btn-dark btn-sm" @click="openCatModal(null)">+ Добавить</button>
          </div>
          <div class="cat-list">
            <div v-for="c in categories" :key="c.id" class="cat-row">
              <span class="cat-emoji">{{ c.emoji }}</span>
              <span class="cat-name">{{ c.name }}</span>
              <span class="cat-count">{{ c.product_count }} товаров</span>
              <div class="cat-actions">
                <button class="btn btn-outline btn-sm" @click="openCatModal(c)">Изменить</button>
                <button class="btn btn-sm" style="border:1px solid #e53935;color:#e53935"
                  @click="deleteCategory(c)"
                  :disabled="Number(c.product_count) > 0"
                  :title="Number(c.product_count) > 0 ? 'Нельзя удалить: есть товары' : ''">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования товара -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="productModal.open" class="modal-wrap">
          <div class="backdrop" @click="closeProductModal"/>
          <div class="modal-box">
            <button class="modal-close" @click="closeProductModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <h3 class="modal-title">{{ productModal.isNew ? 'Новый товар' : 'Редактировать товар' }}</h3>

            <form @submit.prevent="saveProduct" class="pf">
              <div class="pf-row">
                <div class="pf-group">
                  <label class="pf-label">Название *</label>
                  <input v-model="pf.name" class="pf-input" required placeholder="Мягкий зайка"/>
                </div>
                <div class="pf-group" style="max-width:140px">
                  <label class="pf-label">Цена, ₽ *</label>
                  <input v-model.number="pf.price" class="pf-input" type="number" min="0" step="0.01" required/>
                </div>
              </div>

              <div class="pf-group">
                <label class="pf-label">Описание</label>
                <textarea v-model="pf.description" class="pf-input pf-textarea" rows="3" placeholder="Описание товара..."/>
              </div>

              <div class="pf-row">
                <div class="pf-group">
                  <label class="pf-label">Категория *</label>
                  <select v-model="pf.category_id" class="pf-input" required>
                    <option value="" disabled>Выберите...</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.emoji }} {{ c.name }}</option>
                  </select>
                </div>
                <div class="pf-group">
                  <label class="pf-label">Тег</label>
                  <input v-model="pf.tag" class="pf-input" placeholder="Новый, Хит..."/>
                </div>
                <div class="pf-group" style="max-width:120px">
                  <label class="pf-label">На складе</label>
                  <input v-model.number="pf.stock" class="pf-input" type="number" min="0"/>
                </div>
              </div>

              <!-- Изображение -->
              <div class="pf-group">
                <label class="pf-label">Изображение</label>

                <!-- Превью -->
                <img v-if="pf.image_url" :src="pf.image_url" class="pf-preview" @error="e => e.target.style.display='none'"/>

                <!-- Кнопки -->
                <div class="img-actions">
                  <button type="button" class="img-btn" :class="{ active: imgPickerOpen }" @click="togglePicker">
                    🖼 Библиотека
                  </button>
                  <label class="img-btn" :class="{ uploading: imgUploading }">
                    <input type="file" accept="image/*" style="display:none" @change="handleImageFile"/>
                    <span v-if="imgUploading">⏳</span>
                    <span v-else>📁 Загрузить</span>
                  </label>
                </div>

                <!-- Библиотека -->
                <div v-if="imgPickerOpen" class="img-picker">
                  <div v-if="imagesLoading" class="img-picker-empty">Загрузка...</div>
                  <div v-else class="img-picker-grid">
                    <button v-for="img in availableImages" :key="img"
                      type="button"
                      class="img-thumb"
                      :class="{ selected: pf.image_url === img }"
                      @click="selectImage(img)">
                      <img :src="img" :alt="img" loading="lazy"/>
                    </button>
                  </div>
                </div>

                <div class="pf-or">или вставьте ссылку</div>
                <input v-model="pf.image_url" class="pf-input" placeholder="/images/products/..."/>
              </div>

              <!-- Размеры -->
              <div class="pf-group">
                <label class="pf-label">Размеры и цены</label>
                <div class="sizes-editor">
                  <div v-for="(s, i) in pf.sizes" :key="i" class="size-row">
                    <input v-model="s.name" class="pf-input size-name" placeholder="Маленький"/>
                    <input v-model.number="s.price" class="pf-input size-price" type="number" min="0" step="1" placeholder="Цена ₽"/>
                    <button type="button" class="size-del" @click="pf.sizes.splice(i, 1)">×</button>
                  </div>
                  <button type="button" class="size-add" @click="pf.sizes.push({ name:'', price:'' })">+ размер</button>
                </div>
                <p class="pf-hint" v-if="pf.sizes.some(s => s.price)">
                  Базовая цена автоматически = минимальная из размеров
                </p>
              </div>

              <p v-if="productModal.error" class="pf-error">{{ productModal.error }}</p>

              <div class="pf-actions">
                <button type="button" class="btn btn-outline btn-sm" @click="closeProductModal">Отмена</button>
                <button type="submit" class="btn btn-dark btn-sm" :disabled="productModal.saving">
                  {{ productModal.saving ? 'Сохраняем...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Модальное окно категории -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="catModal.open" class="modal-wrap">
          <div class="backdrop" @click="closeCatModal"/>
          <div class="modal-box" style="max-width:400px">
            <button class="modal-close" @click="closeCatModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h3 class="modal-title">{{ catModal.isNew ? 'Новая категория' : 'Изменить категорию' }}</h3>
            <form @submit.prevent="saveCat" class="pf">
              <div class="pf-row">
                <div class="pf-group" style="max-width:72px">
                  <label class="pf-label">Эмодзи</label>
                  <input v-model="cf.emoji" class="pf-input" style="font-size:22px;text-align:center" placeholder="🧸"/>
                </div>
                <div class="pf-group">
                  <label class="pf-label">Название *</label>
                  <input v-model="cf.name" class="pf-input" required placeholder="Животные"/>
                </div>
              </div>
              <p v-if="catModal.error" class="pf-error">{{ catModal.error }}</p>
              <div class="pf-actions">
                <button type="button" class="btn btn-outline btn-sm" @click="closeCatModal">Отмена</button>
                <button type="submit" class="btn btn-dark btn-sm" :disabled="catModal.saving">
                  {{ catModal.saving ? 'Сохраняем...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, watchEffect } from 'vue';
import { adminApi, ordersApi, productsApi, categoriesApi, uploadApi, imagesApi } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { useUiStore   } from '@/stores/ui';

const auth = useAuthStore();
const ui   = useUiStore();

const activeTab    = ref('stats');
const stats        = ref({});
const orders       = ref([]);
const products     = ref([]);
const categories   = ref([]);
const loadingStats  = ref(true);
const loadingOrders = ref(false);

// ---- Товары ----
const emptyPf = () => ({ name:'', description:'', price:0, category_id:'', tag:'', image_url:'', stock:0, sizes:[] });
const pf = ref(emptyPf());
const productModal = ref({ open:false, isNew:true, editId:null, saving:false, error:'' });

function openProductModal(product) {
  productModal.value = { open:true, isNew:!product, editId:product?.id ?? null, saving:false, error:'' };
  imgPickerOpen.value = false;
  pf.value = product
    ? {
        ...product,
        sizes: (product.sizes || []).map(s =>
          typeof s === 'string' ? { name: s, price: '' } : { name: s.name, price: s.price ?? '' }
        ),
      }
    : emptyPf();
}
function closeProductModal() { productModal.value.open = false; imgPickerOpen.value = false; }

const imgUploading = ref(false);
async function handleImageFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  imgUploading.value = true;
  try {
    const { data } = await uploadApi.image(file);
    pf.value.image_url = data.url;
    imgPickerOpen.value = false;
  } catch {
    ui.notify('Ошибка загрузки файла');
  } finally {
    imgUploading.value = false;
  }
}

// Auto-update base price to min of size prices
watch(() => pf.value.sizes, (sizes) => {
  const prices = sizes.map(s => parseFloat(s.price)).filter(p => !isNaN(p) && p > 0);
  if (prices.length > 0) pf.value.price = Math.min(...prices);
}, { deep: true });

// ---- Image picker ----
const imgPickerOpen   = ref(false);
const availableImages = ref([]);
const imagesLoading   = ref(false);

async function togglePicker() {
  imgPickerOpen.value = !imgPickerOpen.value;
  if (imgPickerOpen.value && availableImages.value.length === 0) {
    imagesLoading.value = true;
    try {
      const { data } = await imagesApi.list();
      availableImages.value = data;
    } finally {
      imagesLoading.value = false;
    }
  }
}

function selectImage(url) {
  pf.value.image_url = url;
  imgPickerOpen.value = false;
}

async function saveProduct() {
  productModal.value.saving = true;
  productModal.value.error  = '';
  try {
    const payload = {
      name:        pf.value.name,
      description: pf.value.description,
      price:       pf.value.price,
      category_id: pf.value.category_id,
      tag:         pf.value.tag || null,
      image_url:   pf.value.image_url || null,
      images:      pf.value.image_url ? [pf.value.image_url] : [],
      stock:       pf.value.stock,
      sizes:       pf.value.sizesRaw ? pf.value.sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    if (productModal.value.isNew) {
      await productsApi.create(payload);
      ui.notify('Товар создан');
    } else {
      await productsApi.update(productModal.value.editId, payload);
      ui.notify('Товар сохранён');
    }
    closeProductModal();
    await loadProducts();
  } catch (e) {
    productModal.value.error = e.response?.data?.errors?.[0]?.msg || e.response?.data?.error || 'Ошибка сохранения';
  } finally {
    productModal.value.saving = false;
  }
}

// ---- Категории ----
const cf = ref({ name:'', emoji:'' });
const catModal = ref({ open:false, isNew:true, editId:null, saving:false, error:'' });

function openCatModal(cat) {
  catModal.value = { open:true, isNew:!cat, editId:cat?.id ?? null, saving:false, error:'' };
  cf.value = cat ? { name: cat.name, emoji: cat.emoji } : { name:'', emoji:'' };
}
function closeCatModal() { catModal.value.open = false; }

async function saveCat() {
  catModal.value.saving = true;
  catModal.value.error  = '';
  try {
    if (catModal.value.isNew) {
      await categoriesApi.create(cf.value);
      ui.notify('Категория создана');
    } else {
      await categoriesApi.update(catModal.value.editId, cf.value);
      ui.notify('Категория обновлена');
    }
    closeCatModal();
    await loadCategories();
  } catch (e) {
    catModal.value.error = e.response?.data?.error || 'Ошибка сохранения';
  } finally {
    catModal.value.saving = false;
  }
}

async function deleteCategory(cat) {
  if (!confirm(`Удалить категорию «${cat.name}»?`)) return;
  try {
    await categoriesApi.remove(cat.id);
    ui.notify('Категория удалена');
    await loadCategories();
  } catch (e) {
    ui.notify(e.response?.data?.error || 'Ошибка удаления');
  }
}

// ---- Data loading ----
const tabs = [
  { key:'stats',      icon:'📊', label:'Статистика' },
  { key:'orders',     icon:'📦', label:'Заказы' },
  { key:'products',   icon:'🧸', label:'Товары' },
  { key:'categories', icon:'⊞', label:'Категории' },
];
const statuses = ['new','paid','processing','shipped','delivered','cancelled','refund'];

function statusClass(s) {
  return { new:'badge-green', paid:'badge-green', shipped:'badge-grey', delivered:'badge-grey', cancelled:'badge-red', refund:'badge-red' }[s] || 'badge-grey';
}

async function loadStats() {
  loadingStats.value = true;
  const { data } = await adminApi.stats();
  stats.value = data;
  loadingStats.value = false;
}

async function loadOrders() {
  loadingOrders.value = true;
  const { data } = await ordersApi.adminList();
  orders.value = data;
  loadingOrders.value = false;
}

async function loadCategories() {
  const { data } = await categoriesApi.list();
  categories.value = data;
}

async function loadProducts() {
  const [prod, cats] = await Promise.all([
    productsApi.list({ limit:100, include_inactive: true }),
    categoriesApi.list(),
  ]);
  products.value   = prod.data.products;
  categories.value = cats.data;
}

async function updateStatus(id, status) {
  await ordersApi.updateStatus(id, status);
  await loadOrders();
  ui.notify('Статус обновлён');
}

async function toggleProduct(p) {
  await productsApi.update(p.id, { is_active: p.is_active === false ? true : false });
  await loadProducts();
}

watch(activeTab, (tab) => {
  if (tab === 'stats')      loadStats();
  if (tab === 'orders')     loadOrders();
  if (tab === 'products')   loadProducts();
  if (tab === 'categories') loadCategories();
});

onMounted(loadStats);
</script>

<style scoped>
.admin-bar  { background:var(--mid); color:white; padding:0 24px; height:60px; display:flex; align-items:center; justify-content:space-between; }
.admin-logo { font-size:18px; letter-spacing:.1em; font-style:italic; }
.admin-user { font-size:13px; color:#aaa; }
.admin-tabs { display:flex; gap:4px; margin-bottom:28px; background:white; padding:6px; border-radius:12px; width:fit-content; box-shadow:0 1px 4px rgba(0,0,0,.06); flex-wrap:wrap; }
.admin-tab  { padding:8px 20px; border-radius:8px; font-size:13px; color:var(--grey); transition:all .2s; }
.admin-tab.active { background:var(--mid); color:white; }
.stats-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
@media(min-width:768px) { .stats-grid { grid-template-columns:repeat(4,1fr); } }
.stat-card  { background:white; border-radius:12px; padding:24px; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.stat-num   { font-family:'Playfair Display',serif; font-size:32px; }
.stat-lbl   { font-size:12px; color:var(--grey); margin-top:4px; }
.stat-new   { font-size:12px; color:var(--green); margin-top:8px; }
.admin-card { background:white; border-radius:12px; padding:24px; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.admin-card h3 { margin-bottom:20px; font-size:15px; }
.admin-table { width:100%; border-collapse:collapse; }
.admin-table th { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--grey); padding:8px 12px; text-align:left; border-bottom:1px solid var(--beige); }
.admin-table td { padding:12px; font-size:14px; border-bottom:1px solid var(--beige); }
.admin-table tr:last-child td { border-bottom:none; }
.admin-table tr:hover td { background:var(--cream); }
.badge { display:inline-block; padding:3px 10px; border-radius:99px; font-size:11px; }
.badge-green { background:#e8f5e9; color:var(--green); }
.badge-red   { background:#f3e8ff; color:var(--accent); }
.badge-grey  { background:#f0f0f0; color:var(--grey); }
.sort-select { border:1px solid var(--brown); outline:none; background:white; font-family:inherit; }

/* Товары */
.prod-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
@media(min-width:768px) { .prod-grid { grid-template-columns:repeat(3,1fr); } }
@media(min-width:1200px) { .prod-grid { grid-template-columns:repeat(4,1fr); } }
.prod-card { border:1px solid var(--beige); border-radius:10px; overflow:hidden; }
.prod-card.inactive { opacity:.45; }
.prod-img  { width:100%; aspect-ratio:1; object-fit:cover; background:var(--cream2); }

/* Категории */
.cat-list { display:flex; flex-direction:column; gap:2px; }
.cat-row  { display:flex; align-items:center; gap:14px; padding:12px 8px; border-radius:8px; transition:background .15s; }
.cat-row:hover { background:var(--cream); }
.cat-emoji { font-size:22px; width:32px; text-align:center; }
.cat-name  { font-size:15px; flex:1; }
.cat-count { font-size:12px; color:var(--grey); min-width:80px; text-align:right; }
.cat-actions { display:flex; gap:8px; }

/* Модальное окно */
.modal-wrap  { position:fixed; inset:0; z-index:500; display:flex; align-items:center; justify-content:center; padding:16px; }
.backdrop    { position:absolute; inset:0; background:rgba(0,0,0,.55); }
.modal-box   { position:relative; background:white; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; padding:36px; border-radius:16px; z-index:1; }
.modal-close { position:absolute; top:16px; right:16px; color:var(--grey); }
.modal-close:hover { color:var(--dark); }
.modal-title { font-size:18px; font-weight:600; margin-bottom:24px; }

/* Форма товара */
.pf          { display:flex; flex-direction:column; gap:16px; }
.pf-row      { display:flex; gap:16px; flex-wrap:wrap; }
.pf-row .pf-group { flex:1; min-width:140px; }
.pf-group    { display:flex; flex-direction:column; gap:6px; }
.pf-label    { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--grey); }
.pf-input    { padding:9px 12px; border:1px solid var(--brown); border-radius:6px; font-size:14px; font-family:inherit; outline:none; width:100%; box-sizing:border-box; }
.pf-input:focus { border-color:var(--accent); }
.pf-textarea { resize:vertical; min-height:72px; }
.pf-preview  { width:100%; max-height:180px; object-fit:contain; border-radius:8px; border:1px solid var(--beige); background:var(--cream2); }
.pf-or { text-align:center; font-size:11px; color:var(--grey); margin:4px 0; letter-spacing:.05em; }
.pf-error    { color:#e53935; font-size:13px; }
.pf-actions  { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; }

/* Кнопки выбора изображения */
.img-actions { display:flex; gap:8px; }
.img-btn {
  flex:1; padding:10px; border:1px dashed var(--brown); border-radius:8px;
  font-size:13px; color:var(--grey); cursor:pointer; text-align:center;
  transition:all .15s; font-family:inherit;
}
.img-btn:hover, .img-btn.active { border-color:var(--accent); color:var(--accent); background:#fdf2f8; border-style:solid; }
.img-btn.uploading { opacity:.6; pointer-events:none; }

/* Библиотека изображений */
.img-picker {
  border:1px solid var(--beige); border-radius:8px;
  max-height:260px; overflow-y:auto; padding:8px;
  background:var(--cream2);
}
.img-picker-empty { padding:20px; text-align:center; color:var(--grey); font-size:13px; }
.img-picker-grid  { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }
@media(max-width:480px) { .img-picker-grid { grid-template-columns:repeat(4,1fr); } }
.img-thumb {
  aspect-ratio:1; border-radius:6px; overflow:hidden;
  border:2px solid transparent; cursor:pointer; padding:0;
  transition:border-color .15s;
}
.img-thumb:hover { border-color:var(--accent); }
.img-thumb.selected { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent); }
.img-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

.modal-enter-active, .modal-leave-active { transition:opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity:0; }
</style>
