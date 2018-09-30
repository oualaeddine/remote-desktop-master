<template>
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
            @control='initControlConnection({slave_id: slave.ID})'
          />
        </v-flex>
      </v-layout>
  </v-container>
</template>

<script>
import CardSlave from "@/components/CardSlave";

import Vuex from "vuex";

export default {
  name: "app",
  components: {
    CardSlave
  },
  data: () => ({}),
  computed: {
    ...Vuex.mapGetters({
      isAuthenticated: "isConnected",
      slaves: "slavesList",
      currentSlave: "currentSlave"
    })
  },
  methods: {
    initControlConnection({ slave_id }) {
      this.$emit("initControlConnection", { slave_id });
    }
  }
};
</script>

<style>
</style>
