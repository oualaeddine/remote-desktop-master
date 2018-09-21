<template>
  <v-navigation-drawer
      v-model="drawer"
      fixed
      clipped
      right
      app
    >
      <v-list dense>
        <!-- <v-list-tile @click="1">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile> -->
      </v-list>
    </v-navigation-drawer>
</template>

<script>
export default {
  name: "side-bar",
  data: () => ({
    drawer: null
  })
};
</script>

<style>
</style>
