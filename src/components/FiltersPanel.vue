<script setup lang="ts">
// Panneau latéral : filtres (pills) + nombre de persos + plage de dates.
import type { PillFilterValues } from '../almanax'
import PillFilters from './PillFilters.vue'

const count = defineModel<number>('count', { required: true })
const startDate = defineModel<Date | null>('startDate', { required: true })
const endDate = defineModel<Date | null>('endDate', { required: true })
const pills = defineModel<PillFilterValues>('pills', { required: true })

defineProps<{
  showBonus: boolean // le bonus n'a de sens qu'en vue "par jour"
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-5 w-full md:w-1/4 md:shrink-0 p-6 rounded md:justify-center md:overflow-y-auto">

    <!-- Filtres (pills) -->
    <PillFilters v-model="pills" :show-bonus="showBonus" />

    <!-- Nombre de personnages -->
    <div class="flex flex-col w-full max-w-sm">
      <label for="count" class="w-full mb-1 font-medium text-gray-700">Nombre de personnages</label>
      <InputNumber id="count" v-model="count" :min="0" :max="100" showButtons fluid class="w-full" inputClass="w-full" />
    </div>

    <!-- Date de début -->
    <div class="flex flex-col w-full max-w-sm">
      <label for="start" class="w-full mb-1 font-medium text-gray-700">Date de début</label>
      <DatePicker id="start" v-model="startDate" :showIcon="true" dateFormat="dd/mm/yy" fluid class="w-full"
        inputClass="w-full" />
    </div>

    <!-- Date de fin -->
    <div class="flex flex-col w-full max-w-sm">
      <label for="end" class="w-full mb-1 font-medium text-gray-700">Date de fin</label>
      <DatePicker id="end" v-model="endDate" :showIcon="true" dateFormat="dd/mm/yy" fluid class="w-full"
        inputClass="w-full" />
    </div>
  </div>
</template>
