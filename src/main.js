import Vue from "vue";
import App from "./App.vue";

import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css"; // Ensure you are using css-loader

import { URL } from "@/config.js";

window.SERVER_URL = localStorage.getItem("SERVER_URL") || URL;

Vue.use(Vuetify);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
