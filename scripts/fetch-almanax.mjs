// Génère public/almanax_<year>.json à partir de l'API DofusDude.
// Remplace l'ancien scraper Scrapy/Selenium (fragile, bloqué par CloudFront).
//
// Usage : node scripts/fetch-almanax.mjs [year] [lang]
//   year : année à récupérer (défaut : année courante)
//   lang : langue de l'API (défaut : fr)

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const year = Number(process.argv[2]) || new Date().getFullYear()
const lang = process.argv[3] || 'fr'

const from = `${year}-01-01`
const to = `${year}-12-31`
const api = `https://api.dofusdu.de/dofus3/v1/${lang}/almanax?range[from]=${from}&range[to]=${to}`

console.log(`⏳ Récupération de l'Almanax ${year} (${lang})…`)

const res = await fetch(api, { headers: { Accept: 'application/json' } })
if (!res.ok) {
  console.error(`❌ Erreur API ${res.status} ${res.statusText}`)
  process.exit(1)
}

const raw = await res.json()

// On aplatit la réponse vers un format simple et stable pour le front.
const items = raw.map((d) => ({
  object: d.tribute.item.name,
  quantity: d.tribute.quantity,
  date: d.date,
  ankamaId: d.tribute.item.ankama_id,
  subtype: d.tribute.item.subtype, // resources | equipment | consumables | ...
  itemType: null, // type précis (« Céréale », « Coiffe »…), rempli ci-dessous
  image: d.tribute.item.image_urls?.icon ?? null,
  bonus: d.bonus?.description ?? null,
  bonusType: d.bonus?.type?.name ?? null,
}))

// Enrichissement : type précis via l'endpoint détail (/items/{subtype}/{ankamaId}).
// On mutualise les appels par (subtype, ankamaId) car un même item revient plusieurs fois,
// et on limite la concurrence pour rester poli avec l'API.
console.log('⏳ Enrichissement des types précis…')
const uniques = [...new Map(items.map((i) => [`${i.subtype}/${i.ankamaId}`, i])).values()]
const typeCache = new Map()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchType(it) {
  const url = `https://api.dofusdu.de/dofus3/v1/${lang}/items/${it.subtype}/${it.ankamaId}`
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } })
      if (r.ok) return (await r.json()).type?.name ?? null
      if (r.status === 404) return null // pas de retry sur un 404 franc
    } catch {
      /* erreur réseau : on retente */
    }
    await sleep(300 * (attempt + 1)) // backoff linéaire
  }
  return null
}

const CONCURRENCY = 6
let failed = 0
for (let i = 0; i < uniques.length; i += CONCURRENCY) {
  await Promise.all(
    uniques.slice(i, i + CONCURRENCY).map(async (it) => {
      const type = await fetchType(it)
      if (type === null) failed++
      typeCache.set(`${it.subtype}/${it.ankamaId}`, type)
    }),
  )
}
if (failed) console.warn(`⚠️  ${failed} type(s) précis non résolus (gardés à null).`)

for (const it of items) {
  it.itemType = typeCache.get(`${it.subtype}/${it.ankamaId}`) ?? null
}

const outPath = resolve(__dirname, '..', 'public', `almanax_${year}.json`)
await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, JSON.stringify(items, null, 0) + '\n', 'utf8')

console.log(`✅ ${items.length} jours écrits dans ${outPath}`)
