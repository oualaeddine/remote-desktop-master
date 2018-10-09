<template>
  <v-app id="app" fill-height>

    <!-- Toolbar  -->
    <v-toolbar color="primary" app>
      <v-toolbar-items>
        <v-btn v-if='isControlling' flat dark @click='stopDesktopControl'>
          <v-icon>arrow_back</v-icon>
          Stop control
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn icon dark @click='toggleFullScreen'>
          <v-icon>fullscreen</v-icon>
        </v-btn>
        <v-btn icon dark @click='refresh'>
          <v-icon>refresh</v-icon>
        </v-btn>
        <!-- Dialog parametres -->
        <settings-dialog v-if='!isControlling'/>
      </v-toolbar-items>
    </v-toolbar>

    <!-- Spinner à afficher avant et pendant la connexion -->
    <v-container fluid fill-height justify-center v-if="!isAuthenticated">
      <v-layout row wrap align-center>
        <v-flex class="text-xs-center">
          <v-progress-circular indeterminate color="primary" ></v-progress-circular>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- Contenu de la page, envelopper d'un 'cloak' pour cacher le contenu pendant la connexion -->
    <template v-cloak v-else>

      <!-- Contenu de la page -->
      <v-content fill-height>

        <!-- Partie choix des machines slaves -->
        <v-container v-if='!isControlling' fluid fill-height justify-content-center grid-list-xl>
          <v-layout row wrap>
            <!-- Parcourir la liste des machines slaves, afficher chacune dans un composant CardSlave -->
              <v-flex
                v-for="(slave,n) in slaves"
                :key="n"
                xs4>
                <card-slave 
                  :ID='slave.ID'
                  :imgSrc='slave.preview'
                  :isConnected='slave.isConnected'
                  @control='initControlConnection({slave_id: slave.ID})'
                />
              </v-flex>
            </v-layout>
        </v-container>

        <!-- Partie video/controle afficher lorsque le controle est initié -->
        <v-container :class='"slave"' fill-height v-show='isControlling'>
          
          <!-- div en overlay sur la video pour pouvoir assaigner les listeners du clavier -->
          <div id="overlay" class="slave-overlay" tabindex="1">
          
            <span class='slave-latency' v-if='isControlling'>latency: {{latency}}</span>
          
            <!-- Video qui reçoit le stream pour afficher l'écran du slave -->
            <video class='slave-video' :class='{fullscreen: isFullscreen}' id='video'></video>
          
          </div>
        </v-container>

      </v-content>
    </template>
  </v-app>
</template>

<script>
import CardSlave from "@/components/CardSlave";
import SettingsDialog from "@/components/SettingsDialog";

import MasterSocketConnection from "@/core/MasterSocketConnection";
import DesktopController from "@/core/DesktopController";
import Slave from "@/core/Slave";

export default {
  name: "app",
  components: {
    CardSlave,
    SettingsDialog
  },
  data: () => ({
    /**
     * @type {MasterSocketConnection}
     * Instance de la classe MasterSocketConnection
     */
    socketConnection: null,
    /**
     * @type {Boolean}
     * true lorsque le socket est connecté et authentifié
     */
    isAuthenticated: false,
    /**
     * @type {Boolean}
     * Instance de la classe Desktop Controller
     */
    desktopController: null,
    /**
     * ID du slave controllé, -1 si aucun
     * @type Number
     */
    currentSlaveID: -1,
    /** 
     * @type {Slave[]}
     * Liste des slaves chargés depuis le serveur
     */
    slaves: [],
    /**
     * @type {Number}
     * Garde la latence (en ms) d'un seul message entre le master slave
     * mis à jour toutes les 1000ms
     */
    latency: 0,
    /**
     * @type {Boolean}
     */
    isFullscreen: false
  }),
  computed: {
    /**
     * @return {Boolean} le master est considéré en mode controle si l'ID du slave est !== -1
     */
    isControlling() {
      return this.currentSlaveID !== -1;
    },
    /**
     * @return {Slave} (à partir de la classe Slave)
     */
    currentSlave() {
      if (this.isControlling) return Slave.getSlaveById(this.currentSlaveID);

      return null;
    }
  },
  /** Methode executée au chargement de la page */
  mounted() {
    this.connect({
      socketURL: `${window.SERVER_URL}`
    });
  },
  methods: {
    /**
     * Relance la connexion au slave si en mode controlle
     * Recharge la page sinon
     */
    refresh() {
      if (this.isControlling) {
        this.socketConnection.disconnectWebRTC();
        this.initControlConnection({ slave_id: this.currentSlaveID });
      } else {
        window.location.reload();
      }
    },
    /**
     *  
     */
    toggleFullScreen() {
      if (
        (document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)
      ) {
        this.isFullscreen = true;
        if (document.documentElement.requestFullScreen) {
          document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        this.isFullscreen = false;
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    /**
     * Crée une nouvelle instance de MasterSocketConnection et l'authentifie
     * Ajoute un listener pour charger la liste des slaves 
     * @param {String} config.socketURL: l'url du serveur socket
     */
    connect({ socketURL }) {
      this.socketConnection = new MasterSocketConnection(
        window.MASTER_ID,
        socketURL,
        window.AUTH_TOKEN
      );
      this.socketConnection.sendAuthentication(data => {
        this.isAuthenticated = true;
        this.loadSlaves(data);
      });
      this.socketConnection.onSlaveList(data => {
        if (this.isControlling) return;
        this.loadSlaves(data);
      });
    },
    /**
     * Charge la liste des slaves dans Slave.slave_list
     */
    loadSlaves({ slave_list }) {
      Slave.updateSlavesList(slave_list);
      this.$set(this, "slaves", Slave.getSlaves());
    },
    /**
     * Initie la connexion avec une machine slave en envoyant une control_request
     * 
     */
    initControlConnection({ slave_id }) {
      this.socketConnection.sendControlRequest(slave_id, controlResponse => {
        this.onControlResponse(controlResponse, slave_id);
      });
    },
    /**
     * Action executée lorsque une control_reponse est reçue du Slave :
     * - Enregistre l'ID du slave et charge les specifications de la machine (résolution)
     * - Ajoute un listener pour capturer le stream de la machine Slave 
     */
    onControlResponse(controlResponse, slave_id) {
      this.currentSlaveID = String(slave_id);

      Slave.getSlaveById(this.currentSlaveID).setSpecs({
        resolution: controlResponse.resolution
      });

      this.socketConnection.onStream(this.startDesktopControl);
    },
    /**
     * Instancie le DesktopController et assigne les differents listeners des souris/clavier
     */
    startDesktopControl(stream) {
      const video = document.getElementById("video");
      const overlay = document.getElementById("overlay");

      if (this.desktopController) {
        this.desktopController.stream = stream;
        return;
      }

      this.desktopController = new DesktopController({
        stream: stream,
        $html: { video, overlay },
        socketConnection: this.socketConnection,
        slave: Slave.getSlaveById(this.currentSlaveID)
      });

      this.desktopController.registerEventListeners(event => {
        this.socketConnection.sendIOEvent(event);
      });

      setInterval(() => {
        if (this.isControlling) this.getLatency();
      }, 1000);
    },
    /**
     * Ferme la connexion WebRTC et remet l'état à non control ( currentSlaveID == -1 )
     */
    stopDesktopControl() {
      this.socketConnection.disconnectWebRTC();
      this.currentSlaveID = -1;
    },
    /**
     * 
     */
    getLatency() {
      this.socketConnection.getLatency(latency => (this.latency = latency));
    }
  }
};
</script>

<style>
html,
body {
  height: 100vh;
  width: 100vw;
}
.slave {
  position: relative;
  margin: auto;
  padding: 0;
  min-width: 100%;
  min-height: 100%;
}
.slave-overlay {
  position: relative;
  display: block;
  outline: none;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
}
.slave-latency {
  position: relative;
  top: 6px;
  left: 5px;
  z-index: 1;
  color: red;
  font-weight: bold;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.slave-video {
  position: absolute;
  display: block;
  max-width: 100%;
  max-height: 100%;
  padding: 0;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
}
.fullscreen {
  min-height: 100%;
}
</style>
