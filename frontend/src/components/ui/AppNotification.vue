<!-- AppNotification.vue -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.notif" class="notif">
        {{ ui.notif.message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useUiStore } from '@/stores/ui';
const ui = useUiStore();
</script>

<style scoped>
.notif {
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  background:var(--mid); color:white; padding:12px 24px;
  border-radius:8px; font-size:14px; z-index:1000;
  box-shadow:0 8px 24px rgba(0,0,0,.2); white-space:nowrap;
  pointer-events:none;
}
</style>
