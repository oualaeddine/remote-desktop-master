import Vue from "vue";
import Vuex from "vuex";

import Slave from "@/core/Slave";
import MasterSocketConnection from "@/core/MasterSocketConnection";
import DesktopController from "@/core/DesktopController";

Vue.use(Vuex);

const state = {
  socketConnection: null,
  isAuthenticated: false,
  slaves: [],
  desktopController: null,
  controlling: false,
  currentSlaveID: -1
};

const mutations = {
  DISCONNECT: state => {
    state.socketConnection = null;
    state.isAuthenticated = false;
    state.slaves = [];
    state.currentSlaveID = -1;
  },
  CONNECT: (state, { host }) => {
    state.socketConnection = new MasterSocketConnection({ host });
  },
  SAVE_SLAVE_SPECS: (state, specs) => {
    state.currentSlaveID = state.slaves.map(s => s.ID).indexOf(specs.slave_id);
    getters.currentSlave(state).setSpecs(specs);
  },
  SET_TO_AUTHENTICATED: state => {
    state.isAuthenticated = true;
  },
  LOAD_SLAVES: (state, { slave_list }) => {
    slave_list.forEach(slave => {
      if (slave.id) {
        state.slaves.push(
          new Slave({
            ID: Number(slave.id),
            name: `Machine N°${slave.id}`,
            isConnected: slave.connected
          })
        );
      }
    });
  }
};

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  slavesList: state => state.slaves,
  isControlling: state => state.currentSlaveID >= 0,
  currentSlave: state =>
    state.currentSlaveID >= 0 ? state.slaves[state.currentSlaveID] : null
};

const actions = {
  connectToSocketServer({ getters, commit }, { host }) {
    if (getters.isAuthenticated) commit("DISCONNECT");
    commit("CONNECT", { host });
  },
  authenticate({ state, commit }) {
    state.socketConnection.sendAuthentication(data => {
      console.log("authenticated", data);
      commit("SET_TO_AUTHENTICATED");
      if (data && data.slave_list) {
        commit("LOAD_SLAVES", data);
      }
    });
  },
  initControlConnection(
    { state, commit, getters },
    { slave_id, video, overlay }
  ) {
    state.socketConnection.sendControlRequest(slave_id, controlResponse => {
      console.log("controlResponse", controlResponse);
      commit("SAVE_SLAVE_SPECS", {
        slave_id: slave_id,
        resolution: controlResponse.resolution
      });

      state.socketConnection.onStream(stream => {
        console.log("called on stream listener");
        if (!state.desktopController) {
          state.desktopController = new DesktopController(
            stream,
            { video, overlay },
            state.socketConnection,
            getters.currentSlave
          );

          state.desktopController.registerEventListeners(event => {
            state.socketConnection.sendIOEvent(event);
          });
        } else {
          console.log("updating stream");
          state.desktopController.stream = stream;
        }
      });
    });
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
