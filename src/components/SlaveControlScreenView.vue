<template>
  <v-container>
    <video ref='video' src="video"></video>
  </v-container>
</template>

<script>
import Vuex from "vuex";

export default {
  methods: {
    ...Vuex.mapActions({})
  },
  mounted() {
    const video = this.$refs.video;
  }
};
</script>

<style>
</style>
