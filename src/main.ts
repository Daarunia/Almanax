import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/material";

const app = createApp(App);
app.use(PrimeVue, {
 license: 'eyJpZCI6IjQ4MzgxMDQzLTY2MjctNGQ0ZC04M2MwLTkzNTEwMTg2NjM0ZSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODQyMjkwNTAsImV4cCI6MTgxNTc2NTA1MH0.qVJvuNXG7ABnceENJ-N-CyWTFqegDmNA23La3zNAEVxL81AI-TJYx6gOrPJigHBaltNNnMhuW28uCSElaglrDA',
 theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".app-dark",
    },
  },
  locale: {
    firstDayOfWeek: 1,
    dayNames: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
    dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
    monthNames: [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ],
    monthNamesShort: [
      "janv", "févr", "mars", "avr", "mai", "juin",
      "juil", "août", "sept", "oct", "nov", "déc",
    ],
    today: "Aujourd'hui",
    clear: "Effacer",
    dateFormat: "dd/mm/yy",
  },
});
app.mount("#app");
