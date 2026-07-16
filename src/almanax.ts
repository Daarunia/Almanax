// Types et helpers partagés autour des données Almanax.
import { SUBTYPE_LABELS, HARVESTABLE_TYPES } from './constants'

export interface AlmanaxItem {
  object: string
  quantity: number
  date: string
  ankamaId: number
  subtype: string
  itemType: string | null
  craftable: boolean
  droppable: boolean
  image: string | null
  bonus: string | null
  bonusType: string | null
  purchased: boolean
}

export interface GroceryEntry {
  object: string
  image: string | null
  subtype: string
  itemType: string | null
  craftable: boolean
  droppable: boolean
  total: number // quantité totale (avant multiplication par le nb de persos)
  days: number // nombre de jours où l'item apparaît sur la plage
  refs: AlmanaxItem[] // items d'origine, pour la case "récupéré"
}

// Clé unique par occurrence (item + date) : deux jours du même item sont suivis séparément.
export const itemKey = (i: AlmanaxItem) => `${i.object}__${i.date}`

// Libellé FR d'un type d'item (subtype).
export const subtypeLabel = (s: string) => SUBTYPE_LABELS[s] ?? s

// Une entrée liste de courses est "récupérée" quand toutes ses occurrences le sont.
export const isGathered = (entry: GroceryEntry) => entry.refs.every((i) => i.purchased)

// Un item est récoltable si son type figure dans la liste blanche des métiers de récolte.
export const isHarvestable = (itemType: string | null) => !!itemType && HARVESTABLE_TYPES.has(itemType)

// Encode le couple (mois, jour) en nombre comparable (ex : 12 mars → 312).
const dayMonthCode = (date: string | Date) => {
  const d = new Date(date)
  return (d.getMonth() + 1) * 100 + d.getDate()
}

// Vrai si `date` (jour/mois, année ignorée) est dans [start, end].
// Gère les plages qui passent par la fin d'année (ex : du 20/12 au 10/01).
export const inDayMonthRange = (date: string, start: Date, end: Date) => {
  const d = dayMonthCode(date)
  const s = dayMonthCode(start)
  const e = dayMonthCode(end)
  return s <= e ? d >= s && d <= e : d >= s || d <= e
}

// Regroupe les items par nom, somme les quantités, trie par ordre alphabétique FR.
export const buildGroceryList = (items: AlmanaxItem[]): GroceryEntry[] => {
  const map = new Map<string, GroceryEntry>()
  for (const item of items) {
    const entry = map.get(item.object) ?? {
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
    entry.total += item.quantity
    entry.days += 1
    entry.refs.push(item)
    map.set(item.object, entry)
  }
  return [...map.values()].sort((a, b) => a.object.localeCompare(b.object, 'fr'))
}
