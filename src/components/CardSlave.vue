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
      <v-btn flat color="orange" @click="control">Controller</v-btn>
      <v-btn flat color="orange">Renommer</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    ID: { type: Number, default: 0 },
    imgSrc: { type: String, default: "" }
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
