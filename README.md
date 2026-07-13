# Dofus Almanax Tracker - Vue 3 + TypeScript + Vite

Cette application est une **liste de course interactive pour l'Almanax de Dofus**. Elle permet de visualiser les objets disponibles entre deux dates, de sélectionner ceux que vous avez achetés ou récupérés, et de calculer automatiquement les quantités nécessaires pour vos personnages.

## Fonctionnalités principales

- Sélection de la **plage de dates** pour filtrer les objets de l'Almanax.  
- Gestion du **nombre de personnages** pour ajuster les quantités automatiquement.  
- Marquer les objets comme **"récupérés"** avec sauvegarde dans le cache du navigateur.  
- Interface moderne avec **Vue 3**, **TypeScript**, et **PrimeVue** pour les composants interactifs (`Calendar`, `InputNumber`, `Checkbox`).  

## Frontend

- Développé avec **Vue 3** et **Vite**, en utilisant `<script setup>` et composition API.  
- Composants principaux :  
  - `Calendar` pour sélectionner les dates de début et de fin.  
  - `InputNumber` pour le nombre de personnages.  
  - `Checkbox` pour marquer les objets récupérés.  
- Les données sont stockées localement via **LocalStorage** pour conserver l'état entre les visites.

## Données

- Les données sont récupérées via l'**API publique DofusDude** (`api.dofusdu.de`), qui expose un endpoint Almanax dédié.
- Chaque jour fournit : l'objet d'offrande, la quantité, le type d'item (`subtype`), l'`ankamaId`, l'icône et le bonus du jour.
- Pour (re)générer `public/almanax_<année>.json` :

```bash
npm run fetch-almanax           # année courante
npm run fetch-almanax 2026      # année précise
```

- Le script enrichit aussi chaque item avec son **type précis** (`itemType` : « Céréale », « Cuir »…) via l'endpoint détail de l'API.

> Historique : un ancien scraper Scrapy + Selenium générait ces données. Il a été retiré au profit de l'API DofusDude (plus fiable, sans navigateur headless, non bloqué par CloudFront).
