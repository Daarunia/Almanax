<script setup lang="ts">
// Groupe de "pills" mutuellement exclusives (un choix toujours sélectionné).
const model = defineModel<string>({ required: true })

defineProps<{
  label: string
  options: readonly { value: string; label: string }[]
  activeClass: string
}>()
</script>

<template>
  <div>
    <span class="block mb-1 text-sm font-medium text-gray-600">{{ label }}</span>
    <div class="flex flex-wrap gap-2">
      <button v-for="o in options" :key="o.value" type="button" @click="model = o.value"
        class="px-3 py-1 rounded-xl text-sm border transition-colors"
        :class="model === o.value
          ? activeClass
          : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'">
        {{ o.label }}
      </button>
    </div>
  </div>
</template>
