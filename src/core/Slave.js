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

  update({ connected, reserved, preview }) {
    this._preview = preview;
    this.isConnected = connected && !reserved;
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

  static updateSlavesList(slave_list) {
    Slave.slaves_list = [];
    slave_list.forEach(slave => {
      if (!!slave.id) {
        if (Slave.exists(slave.id)) {
          this.getSlaveById(slave.id).update(slave);
        } else {
          Slave.createSlave(slave);
        }
      }
    });
  }

  static exists(id) {
    return Slave.slaves_list.map(s => s.ID).indexOf(id) >= 0;
  }
  static getSlaves() {
    return Slave.slaves_list;
  }

  static getSlaveById(id) {
    return Slave.slaves_list.find(s => s.ID == id);
  }
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
