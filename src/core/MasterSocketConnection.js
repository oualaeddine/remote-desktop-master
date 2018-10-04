import PeerConnection from "./PeerConnection";
import SocketIO from "socket.io-client";

class MasterSocketConnection {
  constructor(socketURL) {
    this._host = socketURL;
    this.connect();
    this.peerConnection = null;
  }

  connect() {
    this._socket = SocketIO(this._host);

    this._socket.on("connect", () => {
      this._socket.on("control_response", controlResponse => {
        this.peerConnection.signal(controlResponse.sdpAnswer);
        if (typeof this._onControlResponse === "function") {
          this._onControlResponse(controlResponse);
        }
      });

      this._socket.on("disconnect", () => {
        setTimeout(() => {
          this.reconnect();
        }, 1000); // reconnect after 1 second
      });

      this._socket.on("error", () => {
        setTimeout(() => {
          this.reconnect();
        }, 1000); // reconnect after 1 second
      });
    });
  }

  reconnect() {
    if (this._socket) {
      this._socket.destroy();
      delete this._socket;
      this._socket = null;
    }
    console.log("reconnecting");
    this.connect();
  }

  get connected() {
    return this.peerConnection && this.peerConnection.connected;
  }
  get stream() {
    return this.peerConnection.stream;
  }

  get socket() {
    return this._socket;
  }
  set socket(socket) {
    this._socket = socket;
  }
  sendAuthentication(onAuthDone) {
    this.socket.emit("authentication", {
      id: "1",
      token: "MA3EAD8FE2F95644D2EDC3B1F974499",
      type: "master"
    });
    this.socket.on("authentication_done", data => {
      this._iceServers = data.iceServers;
      onAuthDone(data);
    });
  }
  sendData(data) {
    this.peerConnection.send(data);
  }
  sendIOEvent(event) {
    this.peerConnection.send({
      type: "IO_EVENT",
      payload: event
    });
  }
  sendControlRequest(slave_id, onControlResponse) {
    console.log("sending control_request", slave_id);

    if (this.peerConnection) this.peerConnection.destroy();
    this.peerConnection = new PeerConnection(
      { iceServers: this._iceServers || PeerConnection.DEFAULT_ICE_SERVERS },
      signal => {
        this.socket.emit("control_request", {
          slave_id: slave_id,
          sdpOffer: signal
        });
      }
    );

    // catch control response and signal back
    this.onControlResponse(controlResponse => {
      console.log("got control response", controlResponse);
      if (!this.connected) {
        onControlResponse(controlResponse);
      }
    });
  }
  onConnect(callback) {
    this.socket.on("connect", callback);
  }
  onControlResponse(callback) {
    this._onControlResponse = callback;
  }
  onData(callback) {
    if (this.peerConnection) this.peerConnection.onData(callback);
  }
  onStream(callback) {
    if (this.peerConnection) this.peerConnection.onStream(callback);
  }
  onSlaveList(callback) {
    this._socket.on("slave_list", callback);
  }
}

export default MasterSocketConnection;
