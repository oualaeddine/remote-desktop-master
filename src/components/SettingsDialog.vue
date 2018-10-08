<template>
  <v-layout row justify-center>
    <v-btn @click.stop="dialog = true" color="primary" icon dark>
      <v-icon>settings</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">Configuration</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveSettings">
            <v-text-field v-model="id" prepend-icon="person" name="ID" label="ID" type="text"></v-text-field>
            <v-text-field v-model="token" prepend-icon="lock" name="token" label="token" type="text"></v-text-field>
            <v-text-field v-model="url" prepend-icon="link" name="url" label="url" type="text"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveSettings">Save</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    id: window.MASTER_ID,
    url: window.SERVER_URL,
    token: window.AUTH_TOKEN
  }),
  mounted() {
    this.url = window.SERVER_URL;
  },
  methods: {
    saveSettings() {
      /// TODO: check if valid url
      localStorage.setItem("MASTER_ID", this.id);
      localStorage.setItem("SERVER_URL", this.url);
      localStorage.setItem("AUTH_TOKEN", this.token);
      this.dialog = false;
      window.location.reload();
    }
  }
};
</script>