<template>
  <v-toolbar color="primary" dark fixed clipped-left app>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      
    </v-toolbar>
</template>

<script>
export default {
  name: "tool-bar",
  props: {
    title: { type: String, default: "Application" }
  }
};
</script>

<style>
</style>
