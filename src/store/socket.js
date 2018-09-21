import Vue from "vue";
import Vuex from "vuex";

import Slave from "@/models/Slave";

import SocketIO from "socket.io-client";

Vue.use(Vuex);

const state = {
  socket: null,
  isConnected: false,
  slaves: [],
  currentSlaveID: -1
};

const mutations = {
  CONNECT: (state, { host }) => {
    state.socket = SocketIO(host);
  },
  AUTHENTICATE: (state, data) => {
    state.isConnected = true;
    console.log("authenticated", data);
    if (data && data.slavesList) {
      data.slavesList.forEach(slave => {
        state.slaves.push(
          new Slave({
            id: slave.ID
          })
        );
      });
    }
  }
};

const getters = {
  isConnected: state => state.isConnected,
  slavesList: state => state.slaves,
  currentSlave: state =>
    state.currentSlaveID >= 0 ? state.slaves[state.currentSlaveID] : null
};

const actions = {
  connectToSocketServer({ state, commit }, { host }) {
    commit("CONNECT", { host });
    state.socket.on("connect", function() {
      state.socket.emit("authentication", { token: "123456" });
      state.socket.on("authenticated", function(data) {
        commit("AUTHENTICATE", data);
      });
    });
    return state.socket;
  },
  sendControlRequest() {},
  onControlResponse() {},
  onStream() {},
  registerSockets(socket) {
    state.socket.on("control_response", this.onControlResponse);
    state.socket.on("stream", this.onStream);
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
