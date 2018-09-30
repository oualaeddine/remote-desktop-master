import Vue from "vue";
import Vuex from "vuex";
import SocketModule from "./socket";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: [SocketModule]
});
