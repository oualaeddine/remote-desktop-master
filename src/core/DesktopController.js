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
      this.onMouseScroll(sendIOEvent);
      // this.onKeyPress(sendIOEvent);
      // this.onKeyToggle(sendIOEvent);
      this._$overlay.addEventListener("contextmenu", event =>
        event.preventDefault()
      );
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

  _getElementOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }

  getMousePos(e) {
    const mouse_relative_x = e.pageX - this._getElementOffset(this.video).left;
    const mouse_relative_y = e.pageY - this._getElementOffset(this.video).top;

    const videoHeight = this.video.clientHeight;
    const videoWidth = this.video.clientWidth;

    const slaveScreenWidth = this._slave.resolution.width;
    const slaveScreenHeight = this._slave.resolution.height;

    const x = (mouse_relative_x / videoWidth) * slaveScreenWidth;
    const y = (mouse_relative_y / videoHeight) * slaveScreenHeight;
    return { x, y };
  }

  onMouseMove(callback) {
    this._$video.addEventListener("mousemove", e => {
      const { x, y } = this.getMousePos(e);

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

  onMouseClick(callback) {
    this._$video.addEventListener("mousedown", e => {
      const { x, y } = this.getMousePos(e);
      let event = {
        event: "MOUSE_DOWN",
        payload: {
          x,
          y,
          button: ["left", "middle", "right"][e.button]
        }
      };

      callback(this.makeMouseEvent(event));
    });

    this._$video.addEventListener("mouseup", e => {
      const { x, y } = this.getMousePos(e);
      let event = {
        event: "MOUSE_UP",
        payload: {
          x,
          y,
          button: ["left", "middle", "right"][e.button]
        }
      };

      callback(this.makeMouseEvent(event));
    });
  }

  onKeyTap(callback) {
    this._$overlay.addEventListener("keydown", e => {
      e.preventDefault();

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
      e.preventDefault();
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

  onMouseScroll(callback) {
    this._$video.addEventListener("mousewheel", e => {
      let event = {
        event: "MOUSE_SCROLL",
        payload: {
          x: e.deltaX,
          y: -e.deltaY
        }
      };

      callback(this.makeMouseEvent(event));
    });
  }

  onKeyPress() {}

  onKeyToggle() {}
}

export default DesktopController;
