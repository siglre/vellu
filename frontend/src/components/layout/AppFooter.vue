<template>
  <footer>
    <div class="container">
      <div class="grid">
        <div class="brand">
          <div class="serif" style="font-size:28px;letter-spacing:.25em;font-style:italic">vellu</div>
          <div class="sub">Москва · с любовью</div>
          <p class="about">Мягкие игрушки и подарки, созданные с любовью. Vellu — бархатная нежность для любого возраста.</p>
          <div class="social">
            <a v-for="s in socials" :key="s.name" href="#" class="social-btn" :title="s.name">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" v-html="s.icon"/>
            </a>
          </div>
        </div>
        <div v-for="(links, title) in columns" :key="title" class="col">
          <h4>{{ title }}</h4>
          <ul>
            <li v-for="link in links" :key="link.label">
              <RouterLink v-if="link.to" :to="link.to">{{ link.label }}</RouterLink>
              <a v-else href="#" @click.prevent="ui.notify(link.label + ' — скоро!')">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="bottom">
        <p>© 2025 Vellu · ООО «Веллу». Все права защищены.</p>
        <div class="payments">
          <span v-for="p in ['VISA','МИР','MC','SBP']" :key="p" class="payment">{{ p }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useUiStore } from '@/stores/ui';
const ui = useUiStore();

const socials = [
  { name: 'Instagram', icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>' },
  { name: 'ВКонтакте', icon: '<path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.146-1.745-1.146-.356 0-.458.102-.458.593v1.575c0 .424-.135.677-1.253.677-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.339-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>' },
  { name: 'Pinterest', icon: '<path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>' },
  { name: 'Telegram',  icon: '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>' },
];
const columns = {
  'Каталог':    [{ label:'Новинки', to:'/catalog?tag=Новый' }, { label:'Хиты продаж', to:'/catalog' }, { label:'Скидки', to:'/catalog?sale=1' }],
  'Помощь':     [{ label:'Вопросы и ответы' }, { label:'Доставка и возврат' }, { label:'Связаться с нами' }],
  'О компании': [{ label:'Наша история' }, { label:'Дизайн-студия' }, { label:'Вакансии' }],
};
</script>

<style scoped>
footer { background:var(--dark); color:white; padding:64px 0 32px; }
.grid  { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:40px; margin-bottom:56px; }
@media(max-width:768px) { .grid { grid-template-columns:1fr 1fr; } .brand { grid-column:1/-1; } }
.sub   { font-size:9px; letter-spacing:.4em; color:#555; text-transform:uppercase; margin-bottom:20px; }
.about { color:#888; font-size:14px; line-height:1.7; max-width:280px; margin-bottom:24px; }
.social { display:flex; gap:12px; }
.social-btn { width:36px; height:36px; border:1px solid #333; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#666; font-size:11px; transition:all .2s; }
.social-btn:hover { color:white; border-color:white; }
h4 { font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:#888; margin-bottom:20px; }
ul { display:flex; flex-direction:column; gap:12px; }
li a { font-size:14px; color:#666; transition:color .2s; }
li a:hover { color:white; }
.bottom { border-top:1px solid #333; padding-top:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }
.bottom p { font-size:12px; color:#555; }
.payments { display:flex; gap:8px; }
.payment  { border:1px solid #333; border-radius:4px; padding:4px 8px; font-size:9px; letter-spacing:.1em; color:#555; }
</style>
