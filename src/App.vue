<template>
  <v-app id="app">
    <!-- <tool-bar :title='"Master"'/> -->
    <v-content fill-height>
      <v-container :class='"slave"' fill-height v-show='isAuthenticated && isControlling'>
        <video class='slave-video' id='video'></video>
        <div id="overlay" class="slave-overlay" tabindex="1"></div>
      </v-container>

      <v-container v-if='isAuthenticated && !isControlling' fluid fill-height justify-content-center grid-list-xl>
        <v-layout row wrap>
            <v-flex
              v-for="(slave,n) in slaves"
              :key="n"
              xs4
            >
              <card-slave 
                :ID='slave.ID'
                :isConnected='slave.isConnected'
                :imgSrc='slave.preview'
                @control='initControlConnection({slave_id: slave.ID})'
              />
            </v-flex>
          </v-layout>
      </v-container>
      
    </v-content>

  </v-app>
</template>

<script>
import CardSlave from "@/components/CardSlave";

import { URL, PORT } from "@/config.js";

import MasterSocketConnection from "@/core/MasterSocketConnection";
import DesktopController from "@/core/DesktopController";
import Slave from "@/core/Slave";

export default {
  name: "app",
  components: {
    CardSlave
  },
  data: () => ({
    socketConnection: null,
    isAuthenticated: false,
    desktopController: null,
    currentSlaveID: -1
  }),
  computed: {
    isControlling() {
      return this.currentSlaveID >= 0;
    },
    currentSlave() {
      this.currentSlaveID >= 0 ? this.slaves[this.currentSlaveID] : null;
    },
    slaves() {
      return Slave.getSlaves();
    }
  },
  mounted() {
    this.connect({
      socketURL: process.env.HOST || `${URL}`
    });
  },
  methods: {
    connect({ socketURL }) {
      this.socketConnection = new MasterSocketConnection(socketURL);
      this.socketConnection.sendAuthentication(data => {
        this.isAuthenticated = true;
        this.loadSlaves({ slave_list: data && data.slave_list });
      });
    },
    loadSlaves({ slave_list }) {
      slave_list.forEach(slave => {
        if (slave.id) Slave.createSlave(slave);
      });
    },
    initControlConnection({ slave_id }) {
      this.socketConnection.sendControlRequest(slave_id, controlResponse => {
        this.onControlResponse(controlResponse, slave_id);
      });
    },
    onControlResponse(controlResponse, slave_id) {
      this.currentSlaveID = String(slave_id);
      this.currentSlave.setSpecs({
        resolution: controlResponse.resolution
      });

      this.socketConnection.onStream(this.startDesktopControl);
    },
    startDesktopControl(stream) {
      const video = document.getElementById("video");
      const overlay = document.getElementById("overlay");

      if (this.desktopController) {
        this.desktopController.stream = stream;
        return;
      }
      this.desktopController = new DesktopController({
        stream,
        $html: { video, overlay },
        socketConnection: this.socketConnection,
        slave: this.currentSlave
      });

      this.desktopController.registerEventListeners(event => {
        this.socketConnection.sendIOEvent(event);
      });
    }
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
