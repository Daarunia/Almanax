// Types et helpers partagés autour des données Almanax.

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

// Libellés FR pour les types d'items renvoyés par l'API DofusDude.
const SUBTYPE_LABELS: Record<string, string> = {
  resources: 'Ressource',
  equipment: 'Équipement',
  consumables: 'Consommable',
  quest_items: 'Quête',
}
export const subtypeLabel = (s: string) => SUBTYPE_LABELS[s] ?? s

// Une entrée liste de courses est "récupérée" quand toutes ses occurrences le sont.
export const isGathered = (entry: GroceryEntry) => entry.refs.every((i) => i.purchased)
