import SimplePeer from "simple-peer";

const _DEFAULT_ICE_SERVERS = [
  {
    urls: "stun:http://rdesktop.daddou.me"
  },
  {
    urls: "turn:http://rdesktop.daddou.me",
    credential: "root",
    username: "root"
  }
];

class PeerConnection {
  static get DEFAULT_ICE_SERVERS() {
    return _DEFAULT_ICE_SERVERS;
  }

  /**
   *
   * @param {SocketIO} socket
   * @param {Object} config Simple peer config
   */
  constructor({ iceServers }, onSignal) {
    this._peer = new SimplePeer({
      initiator: true,
      stream: false,
      iceTransportPolicy: "relay",
      config: {
        iceServers: iceServers
      },
      offerConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      }
    });
    this._connected = false;
    this.onSignal(onSignal);

    this.onData(() =>
      console.warn("No Data listener registred for this peer connection")
    );
    this.onStream(() =>
      console.warn("No Stream listener registred for this peer connection")
    );

    this.peer.on("connect", () => {
      console.log("PEER CONNECTION ESTABLISHED");
      this._connected = true;
    });
  }

  get connected() {
    return this.peer && this._connected;
  }

  get peer() {
    return this._peer;
  }

  signal(signal) {
    this.peer.signal(signal);
  }

  send(data) {
    if (this.connected) {
      this.peer.send(JSON.stringify(data));
    } else {
      console.warn("attemping to send data before connecting", data);
    }
  }

  onSignal(onSignal) {
    this.peer.on("signal", onSignal);
  }

  onStream(onStream) {
    this.peer.on("stream", stream => {
      if (this._stream) {
        this.peer.removeStream(this._stream);
      }
      this._stream = stream;
      this.peer.addStream(this._stream);
      onStream(this._stream);
    });
  }

  onData(onData) {
    this.peer.on("data", onData);
  }
}

export default PeerConnection;
