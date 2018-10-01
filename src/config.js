export const URL = "http://rdesktop.daddou.me";
export const PORT = "3000";
export const DEFAULT_ICE_SERVERS = [
  {
    urls: "stun:daddou.me"
  },
  {
    urls: "turn:daddou.me",
    credential: "root",
    username: "root"
  }
];