import { ref, watch } from 'vue'
import { type AlmanaxItem, itemKey } from '../almanax'

const DATA_URL = '/almanax_2026.json'
const STORAGE_KEY = 'purchased'

const loadPurchasedState = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {}
  } catch {
    return {} // stockage corrompu : on repart de zéro
  }
}

// Charge les items de l'année et synchronise l'état "récupéré" avec le LocalStorage.
export function useAlmanaxItems() {
  const items = ref<AlmanaxItem[]>([])

  const load = async () => {
    const response = await fetch(DATA_URL)
    const data: AlmanaxItem[] = await response.json()
    const purchased = loadPurchasedState()
    items.value = data.map((item) => ({ ...item, purchased: !!purchased[itemKey(item)] }))
  }
  load()

  // Sauvegarde uniquement les occurrences cochées (clé = objet + date).
  watch(
    items,
    (list) => {
      const purchased: Record<string, boolean> = {}
      for (const item of list) {
        if (item.purchased) purchased[itemKey(item)] = true
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchased))
    },
    { deep: true },
  )

  // Décoche tous les objets récupérés (le watch ci-dessus met à jour le LocalStorage).
  const resetPurchased = () => {
    items.value.forEach((item) => (item.purchased = false))
  }

  return { items, resetPurchased }
}
