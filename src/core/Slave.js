class Slave {
  static slaves_list = [];

  constructor({ id, connected, reserved, preview }) {
    this.ID = String(id);
    this.name = `Machine N°${id}`;
    this.isConnected = connected && !reserved;
    this.slave_state = null;
    this._resolution = null;
    this._preview = preview;
  }

  get preview() {
    return this._preview || "";
  }
  get resolution() {
    return this._resolution || { height: 0, width: 0 };
  }
  setSpecs({ resolution }) {
    this._resolution = resolution;
  }

  static exists(id) {
    return Slave.slaves_list.map(s => s.ID).indexOf(id) >= 0;
  }
  static getSlaves = () => {
    console.log(Slave.slaves_list);
    return Slave.slaves_list;
  };
  static createSlave(data) {
    if (!Slave.exists(data.id)) {
      const slave = new Slave(data);
      Slave.slaves_list.push(slave);
      return slave;
    } else {
      console.warn("duplicated slave found");
    }
  }
  static removeSlave(slave) {
    const index = Slave.slaves_list.indexOf(slave);
    delete Slave.slaves_list[index];
  }
}

export default Slave;
