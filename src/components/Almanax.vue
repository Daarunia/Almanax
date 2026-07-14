<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { type AlmanaxItem, type GroceryEntry, isGathered, isHarvestable } from '../almanax'
import { TYPE_FILTERS, VIEW_MODES, STATUS_FILTERS, BONUS_MODES } from '../constants'
import DailyView from './DailyView.vue'
import GroceryView from './GroceryView.vue'
import FiltersPanel from './FiltersPanel.vue'

// Valeurs réactives
const count = ref<number>(1)
const startDate = ref<Date | null>(new Date)
const endDate = ref<Date | null>(new Date)
const typeFilter = ref<string>('all')
const statusFilter = ref<string>('all')
const bonusMode = ref<string>('tooltip')
const items = ref<AlmanaxItem[]>([])

onMounted(async () => {
  const response = await fetch('/almanax_2026.json')
  items.value = await response.json()

  items.value = items.value.map((item: AlmanaxItem) => ({
    ...item,
    purchased: false
  }))

  // gestion du cache
  const savedCount = localStorage.getItem('count')
  const savedStart = localStorage.getItem('startDate')
  const savedEnd = localStorage.getItem('endDate')
  const savedPurchased = localStorage.getItem('purchased')

  const savedFilter = localStorage.getItem('typeFilter')

  if (savedCount) count.value = Number(savedCount)
  if (savedStart) startDate.value = new Date(savedStart)
  if (savedEnd) endDate.value = new Date(savedEnd)

  // Sécurité : on ne restaure une valeur que si elle fait toujours partie des options.
  // Sinon on garde la valeur par défaut (une option est donc TOUJOURS sélectionnée).
  const isValid = (options: readonly { value: string }[], v: string | null) =>
    v !== null && options.some((o) => o.value === v)

  if (isValid(TYPE_FILTERS, savedFilter)) typeFilter.value = savedFilter!
  const savedView = localStorage.getItem('viewMode')
  if (isValid(VIEW_MODES, savedView)) viewMode.value = savedView as 'daily' | 'grocery'
  const savedStatus = localStorage.getItem('statusFilter')
  if (isValid(STATUS_FILTERS, savedStatus)) statusFilter.value = savedStatus!
  const savedBonus = localStorage.getItem('bonusMode')
  if (isValid(BONUS_MODES, savedBonus)) bonusMode.value = savedBonus!

  // Restaurer les cases cochées si elles ont été sauvegardées
  if (savedPurchased) {
    const purchasedState = JSON.parse(savedPurchased)
    items.value.forEach((item) => {
      if (purchasedState[itemKey(item)]) {
        item.purchased = true
      }
    })
  }
})

// Clé unique par occurrence (item + date) : deux jours du même item sont suivis séparément.
const itemKey = (i: AlmanaxItem) => `${i.object}__${i.date}`

const getDayMonth = (date: string | Date) => {
  const d = new Date(date)
  return { day: d.getDate(), month: d.getMonth() + 1 }
}

// Regroupe les 3 filtres pills en un objet pour un v-model unique (les refs restent la source de vérité).
const pillFilters = computed({
  get: () => ({ type: typeFilter.value, status: statusFilter.value, bonus: bonusMode.value }),
  set: (v) => {
    typeFilter.value = v.type
    statusFilter.value = v.status
    bonusMode.value = v.bonus
  },
})

const filteredItems = computed(() => {
  if (!startDate.value || !endDate.value) return []

  const start = getDayMonth(startDate.value)
  const end = getDayMonth(endDate.value)

  // Si la plage de dates "passe par la fin d'année" (ex: du 20/12 au 10/01)
  const crossesYear = (end.month < start.month) || (end.month === start.month && end.day < start.day)

  return items.value.filter((item) => {
    const { day, month } = getDayMonth(item.date)

    if (crossesYear) {
      // ex: du 20/12 au 10/01
      return (
        (month > start.month || (month === start.month && day >= start.day)) ||
        (month < end.month || (month === end.month && day <= end.day))
      )
    } else {
      // plage normale dans la même année
      if (month < start.month || month > end.month) return false
      if (month === start.month && day < start.day) return false
      if (month === end.month && day > end.day) return false
      return true
    }
  })
})

// Applique le filtre de catégorie (dont "récoltable") par-dessus le filtre de dates.
const displayedItems = computed(() => {
  if (typeFilter.value === 'all') return filteredItems.value
  if (typeFilter.value === 'harvestable') {
    return filteredItems.value.filter((item) => isHarvestable(item.itemType))
  }
  return filteredItems.value.filter((item) => item.subtype === typeFilter.value)
})

// Mode d'affichage : par jour, ou liste de courses (items regroupés + quantités sommées).
const viewMode = ref<'daily' | 'grocery'>('daily')

// Regroupe les items visibles par nom et somme les quantités.
const groceryList = computed<GroceryEntry[]>(() => {
  const map = new Map<string, GroceryEntry>()
  for (const item of displayedItems.value) {
    const e = map.get(item.object) ?? {
      object: item.object,
      image: item.image,
      subtype: item.subtype,
      itemType: item.itemType,
      craftable: item.craftable,
      droppable: item.droppable,
      total: 0,
      days: 0,
      refs: [],
    }
    e.total += item.quantity
    e.days += 1
    e.refs.push(item)
    map.set(item.object, e)
  }
  return [...map.values()].sort((a, b) => a.object.localeCompare(b.object, 'fr'))
})

// Listes réellement affichées : filtre de statut appliqué par-dessus (date + type).
const visibleItems = computed(() => {
  if (statusFilter.value === 'all') return displayedItems.value
  const wantDone = statusFilter.value === 'done'
  return displayedItems.value.filter((i) => i.purchased === wantDone)
})
const visibleGrocery = computed(() => {
  if (statusFilter.value === 'all') return groceryList.value
  const wantDone = statusFilter.value === 'done'
  return groceryList.value.filter((e) => isGathered(e) === wantDone)
})

// Progression : récupérés / total dans la vue courante.
const progress = computed(() => {
  const total = viewMode.value === 'grocery' ? groceryList.value.length : displayedItems.value.length
  const done = viewMode.value === 'grocery'
    ? groceryList.value.filter(isGathered).length
    : displayedItems.value.filter((i) => i.purchased).length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
})

// Décoche tous les objets récupérés (le watch sur `items` met à jour le LocalStorage).
const resetPurchased = () => {
  items.value.forEach((item) => (item.purchased = false))
}

watch(count, (newVal) => {
  if (newVal !== null) localStorage.setItem('count', newVal.toString())
})

watch(startDate, (newVal) => {
  if (newVal) localStorage.setItem('startDate', newVal.toISOString())
})

watch(endDate, (newVal) => {
  if (newVal) localStorage.setItem('endDate', newVal.toISOString())
})

watch(typeFilter, (newVal) => {
  localStorage.setItem('typeFilter', newVal)
})

watch(viewMode, (newVal) => {
  localStorage.setItem('viewMode', newVal)
})

watch(statusFilter, (newVal) => {
  localStorage.setItem('statusFilter', newVal)
})

watch(bonusMode, (newVal) => {
  localStorage.setItem('bonusMode', newVal)
})

watch(items, (newVal) => {
  const purchasedState: Record<string, boolean> = {}
  newVal.forEach(item => {
    if (item.purchased) purchasedState[itemKey(item)] = true
  })
  localStorage.setItem('purchased', JSON.stringify(purchasedState))
}, { deep: true })
</script>

<template>
  <div class="flex flex-col md:flex-row h-full min-h-0">
    <FiltersPanel v-model:count="count" v-model:start-date="startDate" v-model:end-date="endDate"
      v-model:pills="pillFilters" :show-bonus="viewMode === 'daily'" />

    <!-- Résultats -->
    <div class="w-full min-w-0 overflow-y-auto md:max-h-full mt-5 mb-5 px-4">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        <h2 class="text-lg font-semibold text-gray-700">
          Résultats ({{ viewMode === 'grocery' ? visibleGrocery.length : visibleItems.length }})
        </h2>

        <!-- Réinitialiser les objets cochés -->
        <button type="button" @click="resetPurchased" :disabled="progress.done === 0"
          title="Décocher tous les objets récupérés"
          class="px-3 py-1 rounded-xl text-sm border transition-colors flex items-center gap-1
            border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
          <i class="pi pi-refresh" style="font-size: 0.75rem"></i> Réinitialiser
        </button>

        <!-- Bascule de vue (même style pill que les filtres) -->
        <div class="flex flex-wrap gap-2 ml-auto">
          <button v-for="v in VIEW_MODES" :key="v.value" type="button" @click="viewMode = v.value"
            class="px-3 py-1 rounded-xl text-sm border transition-colors"
            :class="viewMode === v.value
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'">
            {{ v.label }}
          </button>
        </div>
      </div>

      <!-- Barre de progression -->
      <div v-if="progress.total" class="mb-4">
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progression</span>
          <span>{{ progress.done }} / {{ progress.total }} ({{ progress.percent }}%)</span>
        </div>
        <div class="h-2 w-full rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full rounded-xl bg-blue-600 transition-all duration-300" :style="{ width: progress.percent + '%' }"></div>
        </div>
      </div>

      <!-- Vue liste de courses : items regroupés, quantités sommées -->
      <GroceryView v-if="viewMode === 'grocery'" :entries="visibleGrocery" :count="count" />

      <!-- Vue par jour -->
      <DailyView v-else :items="visibleItems" :count="count" :bonus-mode="bonusMode" />
    </div>
  </div>
</template>
