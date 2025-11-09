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
});
app.mount("#app");
