import PeerConnection from "./PeerConnection";
import SocketIO from "socket.io-client";

class MasterSocketConnection {
  constructor({ host }) {
    this._socket = SocketIO(host);
    // this.socket.on("connect", () => {});

    this.onConnect(() => {
      this.onStream(() =>
        console.log("No stream listener set for this connection")
      );
      this.onData(() =>
        console.log("No data listener set for this connection")
      );
    });
    // this.onControlResponse();
  }

  get connected() {
    return this.peerConnection && this.peerConnection.connected;
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
    this.socket.on("authentication_done", onAuthDone);
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
    console.log("sending control request", slave_id);
    // init peer
    this.peerConnection = new PeerConnection(
      PeerConnection.DEFAULT_ICE_SERVERS,
      signal => {
        if (!this.connected) {
          this.socket.emit("control_request", {
            slave_id: slave_id,
            sdpOffer: signal
          });
        }
      }
    );
    // catch control response and signal back
    this.onControlResponse(controlResponse => {
      if (!this.connected) {
        console.log("signal back", controlResponse);
        this.peerConnection.signal(controlResponse.sdpAnswer);
        onControlResponse(controlResponse);
      }
    });
  }
  onConnect(callback) {
    this.socket.on("connect", callback);
  }
  onControlResponse(callback) {
    this.socket.on("control_response", callback);
  }
  onData(callback) {
    if (this.peerConnection) this.peerConnection.onData(callback);
  }
  onStream(callback) {
    if (this.peerConnection) this.peerConnection.onStream(callback);
  }
}

export default MasterSocketConnection;
