<template>
  <v-app id="app" dark>
    <side-bar/>
    <tool-bar :title='"Master"'/>
    <v-content>
      <v-container fluid fill-height justify-content-center grid-list-xl>
        <v-layout row wrap>
            <v-flex
              v-for="(slave,n) in slaves"
              :key="n"
              xs4
            >
              <card-slave 
                :ID='slave.ID'
                :imgSrc='"https://cdn.vuetifyjs.com/images/cards/docks.jpg"'
                @control='1'
              />
            </v-flex>
          </v-layout>
      </v-container>
    </v-content>

  </v-app>
</template>

<script>
import ToolBar from "@/components/ToolBar";
import SideBar from "@/components/SideBar";
import CardSlave from "@/components/CardSlave";

import Vuex from "vuex";

export default {
  name: "app",
  components: {
    SideBar,
    ToolBar,
    CardSlave
  },
  data: () => ({}),
  computed: {
    ...Vuex.mapGetters({
      isConnected: "isConnected",
      slaves: "slavesList",
      currentSlave: "currentSlave"
    })
  },
  methods: {
    ...Vuex.mapActions({
      connect: "connectToSocketServer",
      sendControlRequest: "sendControlRequest",
      registerSockets: "registerSockets"
    })
  },
  mounted() {
    this.connect({
      host: process.env.HOST || "http://localhost:3000"
    });
    this.registerSockets();
  }
};
</script>