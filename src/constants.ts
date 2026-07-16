// Constantes de l'application Almanax (options d'UI, libellés, listes blanches).

// Filtre par catégorie HDV (+ "récoltable"). 'all' = pas de filtre.
export const TYPE_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'resources', label: 'Ressource' },
  { value: 'consumables', label: 'Consommable' },
  { value: 'equipment', label: 'Équipement' },
  { value: 'harvestable', label: '⛏️ Récoltable' },
] as const

// Mode d'affichage de la liste.
export const VIEW_MODES = [
  { value: 'daily', label: 'Par jour' },
  { value: 'grocery', label: 'Liste de courses' },
] as const

// Filtre par statut de récupération.
export const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'todo', label: 'À prendre' },
  { value: 'done', label: 'Pris' },
] as const

// Mode d'affichage du bonus du jour.
export const BONUS_MODES = [
  { value: 'tooltip', label: 'Infobulle' },
  { value: 'inline', label: 'Affiché' },
] as const

// Union des valeurs possibles d'une liste d'options (ex : 'all' | 'resources' | …).
type OptionValue<T extends readonly { value: string }[]> = T[number]['value']

export type TypeFilter = OptionValue<typeof TYPE_FILTERS>
export type ViewMode = OptionValue<typeof VIEW_MODES>
export type StatusFilter = OptionValue<typeof STATUS_FILTERS>
export type BonusMode = OptionValue<typeof BONUS_MODES>

// Libellés FR pour les types d'items (subtype) renvoyés par l'API DofusDude.
export const SUBTYPE_LABELS: Record<string, string> = {
  resources: 'Ressource',
  equipment: 'Équipement',
  consumables: 'Consommable',
  quest_items: 'Quête',
}

// Types d'items récoltables via un métier de récolte (Bûcheron, Paysan, Mineur, Alchimiste, Pêcheur).
// Set "sûr" : les catégories ambiguës (Légume, Racine, Champignon…) ne sont pas incluses.
export const HARVESTABLE_TYPES = new Set(['Bois', 'Céréale', 'Minerai', 'Plante', 'Fleur', 'Poisson'])
