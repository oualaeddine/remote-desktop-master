<template>
  <v-app id="app" dark>
    <side-bar/>
    <!-- <tool-bar :title='"Master"'/> -->
    <v-content fill-height>
      <v-container :class='"slave"' fill-height v-show='isAuthenticated && isControlling'>
        <video class='slave-video' id='video' ref='video' ></video>
        <div id="overlay" class="slave-overlay" tabindex="1"></div>
      </v-container>
      <slave-selection-view v-if='isAuthenticated && !isControlling' @initControlConnection='initControlConnection'/>

      <login-form v-if='!isAuthenticated' @submit='authenticate'/>
      
    </v-content>

  </v-app>
</template>

<script>
import ToolBar from "@/components/ToolBar";
import LoginForm from "@/components/LoginForm";
import SideBar from "@/components/SideBar";
import SlaveSelectionView from "@/components/SlaveSelectionView";

import { URL, PORT } from "@/config.js";
import Vuex from "vuex";

export default {
  name: "app",
  components: {
    SideBar,
    ToolBar,
    SlaveSelectionView,
    LoginForm
  },
  data: () => ({}),
  computed: {
    ...Vuex.mapGetters({
      isControlling: "isControlling",
      isAuthenticated: "isAuthenticated",
      slaves: "slavesList",
      currentSlave: "currentSlave"
    })
  },
  methods: {
    ...Vuex.mapActions({
      connect: "connectToSocketServer",
      authenticate: "authenticate",
      _initControlConnection: "initControlConnection"
    }),
    registerListeners() {},
    initControlConnection({ slave_id }) {
      const video = this.$refs.video;
      const overlay = document.getElementById("overlay");

      this._initControlConnection({ slave_id, video, overlay });
      this.registerListeners();
    }
  },
  mounted() {
    this.connect({
      host: process.env.HOST || `${URL}`
    });
  }
};
</script>

<style>
html,
body {
  height: 100vh;
  overflow: hidden;
}
.slave {
  position: relative;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
.slave-video {
  padding: 0;
  margin: 0;
  width: 100%;
  border: 5px solid white;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.slave-overlay {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
