<script setup lang="ts">
// Les 3 filtres "pills" (type / statut / bonus) sous un seul v-model objet.
import { TYPE_FILTERS, STATUS_FILTERS, BONUS_MODES } from '../constants'
import type { PillFilterValues } from '../almanax'
import FilterPills from './FilterPills.vue'

const model = defineModel<PillFilterValues>({ required: true })

defineProps<{
  showBonus: boolean // le bonus n'a de sens qu'en vue "par jour"
}>()

const set = (patch: Partial<PillFilterValues>) => {
  model.value = { ...model.value, ...patch }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-700">Filtres</h3>

    <FilterPills :model-value="model.type" @update:model-value="(v) => set({ type: v })"
      label="Type" :options="TYPE_FILTERS" class="mb-3"
      active-class="bg-blue-600 text-white border-blue-600" />

    <FilterPills :model-value="model.status" @update:model-value="(v) => set({ status: v })"
      label="Statut" :options="STATUS_FILTERS"
      active-class="bg-green-600 text-white border-green-600" />

    <FilterPills v-if="showBonus" :model-value="model.bonus" @update:model-value="(v) => set({ bonus: v })"
      label="Bonus du jour" :options="BONUS_MODES" class="mt-3"
      active-class="bg-amber-500 text-white border-amber-500" />
  </div>
</template>
