<template>
  <v-card>
    <v-img
      class="white--text"
      height="150px"
      :src="imgSrc"
    >
    </v-img>
    <v-card-title>
      <h2>Machine N°{{ID}}</h2>
    </v-card-title>
    <v-card-actions>
      <v-btn flat color="orange" :disabled='!isConnected' @click="control">Controller</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    ID: { type: String, default: 0 },
    isConnected: { type: Boolean, default: false },
    imgSrc: {
      type: String,
      default: "https://cdn.vuetifyjs.com/images/cards/docks.jpg"
    }
  },
  methods: {
    control() {
      this.$emit("control", this.ID);
    }
  }
};
</script>

<style>
</style>
