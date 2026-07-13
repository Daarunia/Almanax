// Types et helpers partagés autour des données Almanax.
import { SUBTYPE_LABELS, HARVESTABLE_TYPES } from './constants'

export interface AlmanaxItem {
  object: string
  quantity: number
  date: string
  ankamaId: number
  subtype: string
  itemType: string | null
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
  total: number // quantité totale (avant multiplication par le nb de persos)
  days: number // nombre de jours où l'item apparaît sur la plage
  refs: AlmanaxItem[] // items d'origine, pour la case "récupéré"
}

// Libellé FR d'un type d'item (subtype).
export const subtypeLabel = (s: string) => SUBTYPE_LABELS[s] ?? s

// Une entrée liste de courses est "récupérée" quand toutes ses occurrences le sont.
export const isGathered = (entry: GroceryEntry) => entry.refs.every((i) => i.purchased)

// Un item est récoltable si son type figure dans la liste blanche des métiers de récolte.
export const isHarvestable = (itemType: string | null) =>
  !!itemType && HARVESTABLE_TYPES.has(itemType)
