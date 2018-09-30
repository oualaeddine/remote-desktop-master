class Slave {
  constructor({ ID }) {
    this.ID = ID;
    this.slave_state = null;
    this._resolution = null;
  }

  setSpecs({ resolution }) {
    this._resolution = resolution;
  }

  get resolution() {
    return this._resolution || { height: 0, width: 0 };
  }
}

export default Slave;
