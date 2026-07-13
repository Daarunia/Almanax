<script setup lang="ts">
import { type GroceryEntry, subtypeLabel, isGathered, isHarvestable } from '../almanax'

defineProps<{
  entries: GroceryEntry[]
  count: number
}>()

// Coche/décoche toutes les occurrences (jours) d'une entrée regroupée.
const toggleGathered = (entry: GroceryEntry) => {
  const next = !isGathered(entry)
  entry.refs.forEach((i) => (i.purchased = next))
}
</script>

<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
    <li v-for="entry in entries" :key="entry.object"
      class="flex items-center p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border border-gray-200 dark:border-gray-700"
      :class="{ 'opacity-50': isGathered(entry) }">
      <Checkbox binary class="mr-4" :modelValue="isGathered(entry)" @change="toggleGathered(entry)"></Checkbox>
      <img v-if="entry.image" :src="entry.image" :alt="entry.object" width="32" height="32" class="mr-3" loading="lazy" />
      <div class="flex flex-col">
        <span class="font-medium text-gray-800 dark:text-gray-500">
          {{ entry.object }}
          <span v-if="isHarvestable(entry.itemType)" title="Objet récoltable" class="ml-1 cursor-help">⛏️</span>
          <span class="ml-1 font-semibold text-blue-600 dark:text-blue-400">×{{ entry.total * count }}</span>
        </span>
        <span class="text-xs text-gray-400">
          {{ subtypeLabel(entry.subtype) }}<span v-if="entry.itemType"> · {{ entry.itemType }}</span>
          · {{ entry.days }} jour{{ entry.days > 1 ? 's' : '' }}
        </span>
      </div>
    </li>
  </ul>
</template>
