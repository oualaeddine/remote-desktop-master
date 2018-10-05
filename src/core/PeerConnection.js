import SimplePeer from "simple-peer";

import { DEFAULT_ICE_SERVERS } from "@/config.js";

class PeerConnection {
  static get DEFAULT_ICE_SERVERS() {
    return DEFAULT_ICE_SERVERS;
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
      trickle: true,
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

    onSignal(onSignal);
    this._peer.on("signal", onSignal);

    this._peer.on("data", data => {
      if (typeof this._onDataCallback === "function") {
        this._onDataCallback(JSON.parse(String(data)));
      } else {
        console.warn("No Data listener registred for this peer connection");
      }
    });

    this._peer.on("connect", () => {
      console.log("PEER CONNECTION ESTABLISHED");
      this._connected = true;
    });

    this._peer.on("stream", stream => {
      this._stream = stream;
      if (typeof this._onStreamCallback === "function") {
        this._onStreamCallback(stream);
      } else {
        console.warn("No Stream listener registred for this peer connection");
      }
    });

    this.onData(({ type, payload }) => {
      switch (type) {
        case "PING":
          this.send({
            type: "PONG",
            payload: payload
          });
          break;
        case "PONG":
          if (typeof this._onPongCallback === "function") {
            this._onPongCallback(payload);
          } else {
            console.warn("No Pong listener registred for this peer connection");
          }
          break;
        default:
          console.warn("unknown data type received by peer");
      }
    });
  }

  get sdpOffer() {
    return this._sdpOffer;
  }

  get connected() {
    return this._peer && this._connected;
  }

  get stream() {
    return this._stream;
  }

  signal(signal) {
    this._peer.signal(signal);
  }

  send(data) {
    if (this.connected) {
      if (
        this._peer._channel !== null &&
        this._peer._channel.readyState === "open"
      ) {
        this._peer.send(JSON.stringify(data));
      } else {
        console.warn("channel not open :o ");
      }
    } else {
      console.warn("attemping to send data before connecting", data);
    }
  }

  onSignal(onSignal) {
    this._onSignalCallback = onSignal;
  }

  onData(onData) {
    this._onDataCallback = onData;
  }

  onStream(onStream) {
    this._onStreamCallback = onStream;
  }
  onPong(onPong) {
    this._onPongCallback = onPong;
  }

  destroy() {
    if (this._peer) {
      this._peer.destroy();
      this._peer = null;
    }
  }
}

export default PeerConnection;
