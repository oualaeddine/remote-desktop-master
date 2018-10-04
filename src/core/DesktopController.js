import MasterSocketConnection from "./MasterSocketConnection";

/**
 *
 */
class DesktopController {
  /**
   *
   * @param {MediaStream} param.stream Stream received from Slave
   * @param {Array<Element>} param.$html contains the video element and its overlay
   * @param {MasterSocketConnection} param.socketConnection
   * @param {Slave} param.slave
   */
  constructor({ stream, $html, socketConnection, slave }) {
    this._stream = stream;
    this._$video = $html.video;
    this._$overlay = $html.overlay;
    this._socketConnection = socketConnection;
    this._slave = slave;

    console.log("Initiated Desktop controller", this);
    this.stream = this._stream;

    this._socketConnection.onData(data => {
      console.log("got data", String(data));
    });
  }

  get video() {
    return this._$video;
  }

  set stream(stream) {
    this._$video.pause();
    this._stream = stream;
    this._$video.srcObject = this._stream;
    this._$video.play();
  }

  registerEventListeners(sendIOEvent) {
    this._lastMouseMove = Date.now();
    if (!this._eventsRegistred) {
      this.onMouseMove(sendIOEvent);
      this.onMouseClick(sendIOEvent);
      this.onKeyTap(sendIOEvent);
      // this.onMouseToggle(sendIOEvent);
      // this.onMouseScroll(sendIOEvent);
      // this.onKeyPress(sendIOEvent);
      // this.onKeyToggle(sendIOEvent);
    }
    this._eventsRegistred = true;
  }

  makeMouseEvent(payload) {
    return {
      type: "MOUSE_EVENT",
      payload: payload
    };
  }

  makeKeyboardEvent(payload) {
    return {
      type: "KEYBOARD_EVENT",
      payload: payload
    };
  }

  getMousePos(mouse_relative_x, mouse_relative_y) {
    const videoHeight = this.video.clientHeight;
    const videoWidth = this.video.clientWidth;

    const slaveScreenWidth = this._slave.resolution.width;
    const slaveScreenHeight = this._slave.resolution.height;

    const x = (mouse_relative_x / videoWidth) * slaveScreenWidth;
    const y = (mouse_relative_y / videoHeight) * slaveScreenHeight;
    return { x, y };
  }

  onMouseMove(callback) {
    this._$overlay.addEventListener("mousemove", e => {
      const mouse_relative_x = e.pageX - this.video.offsetLeft;
      const mouse_relative_y = e.pageY - this.video.offsetTop;

      const { x, y } = this.getMousePos(mouse_relative_x, mouse_relative_y);

      let event = {
        event: "MOUSE_MOVE",
        payload: {
          x,
          y
        }
      };

      if (Date.now() - this._lastMouseMove >= 30) {
        callback(this.makeMouseEvent(event));
        this._lastMouseMove = Date.now();
      }
    });
  }

  onMouseToggle() {}

  onMouseClick(callback) {
    this._$overlay.addEventListener("mousedown", e => {
      const mouse_relative_x = e.clientX - this.video.offsetLeft;
      const mouse_relative_y = e.clientY - this.video.offsetTop;

      const { x, y } = this.getMousePos(mouse_relative_x, mouse_relative_y);

      let event = {
        event: "MOUSE_DOWN",
        payload: {
          x,
          y,
          button: "left"
        }
      };

      callback(this.makeMouseEvent(event));
    });

    this._$overlay.addEventListener("mouseup", e => {
      const mouse_relative_x = e.clientX - this.video.offsetLeft;
      const mouse_relative_y = e.clientY - this.video.offsetTop;

      const { x, y } = this.getMousePos(mouse_relative_x, mouse_relative_y);
      console.log("up");
      let event = {
        event: "MOUSE_UP",
        payload: {
          x,
          y,
          button: "left"
        }
      };

      callback(this.makeMouseEvent(event));
    });
  }

  onKeyTap(callback) {
    this._$overlay.addEventListener("keydown", e => {
      console.log(e.key);
      let event = {
        event: "KEY_DOWN",
        payload: {
          key: e.key,
          keyCode: e.keyCode,
          modifier: "NONE" /// TODO: send modifiers
        }
      };

      callback(this.makeKeyboardEvent(event));
    });

    this._$overlay.addEventListener("keyup", e => {
      console.log(e.key);
      let event = {
        event: "KEY_UP",
        payload: {
          key: e.key,
          keyCode: e.keyCode,
          modifier: "NONE" /// TODO: send modifiers
        }
      };

      callback(this.makeKeyboardEvent(event));
    });
  }

  onMouseScroll() {}

  onKeyPress() {}

  onKeyToggle() {}
}

export default DesktopController;
