<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

interface AlmanaxItem {
  object: string
  quantity: number
  date: string
  url: string
  purchased: boolean
}

// Valeurs réactives
const count = ref<number>(1)
const startDate = ref<Date | null>(new Date)
const endDate = ref<Date | null>(new Date)
const items = ref<AlmanaxItem[]>([])

onMounted(async () => {
  const response = await fetch('/almanax_2028.json')
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

  if (savedCount) count.value = Number(savedCount)
  if (savedStart) startDate.value = new Date(savedStart)
  if (savedEnd) endDate.value = new Date(savedEnd)

  // Restaurer les cases cochées si elles ont été sauvegardées
  if (savedPurchased) {
    const purchasedState = JSON.parse(savedPurchased)
    items.value.forEach((item) => {
      if (purchasedState[item.object]) {
        item.purchased = true
      }
    })
  }
})

const getDayMonth = (date: string | Date) => {
  const d = new Date(date)
  return { day: d.getDate(), month: d.getMonth() + 1 }
}

const onCheckboxChange = (item: AlmanaxItem) => {
  console.log('✅ Checkbox changée pour :', item)
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

watch(count, (newVal) => {
  if (newVal !== null) localStorage.setItem('count', newVal.toString())
})

watch(startDate, (newVal) => {
  if (newVal) localStorage.setItem('startDate', newVal.toISOString())
})

watch(endDate, (newVal) => {
  if (newVal) localStorage.setItem('endDate', newVal.toISOString())
})

watch(items, (newVal) => {
  const purchasedState: Record<string, boolean> = {}
  newVal.forEach(item => {
    if (item.purchased) purchasedState[item.object] = true
  })
  localStorage.setItem('purchased', JSON.stringify(purchasedState))
}, { deep: true })
</script>

<template>
  <div class="flex flex-row h-full">
    <div class="flex flex-col justify-center items-center gap-5 align-center w-1/2 p-6 rounded">

      <!-- Nombre de personnages -->
      <div class="flex flex-col w-100">
        <label for="count" class="w-full mb-1 font-medium text-gray-700">Nombre de personnages</label>
        <InputNumber id="count" v-model="count" :min="0" :max="100" showButtons class="w-full" />
      </div>

      <!-- Date de début -->
      <div class="flex flex-col  w-100">
        <label for="start" class="w-full mb-1 font-medium text-gray-700">Date de début</label>
        <Calendar id="start" v-model="startDate" :showIcon="true" dateFormat="dd/mm/yy" class="w-full"
          inputClass="w-full" />
      </div>

      <!-- Date de fin -->
      <div class="flex flex-col  w-100">
        <label for="end" class="w-full mb-1 font-medium text-gray-700">Date de fin</label>
        <Calendar id="end" v-model="endDate" :showIcon="true" dateFormat="dd/mm/yy" class="w-full"
          inputClass="w-full" />
      </div>
    </div>

    <!-- Résultats -->
    <div class="w-1/2 overflow-y-auto max-h-full mt-5 mb-5">
      <h2 class="text-lg font-semibold mb-3 text-gray-700">
        Résultats ({{ filteredItems.length }})
      </h2>

      <ul class="space-y-2 max-h-full w-1/2">
        <li v-for="(item, index) in filteredItems" :key="item.object + index"
          class="flex items-center p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Checkbox binary class="mr-4" v-model="item.purchased" @change="onCheckboxChange(item)"></Checkbox>
          <a :href="item.url" target="_blank" class="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            {{ item.object }}
          </a>
          <span class="ml-2 text-gray-500 dark:text-gray-400 mr-5">(x{{ item.quantity * count }})</span>
          <span class="block text-sm text-gray-400">{{ new Date(item.date).toLocaleDateString('fr-FR') }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
export default {
  components: {
    InputNumber,
    Calendar
  }
}
</script>
