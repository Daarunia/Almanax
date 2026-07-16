<script setup lang="ts">
// Panneau latéral : filtres (pills) + nombre de persos + plage de dates.
import {
  TYPE_FILTERS, STATUS_FILTERS, BONUS_MODES,
  type TypeFilter, type StatusFilter, type BonusMode,
} from '../constants'
import FilterPills from './FilterPills.vue'

const count = defineModel<number>('count', { required: true })
const startDate = defineModel<Date | null>('startDate', { required: true })
const endDate = defineModel<Date | null>('endDate', { required: true })
const typeFilter = defineModel<TypeFilter>('typeFilter', { required: true })
const statusFilter = defineModel<StatusFilter>('statusFilter', { required: true })
const bonusMode = defineModel<BonusMode>('bonusMode', { required: true })

defineProps<{
  showBonus: boolean // le bonus n'a de sens qu'en vue "par jour"
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-5 w-full md:w-1/4 md:shrink-0 p-6 rounded md:justify-center md:overflow-y-auto">

    <!-- Filtres (pills) -->
    <div class="w-full max-w-sm">
      <h3 class="mb-2 text-lg font-semibold text-gray-700">Filtres</h3>

      <FilterPills v-model="typeFilter" label="Type" :options="TYPE_FILTERS" class="mb-3"
        active-class="bg-blue-600 text-white border-blue-600" />

      <FilterPills v-model="statusFilter" label="Statut" :options="STATUS_FILTERS"
        active-class="bg-green-600 text-white border-green-600" />

      <FilterPills v-if="showBonus" v-model="bonusMode" label="Bonus du jour" :options="BONUS_MODES" class="mt-3"
        active-class="bg-amber-500 text-white border-amber-500" />
    </div>

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
