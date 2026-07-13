<script setup lang="ts">
import { type AlmanaxItem, subtypeLabel } from '../almanax'

defineProps<{
  items: AlmanaxItem[]
  count: number
}>()
</script>

<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
    <li v-for="(item, index) in items" :key="item.object + index"
      class="flex items-center p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <Checkbox binary class="mr-4" v-model="item.purchased"></Checkbox>
      <img v-if="item.image" :src="item.image" :alt="item.object" width="32" height="32" class="mr-3" loading="lazy" />
      <div class="flex flex-col">
        <span class="font-medium text-gray-800 dark:text-gray-500">
          {{ item.object }}
          <span class="ml-1 text-gray-500 dark:text-gray-400">(x{{ item.quantity * count }})</span>
        </span>
        <span class="text-xs text-gray-400">
          {{ new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }) }}
          · {{ subtypeLabel(item.subtype) }}<span v-if="item.itemType"> · {{ item.itemType }}</span>
        </span>
      </div>
    </li>
  </ul>
</template>
