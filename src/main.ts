import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/material";

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".my-app-dark",
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
