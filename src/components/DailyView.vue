<script setup lang="ts">
import { type AlmanaxItem, itemKey, subtypeLabel, isHarvestable } from '../almanax'
import type { BonusMode } from '../constants'

defineProps<{
  items: AlmanaxItem[]
  count: number
  bonusMode: BonusMode
}>()

const bonusText = (i: AlmanaxItem) =>
  [i.bonusType, i.bonus].filter(Boolean).join(' — ')
</script>

<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
    <li v-for="item in items" :key="itemKey(item)"
      @click="item.purchased = !item.purchased"
      class="flex items-center p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
      <Checkbox binary class="mr-4 pointer-events-none" :modelValue="item.purchased"></Checkbox>
      <img v-if="item.image" :src="item.image" :alt="item.object" width="32" height="32" class="mr-3" loading="lazy" />
      <div class="flex flex-col min-w-0">
        <span class="font-medium text-gray-800 dark:text-gray-500">
          {{ item.object }}
          <span v-if="isHarvestable(item.itemType)" title="Objet récoltable" class="ml-1 cursor-help">⛏️</span>
          <span v-if="item.craftable" title="Objet fabricable (recette)" class="ml-1 cursor-help">🔨</span>
          <span v-if="item.droppable" title="Droppé par un monstre" class="ml-1 cursor-help">💀</span>
          <span class="ml-1 text-gray-500 dark:text-gray-400">(x{{ item.quantity * count }})</span>
          <!-- Mode infobulle : une étoile survolable -->
          <i v-if="item.bonus && bonusMode === 'tooltip'" class="pi pi-star-fill ml-1 text-amber-500"
            style="font-size: 0.65rem" :title="bonusText(item)"></i>
        </span>
        <span class="text-xs text-gray-400">
          {{ new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }) }}
          · {{ subtypeLabel(item.subtype) }}<span v-if="item.itemType"> · {{ item.itemType }}</span>
        </span>
        <!-- Mode affiché : la ligne complète -->
        <span v-if="item.bonus && bonusMode === 'inline'" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
          <i class="pi pi-star-fill mr-1" style="font-size: 0.65rem"></i>
          <span v-if="item.bonusType" class="font-medium">{{ item.bonusType }}</span>
          <span class="text-amber-700/70 dark:text-amber-300/70"> — {{ item.bonus }}</span>
        </span>
      </div>
    </li>
  </ul>
</template>
