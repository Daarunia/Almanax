<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Almanax from './components/Almanax.vue'

const isDark = ref(false)

const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle('app-dark', dark)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  isDark.value = saved
    ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(isDark.value)
})

watch(isDark, (dark) => {
  applyTheme(dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
})
</script>

<template>
  <button type="button" @click="isDark = !isDark"
    :title="isDark ? 'Passer en clair' : 'Passer en sombre'"
    :aria-label="isDark ? 'Passer en clair' : 'Passer en sombre'"
    class="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
    <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
  </button>

  <Almanax />
</template>
