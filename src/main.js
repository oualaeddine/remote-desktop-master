import Vue from "vue";
import App from "./App.vue";

import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css"; // Ensure you are using css-loader

import { ID, URL, TOKEN } from "@/config.js";

window.MASTER_ID = localStorage.getItem("MASTER_ID") || ID;
window.SERVER_URL = localStorage.getItem("SERVER_URL") || URL;
window.AUTH_TOKEN = localStorage.getItem("AUTH_TOKEN") || TOKEN;

Vue.use(Vuetify);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
