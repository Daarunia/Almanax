// Génère public/almanax.json à partir de l'API DofusDude.
// Remplace l'ancien scraper Scrapy/Selenium (fragile, bloqué par CloudFront).
//
// Les offrandes de l'Almanax sont identiques d'une année à l'autre (le front ne
// filtre que sur le jour/mois), donc le fichier de sortie n'est pas versionné :
// l'argument `year` ne sert qu'à choisir l'année interrogée sur l'API.
//
// Usage : node scripts/fetch-almanax.mjs [year] [lang]
//   year : année à interroger sur l'API (défaut : année courante)
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
  craftable: false, // possède une recette (DofusDB)
  droppable: false, // droppé par au moins un monstre (DofusDB)
  image: d.tribute.item.image_urls?.icon ?? null,
  bonus: d.bonus?.description ?? null,
  bonusType: d.bonus?.type?.name ?? null,
}))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Petit helper fetch JSON avec retry/backoff.
async function fetchJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } })
      if (r.ok) return await r.json()
      if (r.status === 404) return null // pas de retry sur un 404 franc
    } catch {
      /* erreur réseau : on retente */
    }
    await sleep(300 * (attempt + 1)) // backoff linéaire
  }
  return null
}

// Enrichissement par item unique :
//  - type précis via DofusDude (/items/{subtype}/{ankamaId})
//  - flags craftable / droppable via DofusDB (/items/{ankamaId})
console.log('⏳ Enrichissement (type précis + craftable/droppable)…')
const uniques = [...new Map(items.map((i) => [i.ankamaId, i])).values()]
const cache = new Map() // ankamaId -> { itemType, craftable, droppable }

const CONCURRENCY = 6
let failed = 0
for (let i = 0; i < uniques.length; i += CONCURRENCY) {
  await Promise.all(
    uniques.slice(i, i + CONCURRENCY).map(async (it) => {
      const [dude, db] = await Promise.all([
        fetchJson(`https://api.dofusdu.de/dofus3/v1/${lang}/items/${it.subtype}/${it.ankamaId}`),
        fetchJson(`https://api.dofusdb.fr/items/${it.ankamaId}`),
      ])
      if (!dude) failed++
      cache.set(it.ankamaId, {
        itemType: dude?.type?.name ?? null,
        craftable: (db?.recipeSlots ?? 0) > 0,
        droppable: (db?.dropMonsterIds?.length ?? 0) > 0,
      })
    }),
  )
}
if (failed) console.warn(`⚠️  ${failed} item(s) DofusDude non résolus (type gardé à null).`)

for (const it of items) {
  const e = cache.get(it.ankamaId)
  if (e) {
    it.itemType = e.itemType
    it.craftable = e.craftable
    it.droppable = e.droppable
  }
}

const outPath = resolve(__dirname, '..', 'public', 'almanax.json')
await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, JSON.stringify(items, null, 0) + '\n', 'utf8')

console.log(`✅ ${items.length} jours écrits dans ${outPath}`)
