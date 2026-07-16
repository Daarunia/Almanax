import { ref, watch, type Ref } from 'vue'

// Convertit une valeur vers/depuis sa représentation LocalStorage.
// `parse` renvoie undefined si la valeur stockée n'est pas restaurable (on garde le défaut) ;
// `stringify` renvoie null pour ne pas écraser la dernière valeur sauvegardée.
export interface Codec<T> {
  parse: (raw: string) => T | undefined
  stringify: (value: T) => string | null
}

export const numberCodec: Codec<number> = {
  parse: (raw) => {
    const n = Number(raw)
    return Number.isNaN(n) ? undefined : n
  },
  stringify: (v) => (v == null ? null : String(v)),
}

export const dateCodec: Codec<Date | null> = {
  parse: (raw) => {
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? undefined : d
  },
  stringify: (v) => (v ? v.toISOString() : null),
}

// Ne restaure une valeur que si elle fait toujours partie des options.
// Sinon on garde la valeur par défaut (une option est donc TOUJOURS sélectionnée).
export const optionCodec = <V extends string>(
  options: readonly { value: V }[],
): Codec<V> => ({
  parse: (raw) => (options.some((o) => o.value === raw) ? (raw as V) : undefined),
  stringify: (v) => v,
})

// Ref synchronisée avec le LocalStorage : restaurée à la création, sauvegardée à chaque changement.
export function usePersistedRef<T>(key: string, defaultValue: T, codec: Codec<T>): Ref<T> {
  const raw = localStorage.getItem(key)
  const restored = raw !== null ? codec.parse(raw) : undefined
  const value = ref(restored ?? defaultValue) as Ref<T>

  watch(value, (v) => {
    const serialized = codec.stringify(v)
    if (serialized !== null) localStorage.setItem(key, serialized)
  })

  return value
}
