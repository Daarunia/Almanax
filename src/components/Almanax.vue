<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { type AlmanaxItem, type GroceryEntry, isGathered } from '../almanax'
import DailyView from './DailyView.vue'
import GroceryView from './GroceryView.vue'

// Filtre par catégorie HDV. 'all' = pas de filtre.
const TYPE_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'resources', label: 'Ressource' },
  { value: 'consumables', label: 'Consommable' },
  { value: 'equipment', label: 'Équipement' },
] as const

const VIEW_MODES = [
  { value: 'daily', label: 'Par jour' },
  { value: 'grocery', label: 'Liste de courses' },
] as const

// Filtre par statut de récupération.
const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'todo', label: 'À prendre' },
  { value: 'done', label: 'Pris' },
] as const

// Valeurs réactives
const count = ref<number>(1)
const startDate = ref<Date | null>(new Date)
const endDate = ref<Date | null>(new Date)
const typeFilter = ref<string>('all')
const statusFilter = ref<'all' | 'todo' | 'done'>('all')
const bonusMode = ref<'tooltip' | 'inline'>('tooltip')
const items = ref<AlmanaxItem[]>([])

const BONUS_MODES = [
  { value: 'tooltip', label: 'Infobulle' },
  { value: 'inline', label: 'Affiché' },
] as const

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
  if (savedFilter) typeFilter.value = savedFilter
  const savedView = localStorage.getItem('viewMode')
  if (savedView === 'daily' || savedView === 'grocery') viewMode.value = savedView
  const savedStatus = localStorage.getItem('statusFilter')
  if (savedStatus === 'all' || savedStatus === 'todo' || savedStatus === 'done') statusFilter.value = savedStatus
  const savedBonus = localStorage.getItem('bonusMode')
  if (savedBonus === 'tooltip' || savedBonus === 'inline') bonusMode.value = savedBonus

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

// Applique le filtre de catégorie par-dessus le filtre de dates.
const displayedItems = computed(() => {
  if (typeFilter.value === 'all') return filteredItems.value
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
    <div class="flex flex-col items-center gap-5 w-full md:w-1/4 md:shrink-0 p-6 rounded md:justify-center md:overflow-y-auto">

      <!-- Filtres -->
      <div class="w-full max-w-sm">
        <h3 class="mb-2 text-lg font-semibold text-gray-700">Filtres</h3>

        <div class="mb-3">
          <span class="block mb-1 text-sm font-medium text-gray-600">Type</span>
          <div class="flex flex-wrap gap-2">
            <button v-for="f in TYPE_FILTERS" :key="f.value" type="button" @click="typeFilter = f.value"
              class="px-3 py-1 rounded-xl text-sm border transition-colors"
              :class="typeFilter === f.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'">
              {{ f.label }}
            </button>
          </div>
        </div>

        <div>
          <span class="block mb-1 text-sm font-medium text-gray-600">Statut</span>
          <div class="flex flex-wrap gap-2">
            <button v-for="s in STATUS_FILTERS" :key="s.value" type="button" @click="statusFilter = s.value"
              class="px-3 py-1 rounded-xl text-sm border transition-colors"
              :class="statusFilter === s.value
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'">
              {{ s.label }}
            </button>
          </div>
        </div>

        <div v-if="viewMode === 'daily'" class="mt-3">
          <span class="block mb-1 text-sm font-medium text-gray-600">Bonus du jour</span>
          <div class="flex flex-wrap gap-2">
            <button v-for="b in BONUS_MODES" :key="b.value" type="button" @click="bonusMode = b.value"
              class="px-3 py-1 rounded-xl text-sm border transition-colors"
              :class="bonusMode === b.value
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'">
              {{ b.label }}
            </button>
          </div>
        </div>
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

    <!-- Résultats -->
    <div class="w-full min-w-0 overflow-y-auto md:max-h-full mt-5 mb-5 px-4">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        <h2 class="text-lg font-semibold text-gray-700">
          Résultats ({{ viewMode === 'grocery' ? visibleGrocery.length : visibleItems.length }})
        </h2>

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
